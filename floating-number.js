AFRAME.registerComponent('floating-number', {
    schema: {
        value: { type: 'number' },
        hitType: { type: 'string', default: 'normal' }
    },

    init: function () {
        // 1. SETUP VISUALS
        const hitType = this.data.hitType;
        const color = hitType === 'critical' ? '#FFD700' : '#FFFFFF';
        const initialScale = hitType === 'critical' ? '1.5 1.5 1.5' : '1 1 1';

        this.el.setAttribute('text', {
            value: `+${this.data.value}`,
            align: 'center',
            width: 4,
            color: color,
            font: 'exo2bold'
        });
        this.el.setAttribute('scale', initialScale);

        // 2. ORIENTATION (FIXED)
        // Instead of looking at the camera (which might be 0,0,0),
        // we look at the user's average head height at the center of the room.
        // This guarantees text is vertical and readable.
        this.el.object3D.lookAt(0, 1.6, 0);

        // 3. GET POSITIONS
        // Current Start Position
        const startPos = this.el.getAttribute('position');

        // Calculate Target Position (Dashboard)
        const targetPos = new THREE.Vector3(0, 1.6, -1.2); // Default
        const scoreEl = document.querySelector('#score-display');
        if (scoreEl && scoreEl.object3D) {
            scoreEl.object3D.updateMatrixWorld(true);
            scoreEl.object3D.getWorldPosition(targetPos);
            targetPos.z += 0.1; // Offset forward slightly
        }

        // 4. ANIMATION SEQUENCE (Using Native A-Frame Components)

        // PHASE 1: FLOAT UP (0ms - 500ms)
        this.el.setAttribute('animation__float', {
            property: 'position',
            from: `${startPos.x} ${startPos.y} ${startPos.z}`,
            to: `${startPos.x} ${startPos.y + 0.25} ${startPos.z}`,
            dur: 500,
            easing: 'easeOutQuad'
        });

        // PHASE 2: FLY TO DASHBOARD (500ms - 1200ms)
        // We trigger this after a delay to create the "Pause then Fly" effect
        setTimeout(() => {
            // Move to Dashboard
            this.el.setAttribute('animation__fly', {
                property: 'position',
                to: `${targetPos.x} ${targetPos.y} ${targetPos.z}`,
                dur: 700,
                easing: 'easeInQuad' // Accelerate towards target
            });

            // Shrink to nothing
            this.el.setAttribute('animation__shrink', {
                property: 'scale',
                to: '0 0 0',
                dur: 700,
                easing: 'easeInQuad'
            });
        }, 500);

        // 5. CLEANUP
        setTimeout(() => {
            if (this.el.parentNode) {
                this.el.parentNode.removeChild(this.el);
            }
        }, 1250);
    }
});