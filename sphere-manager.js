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
        
        this.leftRectangle = document.querySelector('#left-rectangle');
        this.rightRectangle = document.querySelector('#right-rectangle');
        this.leftController = document.querySelector('[hand-tracking-controls="hand: left"]');
        this.rightController = document.querySelector('[hand-tracking-controls="hand: right"]');
        this.scoreDisplay = document.querySelector('#score-display');
        this.progressDisplay = document.querySelector('#progress-display');
        
        this.createSpheres();
        this.setupCalibration();
        this.updateTextPositions();
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
    
    setupCalibration: function() {
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                this.calibrateReach();
            }
            if (event.code === 'KeyH') {
                this.calibrateHeight();
            }
            if (event.code === 'KeyL') {
                this.calibrateLap();
            }
            if (event.code === 'KeyS') {
                this.saveData();
            }
            if (event.code === 'KeyP') {
                this.resumeGame();
            }
            if (event.code === 'KeyC') {
                const scoreManager = document.querySelector('#score-display').components['score-manager'];
                scoreManager.toggleCondition();
            }
            if (event.code === 'Digit1') {
                const scoreManager = document.querySelector('#score-display').components['score-manager'];
                scoreManager.setDominantHand('LEFT');
            }
            if (event.code === 'Digit2') {
                const scoreManager = document.querySelector('#score-display').components['score-manager'];
                scoreManager.setDominantHand('RIGHT');
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
        
        if (leftPos && leftPos.y !== undefined) {
            const currentLeftPos = this.leftRectangle.getAttribute('position');
            this.leftRectangle.setAttribute('position', `${leftPos.x} ${leftPos.y} ${currentLeftPos.z}`);
        }
        
        if (rightPos && rightPos.y !== undefined) {
            const currentRightPos = this.rightRectangle.getAttribute('position');
            this.rightRectangle.setAttribute('position', `${rightPos.x} ${rightPos.y} ${currentRightPos.z}`);
        }
    },
    
    saveData: function() {
        const dataManager = document.querySelector('#data-manager').components['data-manager'];
        dataManager.exportCSV();
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
            const leftController = this.leftController;
            const rightController = this.rightController;
            
            if (this.currentState === 'invisible') {
                if (leftController && rightController) {
                    const leftPos = this.getHandPosition(leftController);
                    const rightPos = this.getHandPosition(rightController);
                    if (leftPos && rightPos && this.isInsideRectangle(leftPos, leftRectanglePos) && this.isInsideRectangle(rightPos, rightRectanglePos)) {
                        if (!this.appearTimer) {
                            this.selectRandomSphere();
                            if (this.activeSphere) {
                                this.startAppearTimer();
                                this.currentState = 'waiting-to-appear';
                            }
                        }
                    }
                }
            }
            
            if (this.currentState === 'waiting-to-appear') {
                if (leftController && rightController) {
                    const leftPos = this.getHandPosition(leftController);
                    const rightPos = this.getHandPosition(rightController);
                    if (!leftPos || !rightPos || !this.isInsideRectangle(leftPos, leftRectanglePos) || !this.isInsideRectangle(rightPos, rightRectanglePos)) {
                        clearTimeout(this.appearTimer);
                        this.appearTimer = null;
                        this.activeSphere = null;
                        this.currentState = 'invisible';
                    }
                }
            }
            
            if (this.currentState === 'visible' && this.activeSphere) {
                const spherePos = this.activeSphere.getAttribute('position');
                const leftPos = this.getHandPosition(leftController);
                const rightPos = this.getHandPosition(rightController);
                
                let leftHit = leftPos && this.isInsideSphere(leftPos, spherePos);
                let rightHit = rightPos && this.isInsideSphere(rightPos, spherePos);
                
                if (!this.decisionTimeRecorded && leftPos && rightPos) {
                    const leftInRect = this.isInsideRectangle(leftPos, leftRectanglePos);
                    const rightInRect = this.isInsideRectangle(rightPos, rightRectanglePos);
                    
                    if (!leftInRect || !rightInRect) {
                        const dataManager = document.querySelector('#data-manager').components['data-manager'];
                        dataManager.stopDecisionTimer();
                        this.decisionTimeRecorded = true;
                    }
                }
                
                if ((leftHit || rightHit) && !this.disappearTimer) {
                    this.activeSphere.setAttribute('color', '#0000ff');
                    
                    const handUsed = leftHit ? 'LEFT' : 'RIGHT';
                    
                    const scoreManager = document.querySelector('#score-display').components['score-manager'];
                    const hitResult = scoreManager.calculateHitPoints(handUsed);
                    scoreManager.addPoints(hitResult.points);
                    
                    const sphereIndex = this.allSpheres.indexOf(this.activeSphere);
                    const dataManager = document.querySelector('#data-manager').components['data-manager'];
                    dataManager.recordTrial(sphereIndex, handUsed, hitResult.points, hitResult.hitType, dataManager.currentDecisionTime);
                    
                    this.startDisappearTimer();
                    this.currentState = 'waiting-to-disappear';
                }
            }
        }
    },
    
    getHandPosition: function(handController) {
        if (!handController?.components?.['hand-tracking-controls']) {
            return null;
        }
        return handController.components['hand-tracking-controls'].indexTipPosition;
    },
    
    selectRandomSphere: function() {
        let availablePositions = [];
        for (let i = 0; i < 11; i++) {
            if (this.appearanceCounts[i] < 10 && i !== this.lastSelectedPosition) {
                availablePositions.push(i);
            }
        }
        
        if (availablePositions.length === 0) {
            for (let i = 0; i < 11; i++) {
                if (this.appearanceCounts[i] < 10) {
                    availablePositions.push(i);
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
            
            const scoreManager = document.querySelector('#score-display').components['score-manager'];
            scoreManager.updateProgress(this.totalAppearances, 110);
            
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
        const width = 0.45;
        const height = 0.2;
        const depth = 0.35;
        return Math.abs(handPos.x - rectanglePos.x) < width &&
               Math.abs(handPos.y - rectanglePos.y) < height &&
               Math.abs(handPos.z - rectanglePos.z) < depth;
    }
});
