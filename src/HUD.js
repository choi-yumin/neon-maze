// ============================================================
// HUD.js — 타이머(카운트다운), 레벨, 상태 표시
// ============================================================

class HUD {
  constructor() {
    this.message = "";
    this.messageTimer = 0;
    this.messageColor = CONFIG.COLORS.CYAN;
  }

  showMessage(text, duration = 2000, color = CONFIG.COLORS.CYAN) {
    this.message = text;
    this.messageTimer = duration;
    this.messageColor = color;
  }

  update(dt) {
    if (this.messageTimer > 0) this.messageTimer -= dt;
  }

  /**
   * @param {p5} p
   * @param {object} state - { level, timeRemaining, timeLimit, blackoutActive, shiftActive }
   */
  draw(p, state) {
    const { level, timeRemaining, timeLimit, blackoutActive, shiftActive } =
      state;

    p.push();
    p.textFont("Orbitron");

    // 레벨 (좌상단)
    this._drawGlowText(p, `LV ${level}`, 16, 30, 20, CONFIG.COLORS.CYAN);

    // 카운트다운 타이머 (우상단) — 10초 이하면 빨갛게
    const timeStr = this._formatCountdown(timeRemaining);
    const timeColor =
      timeRemaining <= 10000 ? CONFIG.COLORS.RED : CONFIG.COLORS.YELLOW;
    const pulse =
      timeRemaining <= 10000 ? (Math.sin(p.millis() * 0.01) > 0 ? 1 : 0.4) : 1;

    p.push();
    p.textAlign(p.RIGHT, p.TOP);
    p.textSize(20);
    p.textStyle(p.BOLD);
    p.drawingContext.shadowColor = timeColor;
    p.drawingContext.shadowBlur = 15;
    const c = p.color(timeColor);
    p.fill(p.red(c), p.green(c), p.blue(c), pulse * 255);
    p.text(timeStr, CONFIG.CANVAS_W - 16, 30);
    p.drawingContext.shadowBlur = 0;
    p.pop();

    // 타이머 바 (상단)
    const barW = CONFIG.CANVAS_W - 32;
    const barH = 4;
    const barX = 16;
    const barY = 14;
    const ratio = Math.max(0, timeRemaining / timeLimit);

    p.noStroke();
    p.fill(30);
    p.rect(barX, barY, barW, barH, 2);

    const barColor =
      timeRemaining <= 10000 ? CONFIG.COLORS.RED : CONFIG.COLORS.CYAN;
    const bc = p.color(barColor);
    p.fill(p.red(bc), p.green(bc), p.blue(bc), 200);
    p.rect(barX, barY, barW * ratio, barH, 2);

    // 상태 인디케이터
    let statusY = 58;
    if (blackoutActive) {
      this._drawGlowText(
        p,
        "◉ BLACKOUT",
        16,
        statusY,
        12,
        CONFIG.COLORS.MAGENTA,
      );
      statusY += 22;
    }
    if (shiftActive) {
      this._drawGlowText(p, "◉ SHIFTING", 16, statusY, 12, CONFIG.COLORS.PINK);
    }

    // 조작 안내 (좌하단)
    p.textFont("Rajdhani");
    p.textAlign(p.LEFT, p.BOTTOM);
    p.textSize(11);
    p.fill("#ffffff44");
    p.text("WASD / Arrow Keys", 16, CONFIG.CANVAS_H - 12);

    // 중앙 메시지
    if (this.messageTimer > 0) {
      const fadeAlpha = Math.min(1, this.messageTimer / 500);
      p.push();
      p.textFont("Orbitron");
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(32);
      p.textStyle(p.BOLD);
      const mc = p.color(this.messageColor);
      p.fill(p.red(mc), p.green(mc), p.blue(mc), fadeAlpha * 255);
      p.drawingContext.shadowColor = this.messageColor;
      p.drawingContext.shadowBlur = 30;
      p.text(this.message, CONFIG.CANVAS_W / 2, CONFIG.CANVAS_H / 2);
      p.drawingContext.shadowBlur = 0;
      p.pop();
    }

    p.pop();
  }

  drawGoal(p, col, row, highlight = false) {
    const cx = col * CONFIG.CELL_W + CONFIG.CELL_W / 2;
    const cy = row * CONFIG.CELL_H + CONFIG.CELL_H / 2;
    const pulse = Math.sin(p.millis() * 0.005) * 0.3 + 1;
    const baseRadius = 14 * pulse;

    if (highlight) {
      const glowColor = p.color(CONFIG.COLORS.GREEN);
      p.push();
      p.noStroke();
      p.drawingContext.shadowColor = CONFIG.COLORS.GREEN;
      p.drawingContext.shadowBlur = 30;
      p.fill(p.red(glowColor), p.green(glowColor), p.blue(glowColor), 128);
      p.circle(cx, cy, baseRadius * 3.2);
      p.fill(p.red(glowColor), p.green(glowColor), p.blue(glowColor), 200);
      p.circle(cx, cy, baseRadius * 2.2);
      p.drawingContext.shadowBlur = 0;
      p.pop();
    }

    drawNeonCircle(
      p,
      cx,
      cy,
      baseRadius * (highlight ? 1.4 : 1),
      CONFIG.COLORS.GREEN,
    );

    p.push();
    p.textFont("Orbitron");
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(highlight ? 12 : 10);
    p.fill(CONFIG.COLORS.GREEN);
    p.drawingContext.shadowColor = CONFIG.COLORS.GREEN;
    p.drawingContext.shadowBlur = highlight ? 20 : 10;
    p.text("EXIT", cx, cy);
    p.drawingContext.shadowBlur = 0;
    p.pop();
  }

  _drawGlowText(p, text, x, y, size, color, align = p.LEFT) {
    p.textAlign(align, p.TOP);
    p.textSize(size);
    p.textStyle(p.BOLD);
    p.drawingContext.shadowColor = color;
    p.drawingContext.shadowBlur = 15;
    p.fill(color);
    p.text(text, x, y);
    p.drawingContext.shadowBlur = 0;
  }

  _formatCountdown(ms) {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }
}
