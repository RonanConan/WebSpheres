AFRAME.registerComponent('score-manager', {
    init: function() {
        this.score = 0;
    },
    
    addPoint: function() {
        this.score++;
        this.updateDisplay();
    },
    
    updateDisplay: function() {
        this.el.setAttribute('value', `Score: ${this.score}`);
    },
    
    getScore: function() {
        return this.score;
    }
});
