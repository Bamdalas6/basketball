import confetti from 'canvas-confetti';

export class GameManager {
  constructor(sound) {
    this.sound = sound;

    this.score = 0;
    this.bestScore = parseInt(localStorage.getItem('basketball_best_score') || '0', 10);
    this.streak = 0;
    this.totalShots = 0;

    // Moving hoop challenge triggers at 10 goals
    this.movingHoopActive = false;
    this.hoopPositionX = 0;

    // Callbacks
    this.onStateChange = null;
    this.onComboEvent = null;
  }

  start() {
    this.score = 0;
    this.streak = 0;
    this.totalShots = 0;
    this.movingHoopActive = false;
    this.hoopPositionX = 0;
    this.triggerUpdate();
  }

  update(dt) {
    // Subtle moving hoop at 10+ score
    if (this.score >= 10 && !this.movingHoopActive) {
      this.movingHoopActive = true;
      if (this.onComboEvent) {
        this.onComboEvent('MOVING HOOP! 🎯', '#f59e0b');
      }
    }

    if (this.movingHoopActive) {
      const time = performance.now() * 0.001;
      this.hoopPositionX = Math.sin(time * 1.5) * 1.1;
    } else {
      this.hoopPositionX = 0;
    }
  }

  recordShotStart() {
    this.totalShots++;
  }

  recordScore(isSwish) {
    this.score++;
    this.streak++;

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      localStorage.setItem('basketball_best_score', this.bestScore.toString());
    }

    if (isSwish) {
      this.sound.playScore(true);
      if (this.onComboEvent) {
        this.onComboEvent('SWISH! 🔥', '#10b981');
      }
      this.burstConfetti(30);
    } else {
      this.sound.playScore(false);
      if (this.onComboEvent) {
        this.onComboEvent('GOAL! 🏀', '#ffcc00');
      }
    }

    if (this.streak >= 3) {
      if (this.onComboEvent) {
        this.onComboEvent(`STREAK x${this.streak}! 🔥`, '#f97316');
      }
      if (this.streak % 5 === 0) {
        this.burstConfetti(80);
      }
    }

    this.triggerUpdate();
  }

  recordMiss() {
    this.streak = 0;
    this.triggerUpdate();
  }

  reset() {
    this.score = 0;
    this.streak = 0;
    this.movingHoopActive = false;
    this.hoopPositionX = 0;
    this.triggerUpdate();
  }

  burstConfetti(count = 35) {
    confetti({
      particleCount: count,
      spread: 55,
      origin: { y: 0.4 },
      colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ffffff']
    });
  }

  triggerUpdate() {
    if (this.onStateChange) {
      this.onStateChange({
        score: this.score,
        bestScore: this.bestScore,
        streak: this.streak,
        totalShots: this.totalShots
      });
    }
  }
}
