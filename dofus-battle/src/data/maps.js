// Definitions de maps. Une map = grille COLS x ROWS.
//  - 0 = case libre
//  - 1 = obstacle (mur, rocher)
//  - playerSpawns / enemySpawns: positions [c, r] pour placer les combattants

export const MAP_COLS = 15;
export const MAP_ROWS = 15;

function emptyGrid() {
  const g = [];
  for (let r = 0; r < MAP_ROWS; r++) {
    g.push(new Array(MAP_COLS).fill(0));
  }
  return g;
}

function withObstacles(positions) {
  const g = emptyGrid();
  for (const [c, r] of positions) {
    if (r >= 0 && r < MAP_ROWS && c >= 0 && c < MAP_COLS) g[r][c] = 1;
  }
  return g;
}

export const MAPS = {
  arene: {
    name: 'Arene',
    tiles: withObstacles([
      [7, 5], [7, 6], [7, 7], [7, 8], [7, 9],
      [4, 7], [10, 7],
      [3, 3], [11, 11], [3, 11], [11, 3],
    ]),
    playerSpawns: [[1, 7], [2, 5], [2, 9]],
    enemySpawns: [[13, 7], [12, 5], [12, 9]],
  },
  foret: {
    name: 'Foret',
    tiles: withObstacles([
      [4, 4], [5, 4], [4, 5],
      [10, 10], [11, 10], [10, 11],
      [4, 10], [5, 10], [4, 11],
      [10, 4], [11, 4], [10, 5],
      [7, 7],
    ]),
    playerSpawns: [[0, 0], [0, 7], [0, 14]],
    enemySpawns: [[14, 0], [14, 7], [14, 14]],
  },
  couloir: {
    name: 'Couloir',
    tiles: (() => {
      const g = emptyGrid();
      for (let c = 0; c < MAP_COLS; c++) {
        g[3][c] = 1;
        g[11][c] = 1;
      }
      g[3][3] = 0; g[3][7] = 0; g[3][11] = 0;
      g[11][3] = 0; g[11][7] = 0; g[11][11] = 0;
      return g;
    })(),
    playerSpawns: [[1, 7], [1, 5], [1, 9]],
    enemySpawns: [[13, 7], [13, 5], [13, 9]],
  },
};

export const MAP_LIST = Object.entries(MAPS).map(([id, m]) => ({ id, ...m }));
