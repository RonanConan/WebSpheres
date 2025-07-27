AFRAME.registerComponent('score-manager', {
    init: function() {
        this.score = 0;
        this.progressDisplay = document.querySelector('#progress-display');
        this.leftHandCriticalChance = 0.2;  // 20% critical hit chance for left hand
        this.rightHandCriticalChance = 0.2; // 20% critical hit chance for right hand
        this.currentCondition = 1;
        this.dominantHand = 'LEFT';
    },
    
    toggleCondition: function() {
        this.currentCondition = this.currentCondition === 1 ? 2 : 1;
        this.updateProbabilities();
    },
    
    setDominantHand: function(hand) {
        this.dominantHand = hand;
        this.updateProbabilities();
    },
    
    updateProbabilities: function() {
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
    
    calculateHitPoints: function(handUsed) {
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
    
    addPoints: function(amount) {
        this.score += amount;
        this.updateDisplay();
    },
    
    updateProgress: function(current, total) {
        const percentage = Math.round((current / total) * 100);
        this.progressDisplay.setAttribute('value', `Progress: ${percentage}%`);
    },
    
    updateDisplay: function() {
        this.el.setAttribute('value', `${this.score}`);
    },
    
    getScore: function() {
        return this.score;
    }
});
