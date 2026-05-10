// ============================================================
// Cell.js — 미로의 개별 셀 클래스
// ============================================================

class Cell {
  /**
   * @param {number} col - 열 인덱스
   * @param {number} row - 행 인덱스
   */
  constructor(col, row) {
    this.col = col;
    this.row = row;
    this.walls = { top: true, right: true, bottom: true, left: true };
    this.visited = false;
  }

  /** 셀의 픽셀 좌표 (좌상단) */
  get x() {
    return this.col * CONFIG.CELL_W;
  }
  get y() {
    return this.row * CONFIG.CELL_H;
  }

  /** 셀의 중심 픽셀 좌표 */
  get centerX() {
    return this.x + CONFIG.CELL_W / 2;
  }
  get centerY() {
    return this.y + CONFIG.CELL_H / 2;
  }

  /**
   * 방문하지 않은 이웃 셀 반환
   * @param {Cell[]} grid - 전체 그리드 배열
   * @returns {Cell[]} 방문 안 한 이웃 목록
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
   * 두 셀 사이의 벽 제거
   * @param {Cell} other - 인접 셀
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
   * 셀의 벽 그리기 (네온 스타일)
   * @param {p5} p - p5 인스턴스
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
   * 특정 방향에 벽이 있는지 확인
   * @param {string} direction - 'top'|'right'|'bottom'|'left'
   * @returns {boolean}
   */
  hasWall(direction) {
    return this.walls[direction];
  }
}
