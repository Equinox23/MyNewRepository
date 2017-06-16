package Fonctions;

import java.awt.Dimension;
import java.awt.Image;
import javax.swing.ImageIcon;

public class ImageGalerie {
	private static String nomIcon = new String("");
	private Dimension dimIcon = new Dimension(100, 100);
	private static ImageIcon imgIcon;
	private int hintsIcon = Image.SCALE_DEFAULT; 
	private boolean stretch = true;
	private double zoom=1;
	private boolean zoomAuto=true;

	public ImageGalerie(){};
	
//	public ImageGalerie(String nomIcon, Dimension dimIcon){
//		this.setNomIcon(nomIcon, dimIcon);
//	}
	
//	public ImageGalerie(ImageIcon imgIcon, Dimension dimIcon){
//		this.setImgIconResized(imgIcon, dimIcon);
//	}
	
	public void setNomIcon(String nomIcon, Dimension dimIcon) {
		ImageGalerie.nomIcon = nomIcon;
		ImageIcon tmpImageIcon = new ImageIcon(nomIcon);
		this.setImgIconResized(tmpImageIcon,dimIcon);
	}


	public ImageIcon setImgIconResized(ImageIcon tmpImageIcon, Dimension dimIcon) {
		this.setDimIcon(dimIcon) ;
		Image tmpImage = tmpImageIcon.getImage();
		int w,h;
		if(zoomAuto==true){
			double rapp = (double)tmpImageIcon.getIconWidth()/(double)tmpImageIcon.getIconHeight(); 
			if(rapp<1.0)
				zoom=1.0/rapp;
			else
				zoom=rapp;
			w = (int) (dimIcon.width*zoom);
			h = (int) (dimIcon.height*zoom);
		}
		else {
			w = (int) (dimIcon.width);//*zoom);
			h = (int) (dimIcon.height);//*zoom);
		}
		if (isStretch()==true){
			try {
				if(tmpImageIcon.getIconWidth()>tmpImageIcon.getIconHeight() 
						&& (tmpImageIcon.getIconWidth()/tmpImageIcon.getIconHeight())>(dimIcon.width/dimIcon.height)) 
					h = -1; // orientation paysage
				else
					w = -1;// orientation portrait
			} catch (Exception e) {
				e.printStackTrace();
				return null;
			}
		}
		tmpImage = tmpImage.getScaledInstance(w, h,hintsIcon);
		ImageIcon tmpResized = new ImageIcon(tmpImage);
		this.setImgIcon(tmpResized);
		return  tmpResized;
	}
	/**
	 * @return the zoomAuto
	 */
	public boolean isZoomAuto() {
		return zoomAuto;
	}
	/**
	 * @param zoomAuto the zoomAuto to set
	 */
	public void setZoomAuto(boolean zoomAuto) {
		this.zoomAuto = zoomAuto;
	}
	/**
	 * @return the stretch
	 */
	public boolean isStretch() {
		return stretch;
	}
	/**
	 * @param stretch the stretch to set
	 */
	public void setStretch(boolean stretch) {
		this.stretch = stretch;
	}
	/**
	 * @return the zoom
	 */
	public double getZoom() {
		return zoom;
	}
	/**
	 * @param zoom the zoom to set
	 */
	public void setZoom(double zoom) {
		this.zoom = zoom;
	}
	/**
	 * @return the nomIcon
	 */
	public static String getNomIcon() {
		return nomIcon;
	}
	/**
	 * @return the dimIcon
	 */
	public Dimension getDimIcon() {
		return dimIcon;
	}
	/**
	 * @param dimIcon the dimIcon to set
	 */
	public void setDimIcon(Dimension dimIcon) {
		this.dimIcon = dimIcon;
	}
	/**
	 * @return the imgIcon
	 */
	public static ImageIcon getImgIcon() {
		return imgIcon;
	}
	/**
	 * @param imgIcon the imgIcon to set
	 */
	public void setImgIcon(ImageIcon imgIcon) {
		ImageGalerie.imgIcon = imgIcon;
	}

}
