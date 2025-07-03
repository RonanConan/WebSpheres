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
        
        // Cache DOM elements once for performance
        this.rectangle = document.querySelector('#rectangle');
        this.leftController = document.querySelector('[hand-tracking-controls="hand: left"]');
        this.rightController = document.querySelector('[hand-tracking-controls="hand: right"]');
        
        this.createSpheres();
    },
    
    createSpheres: function() {
        const radius = 0.7;
        const height = 1.2;
        
        for (let i = 0; i < 11; i++) {
            let angle = -40 + (i * 8);
            let x = radius * Math.sin(angle * Math.PI / 180);
            let z = -radius * Math.cos(angle * Math.PI / 180);
            
            let sphere = document.createElement('a-sphere');
            sphere.setAttribute('position', `${x} ${height} ${z}`);
            sphere.setAttribute('color', '#ff0000');
            sphere.setAttribute('radius', '0.035');
            sphere.setAttribute('visible', 'false');
            sphere.setAttribute('id', `sphere-${i}`);
            
            this.el.sceneEl.appendChild(sphere);
            this.allSpheres.push(sphere);
        }
    },
    
    tick: function() {
        const rectanglePos = this.rectangle.getAttribute('position');
        const leftController = this.leftController;
        const rightController = this.rightController;
        
        if (this.currentState === 'invisible') {
            if (leftController && rightController) {
                const leftPos = this.getHandPosition(leftController);
                const rightPos = this.getHandPosition(rightController);
                if (leftPos && rightPos && this.isInsideRectangle(leftPos, rectanglePos) && this.isInsideRectangle(rightPos, rectanglePos)) {
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
                if (!leftPos || !rightPos || !this.isInsideRectangle(leftPos, rectanglePos) || !this.isInsideRectangle(rightPos, rectanglePos)) {
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
            
            // Check if hands left rectangle (for decision time)
            if (!this.decisionTimeRecorded && leftPos && rightPos) {
                const leftInRect = this.isInsideRectangle(leftPos, rectanglePos);
                const rightInRect = this.isInsideRectangle(rightPos, rectanglePos);
                
                if (!leftInRect || !rightInRect) {
                    const dataManager = document.querySelector('#data-manager').components['data-manager'];
                    dataManager.stopDecisionTimer();
                    this.decisionTimeRecorded = true;
                }
            }
            
            if ((leftHit || rightHit) && !this.disappearTimer) {
                this.activeSphere.setAttribute('color', '#0000ff');
                
                // Determine which hand hit
                const handUsed = leftHit ? 'LEFT' : 'RIGHT';
                
                // Get hit result (points and type)
                const scoreManager = document.querySelector('#score-display').components['score-manager'];
                const hitResult = scoreManager.calculateHitPoints();
                scoreManager.addPoints(hitResult.points);
                
                // Record trial data with decision time
                const sphereIndex = this.allSpheres.indexOf(this.activeSphere);
                const dataManager = document.querySelector('#data-manager').components['data-manager'];
                dataManager.recordTrial(sphereIndex, handUsed, hitResult.points, hitResult.hitType, dataManager.currentDecisionTime);
                
                this.startDisappearTimer();
                this.currentState = 'waiting-to-disappear';
            }
        }
    },
    
    // Simple helper to get hand position (indexTipPosition only)
    getHandPosition: function(handController) {
        if (!handController?.components?.['hand-tracking-controls']) {
            return null;
        }
        return handController.components['hand-tracking-controls'].indexTipPosition;
    },
    
    selectRandomSphere: function() {
        let availablePositions = [];
        for (let i = 0; i < 11; i++) {
            if (this.appearanceCounts[i] < 10) {
                availablePositions.push(i);
            }
        }
        
        if (availablePositions.length === 0) {
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        const selectedPosition = availablePositions[randomIndex];
        this.activeSphere = this.allSpheres[selectedPosition];
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
            
            // Start decision timer when sphere appears
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
        // Spherical collision detection - 2x visual sphere size
        const hitRadius = 0.05;
        const distance = Math.sqrt(
            Math.pow(handPos.x - spherePos.x, 2) +
            Math.pow(handPos.y - spherePos.y, 2) +
            Math.pow(handPos.z - spherePos.z, 2)
        );
        return distance < hitRadius;
    },
    
    isInsideRectangle: function(handPos, rectanglePos) {
        // Slightly larger rectangle detection for hand tracking
        const width = 0.45;  // Increased from 0.4
        const height = 0.2;  // Increased from 0.15
        const depth = 0.35;  // Increased from 0.3
        return Math.abs(handPos.x - rectanglePos.x) < width &&
               Math.abs(handPos.y - rectanglePos.y) < height &&
               Math.abs(handPos.z - rectanglePos.z) < depth;
    }
});
