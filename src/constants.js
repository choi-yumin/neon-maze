// ============================================================
// constants.js — 게임 설정값 (튜닝 가능한 모든 상수)
// ============================================================

const CONFIG = {
  // 캔버스
  CANVAS_W: 800,
  CANVAS_H: 800,

  // 미로 그리드
  COLS: 15,
  ROWS: 15,

  // 플레이어 (키보드 조작)
  PLAYER_SPEED: 3,
  PLAYER_RADIUS: 6,

  // 시간 제한 (초)
  TIME_LIMIT_BASE: 120,

  // 암전 (Blackout)
  BLACKOUT_INTERVAL_BASE: 12000,
  BLACKOUT_DURATION_BASE: 4000,
  FLASHLIGHT_RADIUS_BASE: 100,
  BLACKOUT_FADE_SPEED: 0.06,

  // 미로 변형 (Maze Shift)
  SHIFT_INTERVAL_BASE: 18000,
  SHIFT_WALL_COUNT_BASE: 8,

  // 레벨 시스템
  LEVEL_DIFFICULTY_SCALE: 0.12,

  // 파티클
  PARTICLE_COUNT: 3,
  PARTICLE_LIFE: 60,

  // 네온 컬러 팔레트
  COLORS: {
    CYAN: "#00fff2",
    MAGENTA: "#ff00e5",
    YELLOW: "#f5ff00",
    GREEN: "#39ff14",
    PINK: "#ff2d7b",
    RED: "#ff1744",
    BG: "#0a0a0f",
    WALL: "#1a1a2e",
    WALL_GLOW: "#0ff3",
    GRID: "#111122",
  },
};

CONFIG.CELL_W = Math.floor(CONFIG.CANVAS_W / CONFIG.COLS);
CONFIG.CELL_H = Math.floor(CONFIG.CANVAS_H / CONFIG.ROWS);
