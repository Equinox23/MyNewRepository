import * as THREE from 'three';

// ===========================================================================
// Post-traitement maison (aucune dependance) :
//  1. la scene est rendue dans une cible HDR (les sorts, cristaux, lucioles
//     et reflets depassent 1.0) avec anti-crenelage ;
//  2. halo lumineux (bloom) : les zones tres claires sont extraites, floutees
//     en cascade (1/2 -> 1/16) puis rajoutees a l image ;
//  3. etalonnage : saturation, contraste, teinte des ombres / lumieres
//     propres a chaque carte, vignette, conversion sRGB.
// ===========================================================================

const VERT = `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

// Extraction des hautes lumieres + reduction (4 echantillons bilineaires).
const PREFILTER = `
precision highp float;
varying vec2 vUv;
uniform sampler2D tMap; uniform vec2 uTexel; uniform float uThreshold; uniform float uKnee;
vec3 pick(vec2 uv) {
  vec3 c = min(texture2D(tMap, uv).rgb, vec3(6.0));
  float br = max(c.r, max(c.g, c.b));
  float soft = clamp(br - uThreshold + uKnee, 0.0, 2.0 * uKnee);
  soft = soft * soft / (4.0 * uKnee + 1e-4);
  float w = max(soft, br - uThreshold) / max(br, 1e-4);
  return c * w;
}
void main() {
  vec2 o = uTexel;
  vec3 c = pick(vUv + vec2(-o.x, -o.y)) + pick(vUv + vec2(o.x, -o.y)) + pick(vUv + vec2(-o.x, o.y)) + pick(vUv + vec2(o.x, o.y));
  gl_FragColor = vec4(c * 0.25, 1.0);
}`;

const DOWN = `
precision highp float;
varying vec2 vUv;
uniform sampler2D tMap; uniform vec2 uTexel;
void main() {
  vec2 o = uTexel;
  vec3 c = texture2D(tMap, vUv).rgb * 4.0;
  c += texture2D(tMap, vUv + vec2(-o.x, -o.y)).rgb + texture2D(tMap, vUv + vec2(o.x, -o.y)).rgb;
  c += texture2D(tMap, vUv + vec2(-o.x, o.y)).rgb + texture2D(tMap, vUv + vec2(o.x, o.y)).rgb;
  gl_FragColor = vec4(c / 8.0, 1.0);
}`;

// Agrandissement "tente" (9 echantillons), additionne au niveau superieur.
const UP = `
precision highp float;
varying vec2 vUv;
uniform sampler2D tMap; uniform vec2 uTexel;
void main() {
  vec2 o = uTexel;
  vec3 c = texture2D(tMap, vUv).rgb * 4.0;
  c += (texture2D(tMap, vUv + vec2(-o.x, 0.0)).rgb + texture2D(tMap, vUv + vec2(o.x, 0.0)).rgb
      + texture2D(tMap, vUv + vec2(0.0, -o.y)).rgb + texture2D(tMap, vUv + vec2(0.0, o.y)).rgb) * 2.0;
  c += texture2D(tMap, vUv + vec2(-o.x, -o.y)).rgb + texture2D(tMap, vUv + vec2(o.x, -o.y)).rgb
     + texture2D(tMap, vUv + vec2(-o.x, o.y)).rgb + texture2D(tMap, vUv + vec2(o.x, o.y)).rgb;
  gl_FragColor = vec4(c / 16.0, 1.0);
}`;

const COMPOSITE = `
precision highp float;
varying vec2 vUv;
uniform sampler2D tScene; uniform sampler2D tBloom;
uniform float uBloom; uniform float uSaturation; uniform float uContrast; uniform float uExposure;
uniform vec3 uShadowTint; uniform vec3 uLightTint; uniform vec3 uVignetteColor; uniform float uVignette;
uniform float uAspect;
vec3 toSRGB(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c));
}
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec3 c = texture2D(tScene, vUv).rgb;
  vec3 b = texture2D(tBloom, vUv).rgb;
  c += b * uBloom;
  c *= uExposure;
  // Les valeurs au-dela de 1 sont comprimees en douceur (pas de blanc brule).
  c = mix(c, 1.0 - exp(-c), smoothstep(0.75, 1.6, max(c.r, max(c.g, c.b))));
  vec3 s = toSRGB(c);
  float l = dot(s, vec3(0.299, 0.587, 0.114));
  // Teinte : ombres et lumieres colorees separement.
  s *= mix(uShadowTint, uLightTint, smoothstep(0.05, 0.85, l));
  s = mix(vec3(l), s, uSaturation);
  s = (s - 0.5) * uContrast + 0.5;
  // Vignette douce.
  vec2 q = (vUv - 0.5) * vec2(min(uAspect, 1.6), 1.0);
  float v = smoothstep(0.42, 1.05, length(q));
  s = mix(s, s * uVignetteColor, v * uVignette);
  // Tramage leger contre les bandes de degrade.
  s += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
  gl_FragColor = vec4(clamp(s, 0.0, 1.0), 1.0);
}`;

// Ambiance colorimetrique de chaque theme de carte.
export const GRADES = {
  forest:    { bloom: 0.75, saturation: 1.12, contrast: 1.06, exposure: 1.0, shadow: 0xeaf0ff, light: 0xfff6e2, vignette: 0.55, vignetteColor: 0x4a5a30 },
  river:     { bloom: 0.8, saturation: 1.12, contrast: 1.05, exposure: 1.0, shadow: 0xe6f2ff, light: 0xfffaee, vignette: 0.5, vignetteColor: 0x3a5a6a },
  graveyard: { bloom: 1.1, saturation: 0.95, contrast: 1.1, exposure: 0.98, shadow: 0xd8dcff, light: 0xf2ecff, vignette: 0.8, vignetteColor: 0x1e1a3a },
  cliff:     { bloom: 0.7, saturation: 1.1, contrast: 1.05, exposure: 1.02, shadow: 0xe8ecff, light: 0xfff2d8, vignette: 0.45, vignetteColor: 0x6a5a3a },
  swamp:     { bloom: 0.95, saturation: 1.02, contrast: 1.08, exposure: 0.98, shadow: 0xdcecd0, light: 0xf8f8d8, vignette: 0.7, vignetteColor: 0x24301a },
};

export class PostFX {
  constructor(renderer) {
    this.renderer = renderer;
    const gl = renderer.getContext();
    const ext = renderer.extensions;
    this.hdr = !!(renderer.capabilities.isWebGL2 && (ext.has('EXT_color_buffer_float') || ext.has('EXT_color_buffer_half_float')));
    this.type = this.hdr ? THREE.HalfFloatType : THREE.UnsignedByteType;
    this.samples = renderer.capabilities.isWebGL2 ? Math.min(4, gl.getParameter(gl.MAX_SAMPLES) || 0) : 0;
    this.levels = 4;
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
    this.quad.frustumCulled = false;
    this.scene.add(this.quad);
    const mk = (frag, uniforms, extra = {}) => new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false, ...extra,
    });
    this.mPre = mk(PREFILTER, { tMap: { value: null }, uTexel: { value: new THREE.Vector2() }, uThreshold: { value: this.hdr ? 0.98 : 0.86 }, uKnee: { value: 0.12 } });
    this.mDown = mk(DOWN, { tMap: { value: null }, uTexel: { value: new THREE.Vector2() } });
    this.mUp = mk(UP, { tMap: { value: null }, uTexel: { value: new THREE.Vector2() } }, { blending: THREE.AdditiveBlending, transparent: true });
    this.mOut = mk(COMPOSITE, {
      tScene: { value: null }, tBloom: { value: null },
      uBloom: { value: 0.8 }, uSaturation: { value: 1.1 }, uContrast: { value: 1.05 }, uExposure: { value: 1 },
      uShadowTint: { value: new THREE.Color(1, 1, 1) }, uLightTint: { value: new THREE.Color(1, 1, 1) },
      uVignetteColor: { value: new THREE.Color(0.2, 0.25, 0.15) }, uVignette: { value: 0.5 }, uAspect: { value: 1 },
    });
    this.targets = [];
    this.rtScene = null;
    this.setGrade('forest');
  }

  setGrade(style) {
    const g = GRADES[style] || GRADES.forest;
    const u = this.mOut.uniforms;
    u.uBloom.value = g.bloom;
    u.uSaturation.value = g.saturation;
    u.uContrast.value = g.contrast;
    u.uExposure.value = g.exposure;
    // Teintes appliquees en espace ecran : on garde les valeurs sRGB telles quelles.
    u.uShadowTint.value.setHex(g.shadow, THREE.LinearSRGBColorSpace);
    u.uLightTint.value.setHex(g.light, THREE.LinearSRGBColorSpace);
    u.uVignetteColor.value.setHex(g.vignetteColor, THREE.LinearSRGBColorSpace);
    u.uVignette.value = g.vignette;
  }

  setSize(w, h, pixelRatio) {
    const W = Math.max(2, Math.round(w * pixelRatio)), H = Math.max(2, Math.round(h * pixelRatio));
    if (this.rtScene && this.rtScene.width === W && this.rtScene.height === H) return;
    this.dispose();
    this.rtScene = new THREE.WebGLRenderTarget(W, H, {
      type: this.type, samples: this.samples, depthBuffer: true,
      minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    });
    let tw = W, th = H;
    for (let i = 0; i < this.levels; i++) {
      tw = Math.max(2, Math.round(tw / 2)); th = Math.max(2, Math.round(th / 2));
      this.targets.push(new THREE.WebGLRenderTarget(tw, th, {
        type: this.type, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
      }));
    }
    this.mOut.uniforms.uAspect.value = W / H;
  }

  dispose() {
    if (this.rtScene) this.rtScene.dispose();
    this.targets.forEach(t => t.dispose());
    this.targets = [];
    this.rtScene = null;
  }

  _pass(material, target) {
    this.quad.material = material;
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.scene, this.camera);
  }

  render(scene, camera) {
    const r = this.renderer;
    if (!this.rtScene) return r.render(scene, camera);
    r.setRenderTarget(this.rtScene);
    r.render(scene, camera);
    const autoClear = r.autoClear;
    // 1. Hautes lumieres -> 1/2.
    const t = this.targets;
    this.mPre.uniforms.tMap.value = this.rtScene.texture;
    this.mPre.uniforms.uTexel.value.set(0.5 / t[0].width, 0.5 / t[0].height);
    this._pass(this.mPre, t[0]);
    // 2. Reductions successives.
    for (let i = 1; i < t.length; i++) {
      this.mDown.uniforms.tMap.value = t[i - 1].texture;
      this.mDown.uniforms.uTexel.value.set(1 / t[i - 1].width, 1 / t[i - 1].height);
      this._pass(this.mDown, t[i]);
    }
    // 3. Remontee additive : chaque niveau recoit le niveau plus flou.
    r.autoClear = false;
    for (let i = t.length - 1; i > 0; i--) {
      this.mUp.uniforms.tMap.value = t[i].texture;
      this.mUp.uniforms.uTexel.value.set(1 / t[i].width, 1 / t[i].height);
      this._pass(this.mUp, t[i - 1]);
    }
    r.autoClear = autoClear;
    // 4. Composition finale a l ecran.
    this.mOut.uniforms.tScene.value = this.rtScene.texture;
    this.mOut.uniforms.tBloom.value = t[0].texture;
    this._pass(this.mOut, null);
  }
}
