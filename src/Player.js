class Player {
  constructor(startCol = 0, startRow = 0) {
    this.x = startCol * CONFIG.CELL_W + CONFIG.CELL_W / 2;
    this.y = startRow * CONFIG.CELL_H + CONFIG.CELL_H / 2;
    this.radius = CONFIG.PLAYER_RADIUS;
    this.speed = CONFIG.PLAYER_SPEED;
    this.trail = [];
    this.trailMax = 25;
    this.glowPhase = 0;
    this.color = CONFIG.COLORS.MAGENTA;

    this.keys = { up: false, down: false, left: false, right: false };
  }

  /**
   * @param {number} keyCode
   * @param {boolean} pressed
   */
  handleKey(keyCode, pressed) {
    switch (keyCode) {
      case 87:
      case 38: // W, ↑
        this.keys.up = pressed;
        break;
      case 83:
      case 40: // S, ↓
        this.keys.down = pressed;
        break;
      case 65:
      case 37: // A, ←
        this.keys.left = pressed;
        break;
      case 68:
      case 39: // D, →
        this.keys.right = pressed;
        break;
    }
  }

  /**
   * @param {MazeGenerator} maze
   */
  update(maze) {
    let vx = 0;
    let vy = 0;

    if (this.keys.up) vy -= this.speed;
    if (this.keys.down) vy += this.speed;
    if (this.keys.left) vx -= this.speed;
    if (this.keys.right) vx += this.speed;

    if (vx !== 0 && vy !== 0) {
      const norm = 1 / Math.SQRT2;
      vx *= norm;
      vy *= norm;
    }

    if (vx === 0 && vy === 0) return;

    const newX = this.x + vx;
    const newY = this.y + vy;

    if (!this._collides(newX, this.y, maze)) this.x = newX;
    if (!this._collides(this.x, newY, maze)) this.y = newY;

    this.x = Math.max(
      this.radius,
      Math.min(CONFIG.CANVAS_W - this.radius, this.x),
    );
    this.y = Math.max(
      this.radius,
      Math.min(CONFIG.CANVAS_H - this.radius, this.y),
    );

    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.trailMax) this.trail.shift();

    this.glowPhase += 0.08;
  }

  /**
   * @private
   */
  _collides(px, py, maze) {
    const r = this.radius;
    const checkPoints = [
      { x: px - r, y: py - r },
      { x: px + r, y: py - r },
      { x: px - r, y: py + r },
      { x: px + r, y: py + r },
    ];

    const currentCell = maze.getCellAt(px, py);
    if (!currentCell) return true;

    for (const pt of checkPoints) {
      const ptCell = maze.getCellAt(pt.x, pt.y);
      if (!ptCell) return true;

      if (ptCell.col === currentCell.col && ptCell.row === currentCell.row)
        continue;

      const dc = ptCell.col - currentCell.col;
      const dr = ptCell.row - currentCell.row;

      if (dc === 1 && currentCell.hasWall("right")) return true;
      if (dc === -1 && currentCell.hasWall("left")) return true;
      if (dr === 1 && currentCell.hasWall("bottom")) return true;
      if (dr === -1 && currentCell.hasWall("top")) return true;

      if (dc !== 0 && dr !== 0) {
        const hBlocked =
          dc === 1 ? currentCell.hasWall("right") : currentCell.hasWall("left");
        const vBlocked =
          dr === 1 ? currentCell.hasWall("bottom") : currentCell.hasWall("top");
        if (hBlocked || vBlocked) return true;
      }
    }

    return false;
  }

  /**
   * @param {p5} p
   */
  draw(p) {
    this.trail.forEach((pt, i) => {
      const alpha = (i / this.trail.length) * 150;
      const size = (i / this.trail.length) * this.radius * 2;
      p.noStroke();
      const c = p.color(this.color);
      p.fill(p.red(c), p.green(c), p.blue(c), alpha);
      p.circle(pt.x, pt.y, size);
    });

    // 본체 글로우
    const pulse = Math.sin(this.glowPhase) * 0.3 + 1;
    drawNeonCircle(p, this.x, this.y, this.radius * 2 * pulse, this.color);
  }

  getCurrentCell(maze) {
    return maze.getCellAt(this.x, this.y);
  }

  resetPosition(col, row) {
    this.x = col * CONFIG.CELL_W + CONFIG.CELL_W / 2;
    this.y = row * CONFIG.CELL_H + CONFIG.CELL_H / 2;
    this.trail = [];
    this.keys = { up: false, down: false, left: false, right: false };
  }
}
