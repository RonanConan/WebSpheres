AFRAME.registerComponent('sphere-manager', {
    init: function () {
        this.currentState = 'invisible';
        this.activeSphere = null;
        this.allSpheres = [];
        this.appearTimer = null;
        this.disappearTimer = null;
        this.appearanceCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
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
        this.phaseAppearanceCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        this.leftJoints = null;
        this.rightJoints = null;
        this.collisionMargin = 0.02;

        this.leftWasAtHome = false;
        this.rightWasAtHome = false;
        this.homeTrackingInitialized = false;

        this.leftRectangle = document.querySelector('#left-rectangle');
        this.rightRectangle = document.querySelector('#right-rectangle');
        this.leftController = document.querySelector('[hand-tracking-controls="hand: left"]');
        this.rightController = document.querySelector('[hand-tracking-controls="hand: right"]');

        this.scoreDisplay = document.querySelector('#score-display');
        this.progressDisplay = document.querySelector('#progress-display');
        this.sparkleBurst = null;

        this._onExtrasReady = this.onExtrasReady.bind(this);
        if (this.leftController) {
            this.leftController.addEventListener('hand-tracking-extras-ready', this._onExtrasReady);
        }
        if (this.rightController) {
            this.rightController.addEventListener('hand-tracking-extras-ready', this._onExtrasReady);
        }

        this.createSpheres();
        this.setupCalibration();
        this.updateTextPositions();
    },

    onExtrasReady: function (evt) {
        const joints = evt?.detail?.data?.joints;
        if (!joints) return;

        const handAttr = evt.target.getAttribute('hand-tracking-controls');
        const side = handAttr && handAttr.hand;

        if (side === 'left') {
            this.leftJoints = joints;
        }
        if (side === 'right') {
            this.rightJoints = joints;
        }
    },

    createSpheres: function () {
        for (let i = 0; i < 11; i++) {
            let angle = -40 + (i * 8);
            let x = this.radius * Math.sin(angle * Math.PI / 180);
            let z = -this.radius * Math.cos(angle * Math.PI / 180);

            let crystal = document.createElement('a-octahedron');
            crystal.setAttribute('position', `${x} ${this.height} ${z}`);
            crystal.setAttribute('material', 'color: #00FFFF; opacity: 0.8; transparent: true; metalness: 0.8; roughness: 0.2');
            crystal.setAttribute('radius', '0.06');
            crystal.setAttribute('visible', 'false');
            crystal.setAttribute('id', `sphere-${i}`);
            crystal.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 5000; easing: linear');

            this.el.sceneEl.appendChild(crystal);
            this.allSpheres.push(crystal);
        }
    },

    createFloatingNumber: function (spherePosition, points, hitType) {
        try {
            const floatingNumber = document.createElement('a-entity');
            floatingNumber.setAttribute('position', `${spherePosition.x} ${spherePosition.y + 0.1} ${spherePosition.z}`);
            floatingNumber.setAttribute('floating-number', {
                value: points,
                hitType: hitType
            });
            this.el.sceneEl.appendChild(floatingNumber);
        } catch (e) {
            console.warn("Error creating floating number:", e);
        }
    },

    // MODIFIED: Torus is now Horizontal, Smaller, Slower, and More Transparent
    createShockwave: function (position) {
        try {
            const torus = document.createElement('a-torus');
            torus.setAttribute('position', `${position.x} ${position.y} ${position.z}`);

            // ORIENTATION: Rotate 90 degrees on X to lie flat (Horizontal)
            torus.setAttribute('rotation', '90 0 0');

            // Dimensions
            torus.setAttribute('radius', '0.1');
            torus.setAttribute('radius-tubular', '0.01');
            torus.setAttribute('segments-tubular', '32');
            torus.setAttribute('segments-radial', '16');

            // VISUALS: Lower opacity (0.4)
            torus.setAttribute('material', 'color: #FFD700; opacity: 0.4; transparent: true; shader: flat');

            // Animation 1: Expand Scale (Reduced from 6 to 3 for smaller size)
            // Slower Duration: Increased from 400 to 600
            torus.setAttribute('animation', {
                property: 'scale',
                to: '3 3 3',
                dur: 600,
                easing: 'easeOutQuad'
            });

            // Animation 2: Fade Out (Matches new duration)
            torus.setAttribute('animation__fade', {
                property: 'material.opacity',
                from: 0.4,
                to: 0,
                dur: 600,
                easing: 'easeOutQuad'
            });

            this.el.sceneEl.appendChild(torus);

            // Cleanup
            setTimeout(() => {
                if (torus.parentNode) torus.parentNode.removeChild(torus);
            }, 650);
        } catch (e) {
            console.warn("Error creating shockwave:", e);
        }
    },

    setupCalibration: function () {
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
        });
    },

    calibrateReach: function () {
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

    calibrateHeight: function () {
        const camera = document.querySelector('a-scene').camera;
        const cameraPos = camera.el.getAttribute('position');
        if (cameraPos && cameraPos.y !== undefined) {
            this.height = Math.max(0.5, 0.8 * cameraPos.y);
            this.updateSpherePositions();
            this.updateTextPositions();
        }
    },

    calibrateLap: function () {
        const leftPos = this.getHandPosition(this.leftController);
        const rightPos = this.getHandPosition(this.rightController);

        if (leftPos && leftPos.y !== undefined && leftPos.z !== undefined) {
            this.leftRectangle.setAttribute('position', `${leftPos.x} ${leftPos.y} ${leftPos.z + 0.02}`);
        }
        if (rightPos && rightPos.y !== undefined && rightPos.z !== undefined) {
            this.rightRectangle.setAttribute('position', `${rightPos.x} ${rightPos.y} ${rightPos.z + 0.02}`);
        }
    },

    saveData: function () {
        const dataManager = document.querySelector('#data-manager').components['data-manager'];
        dataManager.exportCSV();
        const kinematicsManager = document.querySelector('#kinematics-manager').components['kinematics-manager'];
        kinematicsManager.exportCSV();
    },

    updateTextPositions: function () {
        const dashboard = document.querySelector('#holo-dashboard');
        if (dashboard) {
            dashboard.setAttribute('position', `0 ${this.height + 0.3} -1.2`);
        } else {
            if (this.scoreDisplay) {
                this.scoreDisplay.setAttribute('position', `0 ${this.height + 0.6} -1.2`);
            }
            if (this.progressDisplay) {
                this.progressDisplay.setAttribute('position', `0 ${this.height + 0.4} -1.2`);
            }
        }
    },

    updateSpherePositions: function () {
        for (let i = 0; i < 11; i++) {
            let angle = -40 + (i * 8);
            let x = this.radius * Math.sin(angle * Math.PI / 180);
            let z = -this.radius * Math.cos(angle * Math.PI / 180);
            this.allSpheres[i].setAttribute('position', `${x} ${this.height} ${z}`);
        }
    },

    resumeGame: function () {
        this.isPaused = false;
        this.currentState = 'invisible';
    },

    pauseGame: function () {
        this.isPaused = true;
        if (this.appearTimer) {
            clearTimeout(this.appearTimer);
            this.appearTimer = null;
        }
        if (this.disappearTimer) {
            clearTimeout(this.disappearTimer);
            this.disappearTimer = null;
        }
        if (this.activeSphere) {
            this.activeSphere.setAttribute('visible', false);
        }
        this.currentState = 'invisible';
    },

    switchToShortSession: function () {
        if (this.trialsSwitched) return;
        this.appearancesPerSphere = 10;
        this.totalTrials = 110;
        this.trialsSwitched = true;
        const dataManager = document.querySelector('#data-manager').components['data-manager'];
        dataManager.updateTotalTrials(110);
    },

    setTwoReachesPerSphere: function () {
        if (this.trialsSwitched) return;
        this.appearancesPerSphere = 4;
        this.totalTrials = 44;
        this.trialsSwitched = true;
        this.fModeActive = true;
        this.currentPhase = 0;
        this.phaseAppearanceCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        const dataManager = document.querySelector('#data-manager').components['data-manager'];
        dataManager.updateTotalTrials(44);
    },

    setBlockMode: function () {
        if (this.trialsSwitched) return;
        this.appearancesPerSphere = 2;
        this.totalTrials = 110;
        this.trialsSwitched = true;
        this.bModeActive = true;
        this.phaseAppearanceCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        const dataManager = document.querySelector('#data-manager').components['data-manager'];
        dataManager.updateTotalTrials(110);
    },

    skipTarget: function () {
        if (!this.activeSphere) return;
        if (this.currentState !== 'waiting-to-appear' && this.currentState !== 'visible') return;

        const sphereIndex = this.allSpheres.indexOf(this.activeSphere);

        if (this.currentState === 'waiting-to-appear') {
            this.appearanceCounts[sphereIndex]++;
            this.totalAppearances++;
            if (this.fModeActive || this.bModeActive) {
                this.phaseAppearanceCounts[sphereIndex]++;
                if (this.fModeActive && this.totalAppearances === 22) {
                    this.currentPhase = 1;
                    this.phaseAppearanceCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                }
                if (this.bModeActive && this.totalAppearances % 22 === 0) {
                    this.phaseAppearanceCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
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

    getHandPosition: function (handController) {
        if (!handController?.components?.['hand-tracking-controls']) {
            return null;
        }
        return handController.components['hand-tracking-controls'].indexTipPosition;
    },

    selectRandomSphere: function () {
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

        if (availablePositions.length === 0) return;

        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        const selectedPosition = availablePositions[randomIndex];
        this.activeSphere = this.allSpheres[selectedPosition];
        this.lastSelectedPosition = selectedPosition;
    },

    startAppearTimer: function () {
        this.appearTimer = setTimeout(() => {
            this.activeSphere.setAttribute('visible', true);

            const sphereIndex = this.allSpheres.indexOf(this.activeSphere);
            this.appearanceCounts[sphereIndex]++;
            this.totalAppearances++;

            if (this.fModeActive || this.bModeActive) {
                this.phaseAppearanceCounts[sphereIndex]++;
                if (this.fModeActive && this.totalAppearances === 22) {
                    this.currentPhase = 1;
                    this.phaseAppearanceCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                }
                if (this.bModeActive && this.totalAppearances % 22 === 0) {
                    this.phaseAppearanceCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
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

    startDisappearTimer: function () {
        this.disappearTimer = setTimeout(() => {
            this.activeSphere.setAttribute('visible', false);
            this.activeSphere = null;
            this.decisionTimeRecorded = false;
            this.homeTrackingInitialized = false;
            this.currentState = 'invisible';
            this.disappearTimer = null;
        }, 300);
    },

    isInsideSphere: function (handPos, spherePos) {
        const hitRadius = 0.08;
        const distance = Math.sqrt(
            Math.pow(handPos.x - spherePos.x, 2) +
            Math.pow(handPos.y - spherePos.y, 2) +
            Math.pow(handPos.z - spherePos.z, 2)
        );
        return distance < hitRadius;
    },

    isInsideRectangle: function (handPos, rectanglePos) {
        const width = 0.12;
        const height = 0.045;
        const depth = 0.09;
        return Math.abs(handPos.x - rectanglePos.x) < width &&
            Math.abs(handPos.y - rectanglePos.y) < height &&
            Math.abs(handPos.z - rectanglePos.z) < depth;
    },

    checkJointCollisions: function (joints, spherePos) {
        if (!joints) return false;
        const jointNames = [
            'Wrist',
            'T_Tip', 'T_Distal', 'T_Proximal', 'T_Metacarpal',
            'I_Tip', 'I_Distal', 'I_Intermediate', 'I_Proximal', 'I_Metacarpal',
            'M_Tip', 'M_Distal', 'M_Intermediate', 'M_Proximal', 'M_Metacarpal',
            'R_Tip', 'R_Distal', 'R_Intermediate', 'R_Proximal', 'R_Metacarpal',
            'L_Tip', 'L_Distal', 'L_Intermediate', 'L_Proximal', 'L_Metacarpal'
        ];

        const jointPos = new THREE.Vector3();

        for (let jointName of jointNames) {
            const joint = joints[jointName];
            if (!joint || !joint.isValid()) continue;
            joint.getPosition(jointPos);
            if (this.isInsideSphere(jointPos, spherePos)) return true;
        }
        return false;
    },

    handleHit: function (handUsed, spherePos) {
        if (this.currentState !== 'visible') return;

        try {
            const scoreManager = document.querySelector('#score-display').components['score-manager'];
            const result = scoreManager.calculateHitPoints(handUsed);
            scoreManager.addPoints(result.points, result.hitType);

            // SHATTER EFFECT: Hide crystal IMMEDIATELY
            this.activeSphere.setAttribute('visible', false);

            try {
                // 1. Create Floating Text (Ghost or Normal)
                this.createFloatingNumber(spherePos, result.points, result.hitType);

                if (result.hitType === 'critical') {
                    // 2. Sparkles (Existing)
                    if (!this.sparkleBurst) {
                        this.sparkleBurst = document.querySelector('#sparkle-burst');
                    }
                    if (this.sparkleBurst && this.sparkleBurst.components['sparkle-system']) {
                        const sphereVec3 = new THREE.Vector3(spherePos.x, spherePos.y, spherePos.z);
                        this.sparkleBurst.components['sparkle-system'].createBurst(sphereVec3);
                    }

                    // 3. NEW: Shockwave Torus
                    this.createShockwave(spherePos);
                }
            } catch (fxError) {
                console.warn("FX Generation failed:", fxError);
            }

            const sphereIndex = this.allSpheres.indexOf(this.activeSphere);
            const dataManager = document.querySelector('#data-manager').components['data-manager'];
            dataManager.calculateAndStoreMovementTime();
            dataManager.recordTrial(
                sphereIndex,
                handUsed,
                result.points,
                result.hitType,
                dataManager.currentDecisionTime
            );

        } catch (e) {
            console.error("Critical error in handleHit:", e);
        } finally {
            this.currentState = 'cooldown';
            this.startDisappearTimer();
        }
    },

    tick: function () {
        if (this.isPaused) return;
        const leftPos = this.getHandPosition(this.leftController);
        const rightPos = this.getHandPosition(this.rightController);
        const leftRectPos = this.leftRectangle.getAttribute('position');
        const rightRectPos = this.rightRectangle.getAttribute('position');

        const leftAtHome = leftPos && this.isInsideRectangle(leftPos, leftRectPos);
        const rightAtHome = rightPos && this.isInsideRectangle(rightPos, rightRectPos);

        if (this.currentState === 'invisible' && this.totalAppearances < this.totalTrials) {
            if (leftAtHome && rightAtHome) {
                this.selectRandomSphere();
                if (this.activeSphere) {
                    this.currentState = 'waiting-to-appear';
                    this.startAppearTimer();
                }
            }
        }

        if (this.currentState === 'visible') {
            if (!this.homeTrackingInitialized) {
                this.leftWasAtHome = leftAtHome;
                this.rightWasAtHome = rightAtHome;
                this.homeTrackingInitialized = true;
            }

            if (!this.decisionTimeRecorded) {
                const leftLeftHome = this.leftWasAtHome && !leftAtHome;
                const rightLeftHome = this.rightWasAtHome && !rightAtHome;

                if (leftLeftHome || rightLeftHome) {
                    const dataManager = document.querySelector('#data-manager').components['data-manager'];
                    dataManager.stopDecisionTimer();
                    this.decisionTimeRecorded = true;
                }
                this.leftWasAtHome = leftAtHome;
                this.rightWasAtHome = rightAtHome;
            }
        }

        if (this.currentState === 'visible' && this.activeSphere) {
            const spherePos = this.activeSphere.getAttribute('position');
            if (this.leftJoints || this.rightJoints) {
                const leftCollision = this.checkJointCollisions(this.leftJoints, spherePos);
                const rightCollision = this.checkJointCollisions(this.rightJoints, spherePos);
                if (leftCollision) { this.handleHit('LEFT', spherePos); return; }
                if (rightCollision) { this.handleHit('RIGHT', spherePos); return; }
            } else {
                if (leftPos && this.isInsideSphere(leftPos, spherePos)) { this.handleHit('LEFT', spherePos); }
                else if (rightPos && this.isInsideSphere(rightPos, spherePos)) { this.handleHit('RIGHT', spherePos); }
            }
        }
    }
});