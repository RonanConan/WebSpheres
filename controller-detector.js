AFRAME.registerComponent('controller-detector', {
    tick: function() {
        const cube = this.el;
        const cubePos = cube.getAttribute('position');
        const leftController = document.querySelector('[meta-touch-controls="hand: left"]');
        const rightController = document.querySelector('[meta-touch-controls="hand: right"]');
        
        let controllerInside = false;
        
        [leftController, rightController].forEach(controller => {
            if (controller) {
                const controllerPos = controller.getAttribute('position');
                if (this.isInsideCube(controllerPos, cubePos)) {
                    controllerInside = true;
                }
            }
        });
        
        cube.setAttribute('color', controllerInside ? '#0000ff' : '#ff0000');
    },
    
    isInsideCube: function(controllerPos, cubePos) {
        const size = 0.5;
        return Math.abs(controllerPos.x - cubePos.x) < size &&
               Math.abs(controllerPos.y - cubePos.y) < size &&
               Math.abs(controllerPos.z - cubePos.z) < size;
    }
});
