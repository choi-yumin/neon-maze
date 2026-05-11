class Game {
  static STATE = {
    TITLE: "title",
    PLAYING: "playing",
    LEVEL_CLEAR: "level_clear",
    GAME_OVER: "game_over",
  };

  constructor() {
    this.state = Game.STATE.TITLE;
    this.level = 1;
    this.timeRemaining = 0;
    this.timeLimit = 0;
    this.lastTime = 0;

    this.mazeGen = new MazeGenerator();
    this.player = new Player(0, 0);
    this.blackout = new Blackout();
    this.shifter = new MazeShifter();
    this.hud = new HUD();

    this.goalCol = CONFIG.COLS - 1;
    this.goalRow = CONFIG.ROWS - 1;
  }

  handleKeyDown(kc) {
    if (this.state === Game.STATE.PLAYING) {
      this.player.handleKey(kc, true);
    }
  }

  handleKeyUp(kc) {
    if (this.state === Game.STATE.PLAYING) {
      this.player.handleKey(kc, false);
    }
  }

  handleClick() {
    switch (this.state) {
      case Game.STATE.TITLE:
        this.start();
        break;
      case Game.STATE.LEVEL_CLEAR:
        this.nextLevel();
        break;
      case Game.STATE.GAME_OVER:
        this.state = Game.STATE.TITLE;
        break;
    }
  }

  start() {
    this.level = 1;
    this._initLevel();
    this.state = Game.STATE.PLAYING;
    this.lastTime = millis();
  }

  _initLevel() {
    this.mazeGen.generate();
    this.player.resetPosition(0, 0);
    this.blackout.reset();
    this.shifter.reset();

    const levelPenalty = (this.level - 1) * 10;
    const seconds = Math.max(20, CONFIG.TIME_LIMIT_BASE - levelPenalty);
    this.timeLimit = seconds * 1000;
    this.timeRemaining = this.timeLimit;

    this.hud.showMessage(`LEVEL ${this.level}`, 2000, CONFIG.COLORS.CYAN);
  }

  nextLevel() {
    this.level++;
    this._initLevel();
    this.state = Game.STATE.PLAYING;
    this.lastTime = millis();
  }

  update(p) {
    const now = millis();
    const dt = now - this.lastTime;
    this.lastTime = now;

    switch (this.state) {
      case Game.STATE.PLAYING:
        this._updatePlaying(p, dt);
        break;
      case Game.STATE.LEVEL_CLEAR:
        break;
    }
  }

  _updatePlaying(p, dt) {
    this.timeRemaining -= dt;

    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.state = Game.STATE.GAME_OVER;
      return;
    }

    this.player.update(this.mazeGen);
    this.blackout.update(dt, this.level);
    this.shifter.update(dt, this.level, this.mazeGen, this.player);
    this.hud.update(dt);

    this._checkGoal();
  }

  _checkGoal() {
    const cell = this.player.getCurrentCell(this.mazeGen);
    if (cell && cell.col === this.goalCol && cell.row === this.goalRow) {
      this.state = Game.STATE.LEVEL_CLEAR;
    }
  }

  draw(p) {
    switch (this.state) {
      case Game.STATE.TITLE:
        this._drawTitle(p);
        break;
      case Game.STATE.PLAYING:
        this._drawGame(p);
        break;
      case Game.STATE.LEVEL_CLEAR:
        this._drawGame(p);
        this._drawLevelClear(p);
        break;
      case Game.STATE.GAME_OVER:
        this._drawGame(p);
        this._drawGameOver(p);
        break;
    }
  }

  _drawTitle(p) {
    p.background(CONFIG.COLORS.BG);
    this._drawBgGrid(p);

    p.push();
    p.textFont("Orbitron");
    p.textAlign(p.CENTER, p.CENTER);

    p.drawingContext.shadowColor = CONFIG.COLORS.CYAN;
    p.drawingContext.shadowBlur = 40;
    p.textSize(48);
    p.textStyle(p.BOLD);
    p.fill(CONFIG.COLORS.CYAN);
    p.text("NEON MAZE", CONFIG.CANVAS_W / 2, CONFIG.CANVAS_H / 2 - 30);

    p.drawingContext.shadowBlur = 0;

    const blink = Math.sin(p.millis() * 0.004) > 0;
    if (blink) {
      p.textFont("Rajdhani");
      p.textSize(18);
      p.fill(CONFIG.COLORS.YELLOW);
      p.text(
        "[ CLICK TO START ]",
        CONFIG.CANVAS_W / 2,
        CONFIG.CANVAS_H / 2 + 30,
      );
    }

    p.pop();
  }

  _drawGame(p) {
    p.background(CONFIG.COLORS.BG);
    this._drawBgGrid(p);

    this.mazeGen.draw(p);
    this.hud.drawGoal(p, this.goalCol, this.goalRow);
    this.shifter.draw(p);

    this.blackout.draw(p, { x: this.player.x, y: this.player.y });
    this.player.draw(p);

    if (this.blackout.active) {
      this.hud.drawGoal(p, this.goalCol, this.goalRow, true);
    }

    this.hud.draw(p, {
      level: this.level,
      timeRemaining: this.timeRemaining,
      timeLimit: this.timeLimit,
      blackoutActive: this.blackout.active,
      shiftActive: this.shifter.isShifting,
    });
  }

  _drawLevelClear(p) {
    p.push();
    p.fill(0, 0, 0, 120);
    p.noStroke();
    p.rect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);

    p.textFont("Orbitron");
    p.textAlign(p.CENTER, p.CENTER);

    p.drawingContext.shadowColor = CONFIG.COLORS.GREEN;
    p.drawingContext.shadowBlur = 30;
    p.textSize(36);
    p.fill(CONFIG.COLORS.GREEN);
    p.text("LEVEL CLEAR!", CONFIG.CANVAS_W / 2, CONFIG.CANVAS_H / 2 - 40);

    p.drawingContext.shadowColor = CONFIG.COLORS.YELLOW;
    p.textSize(18);
    p.fill(CONFIG.COLORS.YELLOW);
    const remaining = Math.ceil(this.timeRemaining / 1000);
    p.text(
      `Finished with ${remaining} seconds remaining!`,
      CONFIG.CANVAS_W / 2,
      CONFIG.CANVAS_H / 2 + 30,
    );

    p.drawingContext.shadowBlur = 0;

    const blink = Math.sin(p.millis() * 0.004) > 0;
    if (blink) {
      p.textFont("Rajdhani");
      p.textSize(16);
      p.fill(CONFIG.COLORS.CYAN);
      p.text(
        "[ CLICK FOR NEXT LEVEL ]",
        CONFIG.CANVAS_W / 2,
        CONFIG.CANVAS_H / 2 + 60,
      );
    }

    p.pop();
  }

  _drawGameOver(p) {
    p.push();
    p.fill(0, 0, 0, 180);
    p.noStroke();
    p.rect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);

    p.textFont("Orbitron");
    p.textAlign(p.CENTER, p.CENTER);

    p.drawingContext.shadowColor = CONFIG.COLORS.RED;
    p.drawingContext.shadowBlur = 40;
    p.textSize(42);
    p.fill(CONFIG.COLORS.RED);
    p.text("TIME UP", CONFIG.CANVAS_W / 2, CONFIG.CANVAS_H / 2 - 50);

    p.drawingContext.shadowBlur = 0;

    const blink = Math.sin(p.millis() * 0.004) > 0;
    if (blink) {
      p.textFont("Rajdhani");
      p.textSize(16);
      p.fill(CONFIG.COLORS.CYAN);
      p.text(
        "[ CLICK TO RETURN ]",
        CONFIG.CANVAS_W / 2,
        CONFIG.CANVAS_H / 2 + 70,
      );
    }

    p.pop();
  }

  _drawBgGrid(p) {
    p.push();
    p.stroke(CONFIG.COLORS.GRID);
    p.strokeWeight(0.5);
    for (let x = 0; x < CONFIG.CANVAS_W; x += CONFIG.CELL_W) {
      p.line(x, 0, x, CONFIG.CANVAS_H);
    }
    for (let y = 0; y < CONFIG.CANVAS_H; y += CONFIG.CELL_H) {
      p.line(0, y, CONFIG.CANVAS_W, y);
    }
    p.pop();
  }
}
