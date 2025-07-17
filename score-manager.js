AFRAME.registerComponent('score-manager', {
    init: function() {
        this.score = 0;
        this.progressDisplay = document.querySelector('#progress-display');
    },
    
    calculateHitPoints: function() {
        const random = Math.random();
        const audioManager = document.querySelector('#audio-manager').components['audio-manager'];
        
        if (random < 0.8) {
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
