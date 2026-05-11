class MazeGenerator {
  constructor() {
    this.grid = [];
  }

  /**
   * @returns {Cell[]}
   */
  generate() {
    this.grid = this._createGrid();
    this._carve();
    this._ensureSolvable();
    return this.grid;
  }

  _createGrid() {
    return Array.from(
      { length: CONFIG.COLS * CONFIG.ROWS },
      (_, i) => new Cell(i % CONFIG.COLS, Math.floor(i / CONFIG.COLS)),
    );
  }

  /**
   * @private
   */
  _carve() {
    const stack = [];
    const start = this.grid[0];
    start.visited = true;
    stack.push(start);

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = current.getUnvisitedNeighbors(this.grid);

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        current.removeWallBetween(next);
        next.visited = true;
        stack.push(next);
      } else {
        stack.pop();
      }
    }

    this.grid.forEach((cell) => (cell.visited = false));
  }

  /**
   * @private
   */
  _ensureSolvable() {
    const path = this.findPath(0, 0, CONFIG.COLS - 1, CONFIG.ROWS - 1);
    if (path) return;

    const visited = new Set();
    const queue = [this.grid[0]];
    visited.add(this.grid[0]);

    while (queue.length > 0) {
      const current = queue.shift();
      const neighbors = this.getPassableNeighbors(current);
      for (const n of neighbors) {
        if (!visited.has(n)) {
          visited.add(n);
          queue.push(n);
        }
      }
    }

    for (const cell of this.grid) {
      if (!visited.has(cell)) continue;
      const dirs = [
        { wall: "top", dc: 0, dr: -1 },
        { wall: "right", dc: 1, dr: 0 },
        { wall: "bottom", dc: 0, dr: 1 },
        { wall: "left", dc: -1, dr: 0 },
      ];
      for (const { wall, dc, dr } of dirs) {
        const nIdx = gridIndex(cell.col + dc, cell.row + dr);
        if (nIdx !== -1 && !visited.has(this.grid[nIdx])) {
          cell.removeWallBetween(this.grid[nIdx]);
          return this._ensureSolvable();
        }
      }
    }
  }

  /**
   * @param {number} sc
   * @param {number} sr
   * @param {number} ec
   * @param {number} er
   * @returns {Cell[]|null}
   */
  findPath(sc, sr, ec, er) {
    const startIdx = gridIndex(sc, sr);
    const endIdx = gridIndex(ec, er);
    if (startIdx === -1 || endIdx === -1) return null;

    const start = this.grid[startIdx];
    const end = this.grid[endIdx];
    const visited = new Set();
    const parent = new Map();
    const queue = [start];
    visited.add(start);

    while (queue.length > 0) {
      const current = queue.shift();
      if (current === end) {
        const path = [];
        let node = end;
        while (node) {
          path.unshift(node);
          node = parent.get(node);
        }
        return path;
      }

      const neighbors = this.getPassableNeighbors(current);
      for (const n of neighbors) {
        if (!visited.has(n)) {
          visited.add(n);
          parent.set(n, current);
          queue.push(n);
        }
      }
    }

    return null;
  }

  draw(p) {
    this.grid.forEach((cell) => cell.draw(p));
  }

  getCellAt(px, py) {
    const col = Math.floor(px / CONFIG.CELL_W);
    const row = Math.floor(py / CONFIG.CELL_H);
    const idx = gridIndex(col, row);
    return idx !== -1 ? this.grid[idx] : null;
  }

  getPassableNeighbors(cell) {
    const result = [];
    const dirs = [
      { wall: "top", dc: 0, dr: -1 },
      { wall: "right", dc: 1, dr: 0 },
      { wall: "bottom", dc: 0, dr: 1 },
      { wall: "left", dc: -1, dr: 0 },
    ];

    dirs.forEach(({ wall, dc, dr }) => {
      if (!cell.hasWall(wall)) {
        const idx = gridIndex(cell.col + dc, cell.row + dr);
        if (idx !== -1) result.push(this.grid[idx]);
      }
    });

    return result;
  }
}
