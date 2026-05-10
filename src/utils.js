/**
 */
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
 * @returns {Function} update(deltaTime, level) 함수
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
 * 고차 함수: 값을 부드럽게 보간하는 lerp 생성기
 * @param {number} speed - 보간 속도 (0~1)
 * @returns {Function} (current, target) => newValue
 */
const createSmoothLerp = (speed) => {
  return (current, target) => current + (target - current) * speed;
};

/**
 * 네온 글로우 효과 그리기
 */
const drawNeonLine = (p, x1, y1, x2, y2, color, weight = 2) => {
  // 외부 글로우
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

/**
 * 네온 글로우 원 그리기
 */
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

/**
 * 랜덤 네온 컬러 반환
 */
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
