// ============================================================
// MazeShifter.js — 미로 변형 시스템
//   변형 후 항상 풀이 가능 여부를 재검증
// ============================================================

class MazeShifter {
  constructor() {
    this.isShifting = false;
    this.shiftProgress = 0;
    this.shiftingWalls = [];
    this.shiftDuration = 800;
    this.shiftHighlight = 0;

    this._trigger = createPeriodicTrigger(CONFIG.SHIFT_INTERVAL_BASE, () =>
      this._beginShift(),
    );
  }

  update(dt, level, maze, player) {
    if (!this.isShifting) {
      this._trigger(dt, level);
      if (this.isShifting) {
        this._applyShift(maze, player, level);
      }
    } else {
      this.shiftProgress += dt / this.shiftDuration;
      if (this.shiftProgress >= 1) {
        this.isShifting = false;
        this.shiftProgress = 0;
        this.shiftingWalls = [];
      }
    }

    if (this.shiftHighlight > 0) {
      this.shiftHighlight = Math.max(0, this.shiftHighlight - dt / 300);
    }
  }

  _beginShift() {
    this.isShifting = true;
    this.shiftProgress = 0;
    this.shiftHighlight = 1;
  }

  _applyShift(maze, player, level) {
    const wallCount = Math.floor(
      CONFIG.SHIFT_WALL_COUNT_BASE * difficultyScale(level),
    );
    const grid = maze.grid;
    const playerCell = player.getCurrentCell(maze);
    this.shiftingWalls = [];

    const isSafe = (cell) => {
      if (!playerCell) return false;
      return (
        Math.abs(cell.col - playerCell.col) <= 2 &&
        Math.abs(cell.row - playerCell.row) <= 2
      );
    };

    // 변형 전 상태 저장 (롤백용)
    const backup = grid.map((c) => ({
      top: c.walls.top,
      right: c.walls.right,
      bottom: c.walls.bottom,
      left: c.walls.left,
    }));

    let changed = 0;
    let attempts = 0;

    while (changed < wallCount && attempts < wallCount * 5) {
      attempts++;
      const idx = Math.floor(Math.random() * grid.length);
      const cell = grid[idx];

      if (isSafe(cell)) continue;

      const directions = [];
      if (cell.row > 0) directions.push("top");
      if (cell.col < CONFIG.COLS - 1) directions.push("right");
      if (cell.row < CONFIG.ROWS - 1) directions.push("bottom");
      if (cell.col > 0) directions.push("left");

      if (directions.length === 0) continue;

      const dir = directions[Math.floor(Math.random() * directions.length)];
      const neighborMap = {
        top: [0, -1],
        right: [1, 0],
        bottom: [0, 1],
        left: [-1, 0],
      };
      const [dc, dr] = neighborMap[dir];
      const nIdx = gridIndex(cell.col + dc, cell.row + dr);

      if (nIdx === -1) continue;

      const neighbor = grid[nIdx];
      const oppositeDir = {
        top: "bottom",
        right: "left",
        bottom: "top",
        left: "right",
      };

      const newState = !cell.walls[dir];
      cell.walls[dir] = newState;
      neighbor.walls[oppositeDir[dir]] = newState;

      this.shiftingWalls.push({ cell, direction: dir, added: newState });
      changed++;
    }

    // 풀이 가능 여부 확인 → 불가능하면 롤백
    const path = maze.findPath(0, 0, CONFIG.COLS - 1, CONFIG.ROWS - 1);
    if (!path) {
      // 롤백
      grid.forEach((c, i) => {
        c.walls.top = backup[i].top;
        c.walls.right = backup[i].right;
        c.walls.bottom = backup[i].bottom;
        c.walls.left = backup[i].left;
      });
      this.shiftingWalls = [];
    }
  }

  draw(p) {
    const flash = Math.sin(this.shiftProgress * Math.PI);
    const highlightAlpha = Math.min(1, this.shiftHighlight);

    if (this.shiftingWalls.length > 0) {
      this.shiftingWalls.forEach(({ cell, direction, added }) => {
        p.push();
        p.noStroke();
        const col = added ? CONFIG.COLORS.GREEN : CONFIG.COLORS.PINK;
        const c = p.color(col);
        p.fill(
          p.red(c),
          p.green(c),
          p.blue(c),
          flash * 180 + highlightAlpha * 50,
        );
        p.circle(cell.centerX, cell.centerY, CONFIG.CELL_W * (flash + 0.8));

        p.stroke(p.red(c), p.green(c), p.blue(c), 180 * highlightAlpha);
        p.strokeWeight(3);
        p.drawingContext.shadowColor = col;
        p.drawingContext.shadowBlur = 18 * highlightAlpha;
        p.noFill();
        p.circle(
          cell.centerX,
          cell.centerY,
          CONFIG.CELL_W * (1.6 + highlightAlpha),
        );
        p.pop();
      });
    }

    if (this.shiftHighlight > 0 && this.shiftingWalls.length === 0) {
      p.push();
      p.noFill();
      p.stroke(CONFIG.COLORS.MAGENTA);
      p.strokeWeight(4);
      p.drawingContext.shadowColor = CONFIG.COLORS.MAGENTA;
      p.drawingContext.shadowBlur = 20 * highlightAlpha;
      p.circle(
        CONFIG.CANVAS_W / 2,
        CONFIG.CANVAS_H / 2,
        CONFIG.CANVAS_W * highlightAlpha * 0.8,
      );
      p.pop();
    }
  }

  reset() {
    this.isShifting = false;
    this.shiftProgress = 0;
    this.shiftingWalls = [];
    this.shiftHighlight = 0;
    this._trigger = createPeriodicTrigger(CONFIG.SHIFT_INTERVAL_BASE, () =>
      this._beginShift(),
    );
  }
}
