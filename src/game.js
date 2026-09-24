import confetti from 'canvas-confetti';

export class GameManager {
  constructor(sound) {
    this.sound = sound;

    // Game state
    this.mode = 'VS_OPPONENT'; // 'VS_OPPONENT' | 'STREAK' | 'PRACTICE'
    this.isPlaying = false;
    this.isPaused = false;

    this.playerScore = 0;
    this.opponentScore = 0;
    this.timeLeft = 60;
    this.streak = 0;
    this.bestStreak = 0;
    this.swishCount = 0;
    this.totalShots = 0;
    this.scoredShots = 0;
    this.strikes = 0; // For STREAK mode (max 3)

    // Moving hoop
    this.movingHoopActive = false;
    this.movingHoopSpeed = 1.6;
    this.movingHoopAmplitude = 1.3;
    this.hoopPositionX = 0;

    // AI Opponent simulation
    this.aiTimer = 0;
    this.aiNextShotDelay = 3.0;

    // Timer interval
    this.timerId = null;

    // Listeners
    this.onStateChange = null;
    this.onGameOver = null;
    this.onComboEvent = null;
  }

  start(mode = 'VS_OPPONENT') {
    this.mode = mode;
    this.isPlaying = true;
    this.isPaused = false;
    this.playerScore = 0;
    this.opponentScore = 0;
    this.streak = 0;
    this.swishCount = 0;
    this.totalShots = 0;
    this.scoredShots = 0;
    this.strikes = 0;
    this.hoopPositionX = 0;
    this.movingHoopActive = false;

    this.timeLeft = this.mode === 'PRACTICE' ? 999 : 60;
    this.aiTimer = 0;
    this.aiNextShotDelay = 2.5 + Math.random() * 2.0;

    this.sound.playWhistle();

    clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      if (!this.isPlaying || this.isPaused) return;

      if (this.mode !== 'PRACTICE') {
        this.timeLeft--;
        if (this.timeLeft <= 0) {
          this.timeLeft = 0;
          this.endGame();
        } else if (this.timeLeft <= 5) {
          this.sound.playBuzzer();
        }
      }

      this.triggerUpdate();
    }, 1000);

    this.triggerUpdate();
  }

  pause() {
    this.isPaused = !this.isPaused;
    this.triggerUpdate();
  }

  update(dt) {
    if (!this.isPlaying || this.isPaused) return;

    // Activate moving hoop after reaching 10 points
    if (this.playerScore >= 10 && !this.movingHoopActive && this.mode !== 'PRACTICE') {
      this.movingHoopActive = true;
      if (this.onComboEvent) {
        this.onComboEvent('MOVING HOOP ACTIVATED!', '#f59e0b');
      }
    }

    if (this.movingHoopActive) {
      const time = performance.now() * 0.001;
      this.hoopPositionX = Math.sin(time * this.movingHoopSpeed) * this.movingHoopAmplitude;
    } else {
      this.hoopPositionX = 0;
    }

    // AI Opponent Shootout logic in VS mode
    if (this.mode === 'VS_OPPONENT') {
      this.aiTimer += dt;
      if (this.aiTimer >= this.aiNextShotDelay) {
        this.aiTimer = 0;
        this.aiNextShotDelay = 2.4 + Math.random() * 2.2;
        this.simulateAiShot();
      }
    }
  }

  simulateAiShot() {
    // 60% chance opponent scores
    const willScore = Math.random() < 0.62;
    if (willScore) {
      const pts = Math.random() < 0.25 ? 3 : 2;
      this.opponentScore += pts;
      this.triggerUpdate();
      if (this.onComboEvent) {
        this.onComboEvent(`OPPONENT SCORED +${pts}!`, '#ef4444');
      }
    }
  }

  recordShotStart() {
    this.totalShots++;
  }

  recordScore(isSwish) {
    this.scoredShots++;
    this.streak++;
    if (this.streak > this.bestStreak) {
      this.bestStreak = this.streak;
    }

    let points = isSwish ? 3 : 2;
    // Streak multiplier bonus
    if (this.streak >= 5) points += 2;
    else if (this.streak >= 3) points += 1;

    this.playerScore += points;

    if (isSwish) {
      this.swishCount++;
      this.sound.playScore(true);
      if (this.onComboEvent) {
        this.onComboEvent('SWISH! +3 PTS', '#10b981');
      }
      this.burstSmallConfetti();
    } else {
      this.sound.playScore(false);
      if (this.onComboEvent) {
        this.onComboEvent(`SCORE! +${points}`, '#3b82f6');
      }
    }

    if (this.streak === 3) {
      if (this.onComboEvent) this.onComboEvent('ON FIRE! 🔥 3 IN A ROW!', '#f97316');
    } else if (this.streak === 5) {
      if (this.onComboEvent) this.onComboEvent('UNSTOPPABLE! ⚡ 5 IN A ROW!', '#ec4899');
      this.burstBigConfetti();
    }

    this.triggerUpdate();
  }

  recordMiss() {
    if (this.streak >= 3) {
      if (this.onComboEvent) this.onComboEvent('STREAK BROKEN!', '#94a3b8');
    }
    this.streak = 0;

    if (this.mode === 'STREAK') {
      this.strikes++;
      if (this.strikes >= 3) {
        this.endGame();
      }
    }
    this.triggerUpdate();
  }

  endGame() {
    this.isPlaying = false;
    clearInterval(this.timerId);
    this.sound.playBuzzer();

    const isWinner = this.mode === 'VS_OPPONENT' ? this.playerScore > this.opponentScore : true;
    if (isWinner && this.playerScore > 0) {
      this.burstBigConfetti();
    }

    // Save local high score
    const bestStored = parseInt(localStorage.getItem('basketball_best_score') || '0', 10);
    if (this.playerScore > bestStored) {
      localStorage.setItem('basketball_best_score', this.playerScore.toString());
    }

    if (this.onGameOver) {
      this.onGameOver({
        playerScore: this.playerScore,
        opponentScore: this.opponentScore,
        isWinner,
        accuracy: this.totalShots > 0 ? Math.round((this.scoredShots / this.totalShots) * 100) : 0,
        swishes: this.swishCount,
        bestStreak: this.bestStreak
      });
    }
    this.triggerUpdate();
  }

  burstSmallConfetti() {
    confetti({
      particleCount: 28,
      spread: 45,
      origin: { y: 0.45 },
      colors: ['#f59e0b', '#10b981', '#3b82f6']
    });
  }

  burstBigConfetti() {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.4 },
      colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
    });
  }

  triggerUpdate() {
    if (this.onStateChange) {
      this.onStateChange({
        playerScore: this.playerScore,
        opponentScore: this.opponentScore,
        timeLeft: this.timeLeft,
        streak: this.streak,
        mode: this.mode,
        isPlaying: this.isPlaying,
        isPaused: this.isPaused,
        strikes: this.strikes,
        totalShots: this.totalShots,
        scoredShots: this.scoredShots
      });
    }
  }
}
