AFRAME.registerComponent('score-manager', {
    init: function () {
        this.score = 0;
        this.scoreTextEl = this.el; // Attached to #score-display
        this.progressFillEl = document.querySelector('#progress-fill');
        this.progressTextEl = document.querySelector('#progress-display');

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

        // Get critical hit chance based on hand used
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

    // MODIFIED: Now accepts hitType to control dashboard feedback
    addPoints: function (amount, hitType) {
        this.score += amount;
        this.updateDisplay();

        // Only shake/pulse the dashboard on CRITICAL hits
        if (hitType === 'critical') {
            this.triggerPulseAnimation();
        }
    },

    triggerPulseAnimation: function () {
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
        // Update Text
        const percentage = Math.round((current / total) * 100);
        if (this.progressTextEl) {
            this.progressTextEl.setAttribute('value', `${percentage}%`);
        }

        // Update Bar Visual (Scale X)
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