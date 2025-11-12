AFRAME.registerComponent('sphere-manager', {
    init: function() {
        this.currentState = 'invisible';
        this.activeSphere = null;
        this.allSpheres = [];
        this.appearTimer = null;
        this.disappearTimer = null;
        this.appearanceCounts = [0,0,0,0,0,0,0,0,0,0,0];
        this.totalAppearances = 0;
        this.decisionTimeRecorded = false;
        this.lastSelectedPosition = -1;
        this.radius = 0.7;
        this.height = 1.2;
        this.isPaused = true;
        this.appearancesPerSphere = 32;
        this.totalTrials = 11 * this.appearancesPerSphere;
        this.trialsSwitched = false;
        this.fModeActive = false;
        this.bModeActive = false;
        this.currentPhase = 0;
        this.phaseAppearanceCounts = [0,0,0,0,0,0,0,0,0,0,0];
        
        // Hitbox properties
        this.leftHitbox = null;
        this.rightHitbox = null;
        this.hitboxVisible = false;
        this.hitboxWidth = 0.08;
        this.hitboxHeight = 0.12;
        this.hitboxDepth = 0.06;
        this.hitboxOffsetY = 0.05;
        this.hitboxOffsetZ = 0.02;
        this.hitboxRotationX = 90;  // Rotation around X axis (pitch)
        this.hitboxReady = false;  // NEW: Track initialization status
        this.HITBOX_INIT_CHECK_INTERVAL = 100;  // NEW: Check every 100ms
        
        this.leftRectangle = document.querySelector('#left-rectangle');
        this.rightRectangle = document.querySelector('#right-rectangle');
        this.leftController = document.querySelector('[hand-tracking-controls="hand: left"]');
        this.rightController = document.querySelector('[hand-tracking-controls="hand: right"]');
        this.scoreDisplay = document.querySelector('#score-display');
        this.progressDisplay = document.querySelector('#progress-display');
        
        this.createSpheres();
        this.setupCalibration();
        this.updateTextPositions();
        this.createHitboxes();
    },
    
    createHitboxes: function() {
        // Use interval to retry until successful
        this.hitboxInitInterval = setInterval(() => {
            // Try to create left hitbox if it doesn't exist
            if (this.leftController && !this.leftHitbox) {
                this.leftHitbox = document.createElement('a-box');
                this.leftHitbox.setAttribute('width', this.hitboxWidth);
                this.leftHitbox.setAttribute('height', this.hitboxHeight);
                this.leftHitbox.setAttribute('depth', this.hitboxDepth);
                this.leftHitbox.setAttribute('color', '#00ff00');
                this.leftHitbox.setAttribute('material', 'transparent: true; opacity: 0.3');
                this.leftHitbox.setAttribute('visible', this.hitboxVisible);
                this.leftHitbox.setAttribute('position', `0 ${this.hitboxOffsetY} ${this.hitboxOffsetZ}`);
                this.leftHitbox.setAttribute('rotation', `${this.hitboxRotationX} 0 0`);
                this.leftController.appendChild(this.leftHitbox);
                console.log('Left hitbox created');
            }
            
            // Try to create right hitbox if it doesn't exist
            if (this.rightController && !this.rightHitbox) {
                this.rightHitbox = document.createElement('a-box');
                this.rightHitbox.setAttribute('width', this.hitboxWidth);
                this.rightHitbox.setAttribute('height', this.hitboxHeight);
                this.rightHitbox.setAttribute('depth', this.hitboxDepth);
                this.rightHitbox.setAttribute('color', '#00ff00');
                this.rightHitbox.setAttribute('material', 'transparent: true; opacity: 0.3');
                this.rightHitbox.setAttribute('visible', this.hitboxVisible);
                this.rightHitbox.setAttribute('position', `0 ${this.hitboxOffsetY} ${this.hitboxOffsetZ}`);
                this.rightHitbox.setAttribute('rotation', `${this.hitboxRotationX} 0 0`);
                this.rightController.appendChild(this.rightHitbox);
                console.log('Right hitbox created');
            }
            
            // Check if both hitboxes are ready (exist and have object3D)
            if (this.leftHitbox && this.leftHitbox.object3D && 
                this.rightHitbox && this.rightHitbox.object3D) {
                this.hitboxReady = true;
                clearInterval(this.hitboxInitInterval);
                console.log('✓ Hitboxes initialized successfully');
                console.log(`  Size: W=${this.hitboxWidth}m, H=${this.hitboxHeight}m, D=${this.hitboxDepth}m`);
            }
        }, this.HITBOX_INIT_CHECK_INTERVAL);
        
        // Safety timeout: stop trying after 10 seconds
        setTimeout(() => {
            if (!this.hitboxReady) {
                clearInterval(this.hitboxInitInterval);
                console.error('✗ Hitbox initialization failed after 10 seconds');
                console.error('  Hand tracking may not be active');
            }
        }, 10000);
    },
    
    toggleHitboxVisibility: function() {
        this.hitboxVisible = !this.hitboxVisible;
        if (this.leftHitbox) {
            this.leftHitbox.setAttribute('visible', this.hitboxVisible);
        }
        if (this.rightHitbox) {
            this.rightHitbox.setAttribute('visible', this.hitboxVisible);
        }
        console.log(`Hitbox visibility: ${this.hitboxVisible ? 'ON' : 'OFF'}`);
    },
    
    adjustHitboxSize: function(dimension, amount) {
        if (dimension === 'width') {
            this.hitboxWidth = Math.max(0.02, this.hitboxWidth + amount);
        } else if (dimension === 'height') {
            this.hitboxHeight = Math.max(0.02, this.hitboxHeight + amount);
        } else if (dimension === 'depth') {
            this.hitboxDepth = Math.max(0.02, this.hitboxDepth + amount);
        }
        
        if (this.leftHitbox) {
            this.leftHitbox.setAttribute('width', this.hitboxWidth);
            this.leftHitbox.setAttribute('height', this.hitboxHeight);
            this.leftHitbox.setAttribute('depth', this.hitboxDepth);
        }
        if (this.rightHitbox) {
            this.rightHitbox.setAttribute('width', this.hitboxWidth);
            this.rightHitbox.setAttribute('height', this.hitboxHeight);
            this.rightHitbox.setAttribute('depth', this.hitboxDepth);
        }
        
        console.log(`Hitbox: W=${this.hitboxWidth.toFixed(3)}m, H=${this.hitboxHeight.toFixed(3)}m, D=${this.hitboxDepth.toFixed(3)}m`);
    },
    
    adjustHitboxRotation: function(amount) {
        this.hitboxRotationX += amount;
        
        if (this.leftHitbox) {
            this.leftHitbox.setAttribute('rotation', `${this.hitboxRotationX} 0 0`);
        }
        if (this.rightHitbox) {
            this.rightHitbox.setAttribute('rotation', `${this.hitboxRotationX} 0 0`);
        }
        
        console.log(`Hitbox rotation: ${this.hitboxRotationX}°`);
    },
    
    createSpheres: function() {
        for (let i = 0; i < 11; i++) {
            let angle = -40 + (i * 8);
            let x = this.radius * Math.sin(angle * Math.PI / 180);
            let z = -this.radius * Math.cos(angle * Math.PI / 180);
            
            let sphere = document.createElement('a-sphere');
            sphere.setAttribute('position', `${x} ${this.height} ${z}`);
            sphere.setAttribute('color', '#ff0000');
            sphere.setAttribute('radius', '0.05');
            sphere.setAttribute('visible', 'false');
            sphere.setAttribute('id', `sphere-${i}`);
            
            this.el.sceneEl.appendChild(sphere);
            this.allSpheres.push(sphere);
        }
    },
    
    createFloatingNumber: function(spherePosition, points, hitType) {
        const floatingNumber = document.createElement('a-entity');
        floatingNumber.setAttribute('position', `${spherePosition.x} ${spherePosition.y + 0.1} ${spherePosition.z}`);
        floatingNumber.setAttribute('floating-number', {
            value: points,
            hitType: hitType
        });
        
        this.el.sceneEl.appendChild(floatingNumber);
    },
    
    setupCalibration: function() {
        document.addEventListener('keydown', (event) => {
            const audioManager = document.querySelector('#audio-manager').components['audio-manager'];
            
            if (event.code === 'Space') {
                audioManager.playCalibrationSound('reach-calibration');
                this.calibrateReach();
            }
            if (event.code === 'KeyH') {
                audioManager.playCalibrationSound('height-calibration');
                this.calibrateHeight();
            }
            if (event.code === 'KeyL') {
                audioManager.playCalibrationSound('lap-calibration');
                this.calibrateLap();
            }
            if (event.code === 'KeyS') {
                audioManager.playCalibrationSound('switch');
                this.saveData();
            }
            if (event.code === 'KeyP') {
                // Check if hitboxes are ready before starting
                if (!this.hitboxReady) {
                    console.warn('⚠ Cannot start: Hitboxes not ready yet. Please wait...');
                    return;
                }
                
                audioManager.playCalibrationSound('switch');
                this.resumeGame();
                
                const startTime = Date.now();
                
                const kinematicsManager = document.querySelector('#kinematics-manager').components['kinematics-manager'];
                kinematicsManager.startTracking(startTime);
                
                const dataManager = document.querySelector('#data-manager').components['data-manager'];
                dataManager.startSession(startTime);
            }
            if (event.code === 'KeyC') {
                audioManager.playCalibrationSound('switch');
                const scoreManager = document.querySelector('#score-display').components['score-manager'];
                scoreManager.toggleCondition();
            }
            if (event.code === 'Digit1') {
                audioManager.playCalibrationSound('switch');
                const scoreManager = document.querySelector('#score-display').components['score-manager'];
                scoreManager.setDominantHand('LEFT');
            }
            if (event.code === 'Digit2') {
                audioManager.playCalibrationSound('switch');
                const scoreManager = document.querySelector('#score-display').components['score-manager'];
                scoreManager.setDominantHand('RIGHT');
            }
            if (event.code === 'KeyN') {
                audioManager.playCalibrationSound('switch');
                this.switchToShortSession();
            }
            if (event.code === 'KeyF') {
                audioManager.playCalibrationSound('switch');
                this.setTwoReachesPerSphere();
            }
            if (event.code === 'KeyB') {
                audioManager.playCalibrationSound('switch');
                this.setBlockMode();
            }
            if (event.code === 'KeyZ') {
                audioManager.playCalibrationSound('switch');
                this.skipTarget();
            }
            
            // Hitbox controls
            if (event.code === 'KeyV') {
                audioManager.playCalibrationSound('switch');
                this.toggleHitboxVisibility();
            }
            if (event.code === 'BracketLeft') {  // [
                audioManager.playCalibrationSound('switch');
                this.adjustHitboxSize('width', -0.01);
            }
            if (event.code === 'BracketRight') {  // ]
                audioManager.playCalibrationSound('switch');
                this.adjustHitboxSize('width', 0.01);
            }
            if (event.code === 'Minus') {  // -
                audioManager.playCalibrationSound('switch');
                this.adjustHitboxSize('height', -0.01);
            }
            if (event.code === 'Equal') {  // =
                audioManager.playCalibrationSound('switch');
                this.adjustHitboxSize('height', 0.01);
            }
            if (event.code === 'Semicolon') {  // ;
                audioManager.playCalibrationSound('switch');
                this.adjustHitboxSize('depth', -0.01);
            }
            if (event.code === 'Quote') {  // '
                audioManager.playCalibrationSound('switch');
                this.adjustHitboxSize('depth', 0.01);
            }
            if (event.code === 'Comma') {  // ,
                audioManager.playCalibrationSound('switch');
                this.adjustHitboxRotation(-5);
            }
            if (event.code === 'Period') {  // .
                audioManager.playCalibrationSound('switch');
                this.adjustHitboxRotation(5);
            }
        });
    },
    
    calibrateReach: function() {
        const camera = document.querySelector('a-scene').camera;
        const cameraPos = camera.el.getAttribute('position');
        
        const rightPos = this.getHandPosition(this.rightController);
        
        if (rightPos && cameraPos) {
            const distance = Math.sqrt(
                Math.pow(rightPos.x - cameraPos.x, 2) +
                Math.pow(rightPos.y - cameraPos.y, 2) +
                Math.pow(rightPos.z - cameraPos.z, 2)
            );
            
            this.radius = Math.max(0.3, 0.8 * distance);
            
            this.updateSpherePositions();
        }
    },
    
    calibrateHeight: function() {
        const camera = document.querySelector('a-scene').camera;
        const cameraPos = camera.el.getAttribute('position');
        
        if (cameraPos && cameraPos.y !== undefined) {
            this.height = Math.max(0.5, 0.8 * cameraPos.y);
            
            this.updateSpherePositions();
            
            this.updateTextPositions();
        }
    },
    
    calibrateLap: function() {
        const leftPos = this.getHandPosition(this.leftController);
        const rightPos = this.getHandPosition(this.rightController);
        
        if (leftPos && leftPos.y !== undefined && leftPos.z !== undefined) {
            this.leftRectangle.setAttribute('position', `${leftPos.x} ${leftPos.y} ${leftPos.z + 0.02}`);
        }
        
        if (rightPos && rightPos.y !== undefined && rightPos.z !== undefined) {
            this.rightRectangle.setAttribute('position', `${rightPos.x} ${rightPos.y} ${rightPos.z + 0.02}`);
        }
    },
    
    saveData: function() {
        const dataManager = document.querySelector('#data-manager').components['data-manager'];
        dataManager.exportCSV();
        const kinematicsManager = document.querySelector('#kinematics-manager').components['kinematics-manager'];
        kinematicsManager.exportCSV();
    },
    
    updateTextPositions: function() {
        if (this.scoreDisplay && this.progressDisplay) {
            this.scoreDisplay.setAttribute('position', `0 ${this.height + 0.2} -1.2`);
            
            this.progressDisplay.setAttribute('position', `0 ${this.height + 0.1} -1.2`);
        }
    },
    
    updateSpherePositions: function() {
        for (let i = 0; i < 11; i++) {
            let angle = -40 + (i * 8);
            let x = this.radius * Math.sin(angle * Math.PI / 180);
            let z = -this.radius * Math.cos(angle * Math.PI / 180);
            
            this.allSpheres[i].setAttribute('position', `${x} ${this.height} ${z}`);
        }
    },
    
    resumeGame: function() {
        this.isPaused = false;
    },
    
    tick: function() {
        if (!this.isPaused) {
            const leftRectanglePos = this.leftRectangle.getAttribute('position');
            const rightRectanglePos = this.rightRectangle.getAttribute('position');
            
            const leftPos = this.getHandPosition(this.leftController);
            const rightPos = this.getHandPosition(this.rightController);
            
            if (this.currentState === 'invisible') {
                const leftInHome = leftPos && this.isInsideRectangle(leftPos, leftRectanglePos);
                const rightInHome = rightPos && this.isInsideRectangle(rightPos, rightRectanglePos);
                
                if (leftInHome && rightInHome) {
                    this.selectRandomSphere();
                    if (this.activeSphere) {
                        this.currentState = 'waiting-to-appear';
                        this.startAppearTimer();
                    }
                }
            }
            
            if (this.currentState === 'visible' && this.activeSphere) {
                const spherePos = this.activeSphere.getAttribute('position');
                
                // Use box collision detection instead of sphere collision
                const leftHit = leftPos && this.isInsideBoxHitbox(spherePos, this.leftHitbox);
                const rightHit = rightPos && this.isInsideBoxHitbox(spherePos, this.rightHitbox);
                
                const leftInHome = leftPos && this.isInsideRectangle(leftPos, leftRectanglePos);
                const rightInHome = rightPos && this.isInsideRectangle(rightPos, rightRectanglePos);
                
                let handUsed = null;
                
                if (leftHit && !leftInHome) {
                    handUsed = 'LEFT';
                } else if (rightHit && !rightInHome) {
                    handUsed = 'RIGHT';
                }
                
                if (handUsed && !this.decisionTimeRecorded) {
                    const dataManager = document.querySelector('#data-manager').components['data-manager'];
                    dataManager.stopDecisionTimer();
                    this.decisionTimeRecorded = true;
                }
                
                if (handUsed) {
                    const scoreManager = document.querySelector('#score-display').components['score-manager'];
                    const hitResult = scoreManager.calculateHitPoints(handUsed);
                    
                    scoreManager.addPoints(hitResult.points);
                    
                    this.activeSphere.setAttribute('color', hitResult.hitType === 'critical' ? '#FFD700' : '#00FF00');
                    
                    const spherePosition = this.activeSphere.getAttribute('position');
                    this.createFloatingNumber(spherePosition, hitResult.points, hitResult.hitType);
                    
                    const dataManager = document.querySelector('#data-manager').components['data-manager'];
                    dataManager.calculateAndStoreMovementTime();
                    const decisionTime = dataManager.currentDecisionTime;
                    
                    const sphereIndex = this.allSpheres.indexOf(this.activeSphere);
                    dataManager.recordTrial(sphereIndex, handUsed, hitResult.points, hitResult.hitType, decisionTime);
                    
                    this.currentState = 'hit';
                    this.startDisappearTimer();
                }
            }
        }
    },
    
    switchToShortSession: function() {
        if (this.trialsSwitched) return;
        
        this.appearancesPerSphere = 10;
        this.totalTrials = 110;
        this.trialsSwitched = true;
        
        const dataManager = document.querySelector('#data-manager').components['data-manager'];
        dataManager.updateTotalTrials(110);
    },
    
    setTwoReachesPerSphere: function() {
        if (this.trialsSwitched) return;
        
        this.appearancesPerSphere = 4;
        this.totalTrials = 44;
        this.trialsSwitched = true;
        this.fModeActive = true;
        this.currentPhase = 0;
        this.phaseAppearanceCounts = [0,0,0,0,0,0,0,0,0,0,0];
        
        const dataManager = document.querySelector('#data-manager').components['data-manager'];
        dataManager.updateTotalTrials(44);
    },
    
    setBlockMode: function() {
        if (this.trialsSwitched) return;
        
        this.appearancesPerSphere = 2;
        this.totalTrials = 110;
        this.trialsSwitched = true;
        this.bModeActive = true;
        this.phaseAppearanceCounts = [0,0,0,0,0,0,0,0,0,0,0];
        
        const dataManager = document.querySelector('#data-manager').components['data-manager'];
        dataManager.updateTotalTrials(110);
    },
    
    skipTarget: function() {
        if (!this.activeSphere) {
            return;
        }
        
        if (this.currentState !== 'waiting-to-appear' && this.currentState !== 'visible') {
            return;
        }
        
        const sphereIndex = this.allSpheres.indexOf(this.activeSphere);
        
        if (this.currentState === 'waiting-to-appear') {
            this.appearanceCounts[sphereIndex]++;
            this.totalAppearances++;
            
            if (this.fModeActive || this.bModeActive) {
                this.phaseAppearanceCounts[sphereIndex]++;
                
                if (this.fModeActive && this.totalAppearances === 22) {
                    this.currentPhase = 1;
                    this.phaseAppearanceCounts = [0,0,0,0,0,0,0,0,0,0,0];
                }
                
                if (this.bModeActive && this.totalAppearances % 22 === 0) {
                    this.phaseAppearanceCounts = [0,0,0,0,0,0,0,0,0,0,0];
                }
            }
            
            const scoreManager = document.querySelector('#score-display').components['score-manager'];
            scoreManager.updateProgress(this.totalAppearances, this.totalTrials);
        }
        
        const dataManager = document.querySelector('#data-manager').components['data-manager'];
        dataManager.recordTrial(sphereIndex, 'NA', 0, 'SKIP', 0);
        
        if (this.appearTimer) {
            clearTimeout(this.appearTimer);
            this.appearTimer = null;
        }
        if (this.disappearTimer) {
            clearTimeout(this.disappearTimer);
            this.disappearTimer = null;
        }
        
        this.activeSphere.setAttribute('visible', false);
        
        this.activeSphere = null;
        this.decisionTimeRecorded = false;
        this.currentState = 'invisible';
    },
    
    getHandPosition: function(handController) {
        if (!handController?.components?.['hand-tracking-controls']) {
            return null;
        }
        return handController.components['hand-tracking-controls'].indexTipPosition;
    },
    
    selectRandomSphere: function() {
        let availablePositions = [];
        
        if (this.fModeActive || this.bModeActive) {
            for (let i = 0; i < 11; i++) {
                if (this.phaseAppearanceCounts[i] < 2 && i !== this.lastSelectedPosition) {
                    availablePositions.push(i);
                }
            }
            
            if (availablePositions.length === 0) {
                for (let i = 0; i < 11; i++) {
                    if (this.phaseAppearanceCounts[i] < 2) {
                        availablePositions.push(i);
                    }
                }
            }
        } else {
            for (let i = 0; i < 11; i++) {
                if (this.appearanceCounts[i] < this.appearancesPerSphere && i !== this.lastSelectedPosition) {
                    availablePositions.push(i);
                }
            }
            
            if (availablePositions.length === 0) {
                for (let i = 0; i < 11; i++) {
                    if (this.appearanceCounts[i] < this.appearancesPerSphere) {
                        availablePositions.push(i);
                    }
                }
            }
        }
        
        if (availablePositions.length === 0) {
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        const selectedPosition = availablePositions[randomIndex];
        this.activeSphere = this.allSpheres[selectedPosition];
        this.lastSelectedPosition = selectedPosition;
    },
    
    startAppearTimer: function() {
        this.appearTimer = setTimeout(() => {
            this.activeSphere.setAttribute('visible', true);
            this.activeSphere.setAttribute('color', '#ff0000');
            
            const sphereIndex = this.allSpheres.indexOf(this.activeSphere);
            this.appearanceCounts[sphereIndex]++;
            this.totalAppearances++;
            
            if (this.fModeActive || this.bModeActive) {
                this.phaseAppearanceCounts[sphereIndex]++;
                
                if (this.fModeActive && this.totalAppearances === 22) {
                    this.currentPhase = 1;
                    this.phaseAppearanceCounts = [0,0,0,0,0,0,0,0,0,0,0];
                }
                
                if (this.bModeActive && this.totalAppearances % 22 === 0) {
                    this.phaseAppearanceCounts = [0,0,0,0,0,0,0,0,0,0,0];
                }
            }
            
            const scoreManager = document.querySelector('#score-display').components['score-manager'];
            scoreManager.updateProgress(this.totalAppearances, this.totalTrials);
            
            const dataManager = document.querySelector('#data-manager').components['data-manager'];
            dataManager.startDecisionTimer();
            this.decisionTimeRecorded = false;
            
            this.currentState = 'visible';
            this.appearTimer = null;
        }, 500);
    },
    
    startDisappearTimer: function() {
        this.disappearTimer = setTimeout(() => {
            this.activeSphere.setAttribute('visible', false);
            this.activeSphere = null;
            this.decisionTimeRecorded = false;
            this.currentState = 'invisible';
            this.disappearTimer = null;
        }, 300);
    },
    
    isInsideBoxHitbox: function(spherePos, hitbox) {
        // If hitbox doesn't exist yet or object3D not ready, return false
        if (!hitbox || !hitbox.object3D) {
            return false;
        }
        
        // Get the world position and rotation of the hitbox
        const boxWorldPos = new THREE.Vector3();
        hitbox.object3D.getWorldPosition(boxWorldPos);
        
        const boxWorldQuat = new THREE.Quaternion();
        hitbox.object3D.getWorldQuaternion(boxWorldQuat);
        
        // Create a vector for the sphere position
        const sphereVec = new THREE.Vector3(spherePos.x, spherePos.y, spherePos.z);
        
        // Transform sphere position into box's local space
        const localPos = sphereVec.clone().sub(boxWorldPos);
        const inverseQuat = boxWorldQuat.clone().invert();
        localPos.applyQuaternion(inverseQuat);
        
        // Check if local position is within box bounds (half extents)
        const halfWidth = this.hitboxWidth / 2;
        const halfHeight = this.hitboxHeight / 2;
        const halfDepth = this.hitboxDepth / 2;
        
        return Math.abs(localPos.x) < halfWidth &&
               Math.abs(localPos.y) < halfHeight &&
               Math.abs(localPos.z) < halfDepth;
    },
    
    isInsideSphere: function(handPos, spherePos) {
        const hitRadius = 0.08;
        const distance = Math.sqrt(
            Math.pow(handPos.x - spherePos.x, 2) +
            Math.pow(handPos.y - spherePos.y, 2) +
            Math.pow(handPos.z - spherePos.z, 2)
        );
        return distance < hitRadius;
    },
    
    isInsideRectangle: function(handPos, rectanglePos) {
        const width = 0.12;
        const height = 0.045;
        const depth = 0.09;
        return Math.abs(handPos.x - rectanglePos.x) < width &&
               Math.abs(handPos.y - rectanglePos.y) < height &&
               Math.abs(handPos.z - rectanglePos.z) < depth;
    },
    
    remove: function() {
        // Clean up interval if still running
        if (this.hitboxInitInterval) {
            clearInterval(this.hitboxInitInterval);
        }
        
        // Remove hitbox entities if they exist
        if (this.leftHitbox && this.leftHitbox.parentNode) {
            this.leftHitbox.parentNode.removeChild(this.leftHitbox);
        }
        if (this.rightHitbox && this.rightHitbox.parentNode) {
            this.rightHitbox.parentNode.removeChild(this.rightHitbox);
        }
    }
});
