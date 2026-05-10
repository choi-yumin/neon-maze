// ============================================================
// sketch.js — p5.js 진입점 (setup / draw / 이벤트)
// ============================================================

let game;

function setup() {
  const canvas = createCanvas(CONFIG.CANVAS_W, CONFIG.CANVAS_H);
  canvas.parent(document.body);
  pixelDensity(1);

  game = new Game();
}

function draw() {
  game.update(this);
  game.draw(this);
}

function mousePressed() {
  game.handleClick();
}

function keyPressed() {
  game.handleKeyDown(keyCode);
  // 방향키 스크롤 방지
  if ([37, 38, 39, 40, 32].includes(keyCode)) return false;
}

function keyReleased() {
  game.handleKeyUp(keyCode);
}
