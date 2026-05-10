// ============================================================
// Blackout.js — 암전 & 손전등 시스템
//   암전 시: 전체 화면이 완전히 검어지고,
//   마우스 포인터 주변만 원형으로 밝게 보임
// ============================================================

class Blackout {
  constructor() {
    this.active = false;
    this.opacity = 0; // 0=밝음, 1=완전암전
    this.targetOpacity = 0;
    this.flashlightRadius = CONFIG.FLASHLIGHT_RADIUS_BASE;
    this.isWarning = false;
    this.warningTimer = 0;

    this._smoothLerp = createSmoothLerp(CONFIG.BLACKOUT_FADE_SPEED);
    this._durationTimer = 0;

    this._trigger = createPeriodicTrigger(CONFIG.BLACKOUT_INTERVAL_BASE, () =>
      this._startWarning(),
    );
  }

  update(dt, level) {
    this.flashlightRadius =
      CONFIG.FLASHLIGHT_RADIUS_BASE / (1 + (level - 1) * 0.08);

    if (!this.active && !this.isWarning) {
      this._trigger(dt, level);
    }

    if (this.isWarning) {
      this.warningTimer -= dt;
      if (this.warningTimer <= 0) {
        this._startBlackout(level);
      }
    }

    if (this.active) {
      this._durationTimer -= dt;
      if (this._durationTimer <= 0) {
        this._endBlackout();
      }
    }

    this.opacity = this._smoothLerp(this.opacity, this.targetOpacity);
  }

  _startWarning() {
    this.isWarning = true;
    this.warningTimer = 1500;
  }

  _startBlackout(level) {
    this.isWarning = false;
    this.active = true;
    this.targetOpacity = 1;
    this._durationTimer =
      CONFIG.BLACKOUT_DURATION_BASE * difficultyScale(level);
  }

  _endBlackout() {
    this.active = false;
    this.targetOpacity = 0;
  }

  /**
   * 암전 오버레이 렌더링
   * 전체를 검은 사각형으로 덮고, 파티클 주변을 밝게 처리
   * @param {p5} p
   * @param {Array<{x:number,y:number}>} lightSources
   */
  draw(p, lightSources) {
    // 경고 깜빡임
    if (this.isWarning) {
      const flicker = Math.sin(p.millis() * 0.02) > 0 ? 0.3 : 0;
      p.push();
      p.noStroke();
      p.fill(0, 0, 0, flicker * 255);
      p.rect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);
      p.pop();
      return;
    }

    if (this.opacity < 0.01) return;

    const ctx = p.drawingContext;
    const r = this.flashlightRadius;
    const op = this.opacity;
    const sources = Array.isArray(lightSources)
      ? lightSources
      : lightSources && typeof lightSources === "object" && "x" in lightSources
        ? [lightSources]
        : [];

    ctx.save();

    // 전체 화면을 어둡게 칠함
    ctx.fillStyle = `rgba(0,0,0,${0.97 * op})`;
    ctx.fillRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);

    if (sources.length > 0) {
      ctx.globalCompositeOperation = "destination-out";

      sources.forEach((source) => {
        const sx = source.x;
        const sy = source.y;
        const innerGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
        innerGrad.addColorStop(0, `rgba(0,0,0,1)`);
        innerGrad.addColorStop(0.6, `rgba(0,0,0,0.6)`);
        innerGrad.addColorStop(1, `rgba(0,0,0,0)`);

        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.globalCompositeOperation = "source-over";
    ctx.restore();

    // 파티클 주변에 부드러운 광휘 추가
    if (sources.length > 0) {
      sources.forEach((source) => {
        const sx = source.x;
        const sy = source.y;
        const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 1.4);
        glow.addColorStop(0, `rgba(255,255,220,${0.18 * op})`);
        glow.addColorStop(0.35, `rgba(255,255,220,${0.08 * op})`);
        glow.addColorStop(1, `rgba(255,255,220,0)`);

        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);
      });
    }
  }

  reset() {
    this.active = false;
    this.opacity = 0;
    this.targetOpacity = 0;
    this.isWarning = false;
    this._durationTimer = 0;
    this._trigger = createPeriodicTrigger(CONFIG.BLACKOUT_INTERVAL_BASE, () =>
      this._startWarning(),
    );
  }
}
