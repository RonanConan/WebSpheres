AFRAME.registerComponent('score-manager', {
    init: function() {
        this.score = 0;
        this.progressDisplay = document.querySelector('#progress-display');
    },
    
    addPoint: function() {
        this.score++;
        this.updateDisplay();
    },
    
    updateProgress: function(current, total) {
        const percentage = Math.round((current / total) * 100);
        this.progressDisplay.setAttribute('value', `Progress: ${percentage}%`);
    },
    
    updateDisplay: function() {
        this.el.setAttribute('value', `Score: ${this.score}`);
    },
    
    getScore: function() {
        return this.score;
    }
});
