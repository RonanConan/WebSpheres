AFRAME.registerComponent('controller-detector', {
    tick: function() {
        const sphere = this.el;
        const spherePos = sphere.getAttribute('position');
        const leftController = document.querySelector('[meta-touch-controls="hand: left"]');
        const rightController = document.querySelector('[meta-touch-controls="hand: right"]');
        
        let controllerInside = false;
        
        [leftController, rightController].forEach(controller => {
            if (controller) {
                const controllerPos = controller.getAttribute('position');
                if (this.isInsideSphere(controllerPos, spherePos)) {
                    controllerInside = true;
                }
            }
        });
        
        sphere.setAttribute('color', controllerInside ? '#0000ff' : '#ff0000');
    },
    
    isInsideSphere: function(controllerPos, spherePos) {
        const size = 0.5;
        return Math.abs(controllerPos.x - spherePos.x) < size &&
               Math.abs(controllerPos.y - spherePos.y) < size &&
               Math.abs(controllerPos.z - spherePos.z) < size;
    }
});
