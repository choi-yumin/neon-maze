class Cell {
  /**
   * @param {number} col
   * @param {number} row
   */
  constructor(col, row) {
    this.col = col;
    this.row = row;
    this.walls = { top: true, right: true, bottom: true, left: true };
    this.visited = false;
  }

  get x() {
    return this.col * CONFIG.CELL_W;
  }
  get y() {
    return this.row * CONFIG.CELL_H;
  }

  get centerX() {
    return this.x + CONFIG.CELL_W / 2;
  }
  get centerY() {
    return this.y + CONFIG.CELL_H / 2;
  }

  /**
   * @param {Cell[]} grid
   * @returns {Cell[]}
   */
  getUnvisitedNeighbors(grid) {
    const neighbors = [];
    const directions = [
      { dc: 0, dr: -1 }, // top
      { dc: 1, dr: 0 }, // right
      { dc: 0, dr: 1 }, // bottom
      { dc: -1, dr: 0 }, // left
    ];

    directions.forEach(({ dc, dr }) => {
      const idx = gridIndex(this.col + dc, this.row + dr);
      if (idx !== -1 && !grid[idx].visited) {
        neighbors.push(grid[idx]);
      }
    });

    return neighbors;
  }

  /**
   * @param {Cell} other
   */
  removeWallBetween(other) {
    const dx = other.col - this.col;
    const dy = other.row - this.row;

    if (dx === 1) {
      this.walls.right = false;
      other.walls.left = false;
    }
    if (dx === -1) {
      this.walls.left = false;
      other.walls.right = false;
    }
    if (dy === 1) {
      this.walls.bottom = false;
      other.walls.top = false;
    }
    if (dy === -1) {
      this.walls.top = false;
      other.walls.bottom = false;
    }
  }

  /**
   * @param {p5} p
   */
  draw(p) {
    const { x, y } = this;
    const w = CONFIG.CELL_W;
    const h = CONFIG.CELL_H;

    if (this.walls.top) drawNeonLine(p, x, y, x + w, y, CONFIG.COLORS.CYAN, 2);
    if (this.walls.right)
      drawNeonLine(p, x + w, y, x + w, y + h, CONFIG.COLORS.CYAN, 2);
    if (this.walls.bottom)
      drawNeonLine(p, x, y + h, x + w, y + h, CONFIG.COLORS.CYAN, 2);
    if (this.walls.left) drawNeonLine(p, x, y, x, y + h, CONFIG.COLORS.CYAN, 2);
  }

  /**
   * @param {string} direction
   * @returns {boolean}
   */
  hasWall(direction) {
    return this.walls[direction];
  }
}
