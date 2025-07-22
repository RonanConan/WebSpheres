AFRAME.registerComponent('score-manager', {
    init: function() {
        this.score = 0;
        this.progressDisplay = document.querySelector('#progress-display');
        this.leftHandCriticalChance = 0.2;  // 20% critical hit chance for left hand
        this.rightHandCriticalChance = 0.2; // 20% critical hit chance for right hand
    },
    
    calculateHitPoints: function(handUsed) {
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
