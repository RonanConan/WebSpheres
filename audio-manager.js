AFRAME.registerComponent('audio-manager', {
    init: function() {
        this.createSounds();
    },
    
    createSounds: function() {
        this.normalSound = document.createElement('audio');
        this.normalSound.src = 'sounds/normal-hit.mp3';
        this.normalSound.preload = 'auto';
        
        this.criticalSound = document.createElement('audio');
        this.criticalSound.src = 'sounds/critical-hit.mp3';
        this.criticalSound.preload = 'auto';
    },
    
    playHitSound: function(hitType) {
        if (hitType === 'normal') {
            this.normalSound.currentTime = 0;
            this.normalSound.play();
        } else if (hitType === 'critical') {
            this.criticalSound.currentTime = 0;
            this.criticalSound.play();
        }
    }
});
