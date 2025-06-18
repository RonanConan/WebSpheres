AFRAME.registerComponent('controller-detector', {
    init: function() {
        this.currentState = 'invisible';
        this.appearTimer = null;
        this.disappearTimer = null;
    },
    
    tick: function() {
        const sphere = this.el;
        const spherePos = sphere.getAttribute('position');
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
                        this.startAppearTimer();
                        this.currentState = 'waiting-to-appear';
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
                    this.currentState = 'invisible';
                }
            }
        }
        
        if (this.currentState === 'visible') {
            let controllerInside = false;
            [leftController, rightController].forEach(controller => {
                if (controller) {
                    const controllerPos = controller.getAttribute('position');
                    if (this.isInsideSphere(controllerPos, spherePos)) {
                        controllerInside = true;
                    }
                }
            });
            
            if (controllerInside && !this.disappearTimer) {
                sphere.setAttribute('color', '#0000ff');
                this.startDisappearTimer();
                this.currentState = 'waiting-to-disappear';
            }
        }
    },
    
    startAppearTimer: function() {
        this.appearTimer = setTimeout(() => {
            this.el.setAttribute('visible', true);
            this.el.setAttribute('color', '#ff0000');
            this.currentState = 'visible';
            this.appearTimer = null;
        }, 500);
    },
    
    startDisappearTimer: function() {
        this.disappearTimer = setTimeout(() => {
            this.el.setAttribute('visible', false);
            this.currentState = 'invisible';
            this.disappearTimer = null;
        }, 300);
    },
    
    isInsideSphere: function(controllerPos, spherePos) {
        const size = 0.3;
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
