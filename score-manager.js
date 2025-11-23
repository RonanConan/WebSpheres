AFRAME.registerComponent('score-manager', {
    init: function () {
        this.score = 0;
        this.scoreTextEl = this.el;
        this.progressFillEl = document.querySelector('#progress-fill');
        this.progressTextEl = document.querySelector('#progress-display');

        // NEW: Visual Elements for Streak
        this.dashboardContainer = document.querySelector('#holo-dashboard');
        this.dashboardBg = document.querySelector('#dashboard-bg');
        this.dashboardBorders = document.querySelectorAll('.dashboard-border');

        // NEW: Streak State
        this.currentStreak = 0;
        this.isFireMode = false;

        this.leftHandCriticalChance = 0.3;
        this.rightHandCriticalChance = 0.3;
        this.currentCondition = 1;
        this.dominantHand = 'LEFT';
    },

    toggleCondition: function () {
        this.currentCondition = this.currentCondition === 1 ? 2 : 1;
        this.updateProbabilities();
    },

    setDominantHand: function (hand) {
        this.dominantHand = hand;
        this.updateProbabilities();
    },

    updateProbabilities: function () {
        if (this.currentCondition === 1) {
            this.leftHandCriticalChance = 0.3;
            this.rightHandCriticalChance = 0.3;
        } else {
            if (this.dominantHand === 'LEFT') {
                this.leftHandCriticalChance = 0.05;
                this.rightHandCriticalChance = 0.55;
            } else {
                this.leftHandCriticalChance = 0.55;
                this.rightHandCriticalChance = 0.05;
            }
        }
    },

    calculateHitPoints: function (handUsed) {
        const random = Math.random();
        const audioManager = document.querySelector('#audio-manager').components['audio-manager'];

        const criticalChance = handUsed === 'LEFT' ? this.leftHandCriticalChance : this.rightHandCriticalChance;

        if (random < (1 - criticalChance)) {
            audioManager.playHitSound('normal');
            return {
                points: Math.floor(Math.random() * 5) + 1,
                hitType: 'normal'
            };
        } else {
            audioManager.playHitSound('critical');
            return {
                points: Math.floor(Math.random() * 6) + 5,
                hitType: 'critical'
            };
        }
    },

    addPoints: function (amount, hitType) {
        this.score += amount;
        this.updateDisplay();

        const audioManager = document.querySelector('#audio-manager').components['audio-manager'];

        // === STREAK LOGIC ===
        if (hitType === 'critical') {
            this.currentStreak++;

            // Check for Fire Mode Entry (Streak 3)
            if (this.currentStreak === 3 && !this.isFireMode) {
                this.enterFireMode(audioManager);
            }

            // Shake dashboard on criticals (Visual feedback)
            this.triggerPulseAnimation();

        } else {
            // Normal hit breaks the streak
            if (this.isFireMode) {
                this.exitFireMode(audioManager);
            }
            this.currentStreak = 0;
        }
    },

    enterFireMode: function (audioManager) {
        this.isFireMode = true;

        // 1. Play Random Voice Line
        audioManager.playFireVoice();

        // 2. Morph Background Color (Black -> Dark Orange)
        this.dashboardBg.setAttribute('animation__color', {
            property: 'material.color',
            to: '#551100', // Dark burning orange background
            dur: 500,
            easing: 'easeOutQuad'
        });

        // 3. Morph Border Colors (Cyan -> Bright Orange)
        this.dashboardBorders.forEach(border => {
            border.setAttribute('animation__color', {
                property: 'material.color',
                to: '#FF4500', // Orange Red
                dur: 500,
                easing: 'easeOutQuad'
            });
        });

        // 4. Start Gentle Pulsating (Heartbeat)
        // We animate the scale of the whole dashboard slightly
        this.dashboardContainer.setAttribute('animation__heartbeat', {
            property: 'scale',
            from: '1 1 1',
            to: '1.02 1.02 1.02', // Subtle breath
            dur: 1000,
            dir: 'alternate',
            loop: true,
            easing: 'easeInOutSine'
        });
    },

    exitFireMode: function (audioManager) {
        this.isFireMode = false;

        // 1. Play Hiss Sound
        audioManager.playStreakBreak();

        // 2. Revert Background (Dark Orange -> Black)
        this.dashboardBg.setAttribute('animation__color', {
            property: 'material.color',
            to: '#000000',
            dur: 800, // Slower fade out (cooling down)
            easing: 'easeOutQuad'
        });

        // 3. Revert Borders (Bright Orange -> Cyan)
        this.dashboardBorders.forEach(border => {
            border.setAttribute('animation__color', {
                property: 'material.color',
                to: '#00ffff',
                dur: 800,
                easing: 'easeOutQuad'
            });
        });

        // 4. Stop Pulsating
        this.dashboardContainer.removeAttribute('animation__heartbeat');
        this.dashboardContainer.setAttribute('scale', '1 1 1'); // Reset size
    },

    triggerPulseAnimation: function () {
        // "Punch" animation for score text (separate from the gentle heartbeat)
        this.scoreTextEl.removeAttribute('animation__pulse');
        this.scoreTextEl.setAttribute('animation__pulse', {
            property: 'scale',
            from: '2 2 2',
            to: '1 1 1',
            dur: 300,
            easing: 'easeOutElastic'
        });

        this.scoreTextEl.setAttribute('color', '#00ffff');
        setTimeout(() => {
            this.scoreTextEl.setAttribute('color', '#FFFFFF');
        }, 200);
    },

    updateProgress: function (current, total) {
        const percentage = Math.round((current / total) * 100);
        if (this.progressTextEl) {
            this.progressTextEl.setAttribute('value', `${percentage}%`);
        }
        if (this.progressFillEl) {
            const decimal = current / total;
            const scaleX = Math.min(Math.max(decimal, 0), 1);
            this.progressFillEl.object3D.scale.set(scaleX, 1, 1);
        }
    },

    updateDisplay: function () {
        this.el.setAttribute('value', `${this.score}`);
    },

    getScore: function () {
        return this.score;
    }
});