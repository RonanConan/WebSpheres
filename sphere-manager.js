AFRAME.registerComponent('sphere-manager', {
    init: function() {
        this.currentState = 'invisible';
        this.activeSphere = null;
        this.allSpheres = [];
        this.appearTimer = null;
        this.disappearTimer = null;
        this.appearanceCounts = [0,0,0,0,0,0,0,0,0,0,0];
        this.totalAppearances = 0;
        this.createSpheres();
    },
    
    createSpheres: function() {
        const radius = 0.7;
        const height = 1.2;
        
        for (let i = 0; i < 11; i++) {
            let angle = -60 + (i * 12);
            let x = radius * Math.sin(angle * Math.PI / 180);
            let z = -radius * Math.cos(angle * Math.PI / 180);
            
            let sphere = document.createElement('a-sphere');
            sphere.setAttribute('position', `${x} ${height} ${z}`);
            sphere.setAttribute('color', '#ff0000');
            sphere.setAttribute('radius', '0.025');
            sphere.setAttribute('visible', 'false');
            sphere.setAttribute('id', `sphere-${i}`);
            
            this.el.sceneEl.appendChild(sphere);
            this.allSpheres.push(sphere);
        }
    },
    
    tick: function() {
        const rectangle = document.querySelector('#rectangle');
        const rectanglePos = rectangle.getAttribute('position');
        const leftController = document.querySelector('[meta-touch-controls="hand: left"]');
        const rightController = document.querySelector('[meta-touch-controls="hand: right"]');
        
        if (this.currentState === 'invisible') {
            if (leftController && rightController) {
                const leftPos = leftController.getAttribute('position');
                const rightPos = rightController.getAttribute('position');
                if (this.isInsideRectangle(leftPos, rectanglePos) && this.isInsideRectangle(rightPos, rectanglePos)) {
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
                const leftPos = leftController.getAttribute('position');
                const rightPos = rightController.getAttribute('position');
                if (!this.isInsideRectangle(leftPos, rectanglePos) || !this.isInsideRectangle(rightPos, rectanglePos)) {
                    clearTimeout(this.appearTimer);
                    this.appearTimer = null;
                    this.activeSphere = null;
                    this.currentState = 'invisible';
                }
            }
        }
        
        if (this.currentState === 'visible' && this.activeSphere) {
            const spherePos = this.activeSphere.getAttribute('position');
            let leftHit = leftController && this.isInsideSphere(leftController.getAttribute('position'), spherePos);
            let rightHit = rightController && this.isInsideSphere(rightController.getAttribute('position'), spherePos);
            
            if ((leftHit || rightHit) && !this.disappearTimer) {
                this.activeSphere.setAttribute('color', '#0000ff');
                const scoreManager = document.querySelector('#score-display').components['score-manager'];
                const points = scoreManager.calculateHitPoints();
                scoreManager.addPoints(points);
                this.startDisappearTimer();
                this.currentState = 'waiting-to-disappear';
            }
        }
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
            
            this.currentState = 'visible';
            this.appearTimer = null;
        }, 500);
    },
    
    startDisappearTimer: function() {
        this.disappearTimer = setTimeout(() => {
            this.activeSphere.setAttribute('visible', false);
            this.activeSphere = null;
            this.currentState = 'invisible';
            this.disappearTimer = null;
        }, 300);
    },
    
    isInsideSphere: function(controllerPos, spherePos) {
        const size = 0.05;
        return Math.abs(controllerPos.x - spherePos.x) < size &&
               Math.abs(controllerPos.y - spherePos.y) < size &&
               Math.abs(controllerPos.z - spherePos.z) < size;
    },
    
    isInsideRectangle: function(controllerPos, rectanglePos) {
        const width = 0.4;
        const height = 0.15;
        const depth = 0.3;
        return Math.abs(controllerPos.x - rectanglePos.x) < width &&
               Math.abs(controllerPos.y - rectanglePos.y) < height &&
               Math.abs(controllerPos.z - rectanglePos.z) < depth;
    }
});
