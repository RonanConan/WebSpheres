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
        
        this.reachCalibrationSound = document.createElement('audio');
        this.reachCalibrationSound.src = 'sounds/reach-calibration.mp3';
        this.reachCalibrationSound.preload = 'auto';
        
        this.heightCalibrationSound = document.createElement('audio');
        this.heightCalibrationSound.src = 'sounds/height-calibration.mp3';
        this.heightCalibrationSound.preload = 'auto';
        
        this.lapCalibrationSound = document.createElement('audio');
        this.lapCalibrationSound.src = 'sounds/lap-calibration.mp3';
        this.lapCalibrationSound.preload = 'auto';
        
        this.switchSound = document.createElement('audio');
        this.switchSound.src = 'sounds/switch.mp3';
        this.switchSound.preload = 'auto';
        
        this.leftHandSound = document.createElement('audio');
        this.leftHandSound.src = 'sounds/left-hand.mp3';
        this.leftHandSound.preload = 'auto';
        
        this.rightHandSound = document.createElement('audio');
        this.rightHandSound.src = 'sounds/right-hand.mp3';
        this.rightHandSound.preload = 'auto';
    },
    
    playHitSound: function(hitType) {
        if (hitType === 'normal') {
            this.normalSound.currentTime = 0;
            this.normalSound.play();
        } else if (hitType === 'critical') {
            this.criticalSound.currentTime = 0;
            this.criticalSound.play();
        }
    },
    
    playCalibrationSound: function(soundType) {
        if (soundType === 'reach-calibration') {
            this.reachCalibrationSound.currentTime = 0;
            this.reachCalibrationSound.play();
        } else if (soundType === 'height-calibration') {
            this.heightCalibrationSound.currentTime = 0;
            this.heightCalibrationSound.play();
        } else if (soundType === 'lap-calibration') {
            this.lapCalibrationSound.currentTime = 0;
            this.lapCalibrationSound.play();
        } else if (soundType === 'switch') {
            this.switchSound.currentTime = 0;
            this.switchSound.play();
        } else if (soundType === 'left-hand') {
            this.leftHandSound.currentTime = 0;
            this.leftHandSound.play();
        } else if (soundType === 'right-hand') {
            this.rightHandSound.currentTime = 0;
            this.rightHandSound.play();
        }
    }
});
