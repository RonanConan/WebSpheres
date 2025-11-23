AFRAME.registerComponent('audio-manager', {
    init: function () {
        this.createSounds();
    },

    createSounds: function () {
        // --- Existing Sounds ---
        this.normalSound = new Audio('sounds/normal-hit.mp3');
        this.criticalSound = new Audio('sounds/critical-hit.mp3');
        this.reachCalibrationSound = new Audio('sounds/reach-calibration.mp3');
        this.heightCalibrationSound = new Audio('sounds/height-calibration.mp3');
        this.lapCalibrationSound = new Audio('sounds/lap-calibration.mp3');
        this.switchSound = new Audio('sounds/switch.mp3');
        this.leftHandSound = new Audio('sounds/left-hand.mp3');
        this.rightHandSound = new Audio('sounds/right-hand.mp3');

        // --- NEW: Streak Sounds ---
        this.hissSound = new Audio('sounds/hiss.mp3');

        // Array of voice lines for random selection
        this.streakVoices = [
            new Audio('sounds/fire.mp3'),
            new Audio('sounds/great.mp3'),
            new Audio('sounds/amazing.mp3'),
            new Audio('sounds/wow.mp3')
        ];

        // Preload all
        this.streakVoices.forEach(sound => sound.preload = 'auto');
    },

    playHitSound: function (hitType) {
        if (hitType === 'normal') {
            this.normalSound.currentTime = 0;
            this.normalSound.play();
        } else if (hitType === 'critical') {
            this.criticalSound.currentTime = 0;
            this.criticalSound.play();
        }
    },

    // NEW: Randomly plays one of the 4 motivational lines
    playFireVoice: function () {
        const randomIndex = Math.floor(Math.random() * this.streakVoices.length);
        const sound = this.streakVoices[randomIndex];
        sound.currentTime = 0;
        sound.play();
    },

    // NEW: Plays the cooldown hiss
    playStreakBreak: function () {
        this.hissSound.currentTime = 0;
        this.hissSound.play();
    },

    playCalibrationSound: function (soundType) {
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