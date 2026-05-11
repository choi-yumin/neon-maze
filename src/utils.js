const gridIndex = (col, row) => {
  if (col < 0 || row < 0 || col >= CONFIG.COLS || row >= CONFIG.ROWS) return -1;
  return col + row * CONFIG.COLS;
};

/**
 * @param {number} level
 * @returns {number}
 */
const difficultyScale = (level) =>
  1 + (level - 1) * CONFIG.LEVEL_DIFFICULTY_SCALE;

/**
 * @param {number} baseInterval
 * @param {Function} onTrigger
 * @returns {Function}
 */
const createPeriodicTrigger = (baseInterval, onTrigger) => {
  let elapsed = 0;

  return (deltaTime, level) => {
    const scaledInterval = baseInterval / difficultyScale(level);
    elapsed += deltaTime;

    if (elapsed >= scaledInterval) {
      elapsed = 0;
      onTrigger();
      return true;
    }
    return false;
  };
};

/**
 * @param {number} speed
 * @returns {Function} (current, target) => newValue
 */
const createSmoothLerp = (speed) => {
  return (current, target) => current + (target - current) * speed;
};

const drawNeonLine = (p, x1, y1, x2, y2, color, weight = 2) => {
  p.push();
  p.strokeWeight(weight + 6);
  p.stroke(p.color(color + "33"));
  p.line(x1, y1, x2, y2);

  p.strokeWeight(weight + 3);
  p.stroke(p.color(color + "66"));
  p.line(x1, y1, x2, y2);

  // 코어 라인
  p.strokeWeight(weight);
  p.stroke(p.color(color));
  p.line(x1, y1, x2, y2);
  p.pop();
};

const drawNeonCircle = (p, x, y, r, color) => {
  p.push();
  p.noStroke();
  for (let i = 4; i >= 0; i--) {
    const alpha = Math.floor(40 - i * 8);
    p.fill(
      p.red(p.color(color)),
      p.green(p.color(color)),
      p.blue(p.color(color)),
      alpha,
    );
    p.circle(x, y, r + i * 8);
  }
  p.fill(color);
  p.circle(x, y, r);
  p.pop();
};

const randomNeonColor = () => {
  const colors = [
    CONFIG.COLORS.CYAN,
    CONFIG.COLORS.MAGENTA,
    CONFIG.COLORS.YELLOW,
    CONFIG.COLORS.GREEN,
    CONFIG.COLORS.PINK,
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
