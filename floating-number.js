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

        // Get starting position
        const currentPos = this.el.getAttribute('position');

        this.el.setAttribute('text', {
            value: `+${this.data.value}`,
            align: 'center',
            width: 4,
            color: color,
            font: 'exo2bold'
        });
        this.el.setAttribute('scale', initialScale);

        // 2. ORIENTATION (RESTORED OLD LOGIC)
        // We look at the center of the room (x=0, z=0) but at the text's OWN height (y).
        // This makes it face inward but keeps it perfectly upright (no tilting up/down).
        this.el.object3D.lookAt(0, currentPos.y, 0);

        // 3. CALCULATE DESTINATION
        const targetPos = new THREE.Vector3(0, 1.6, -1.2); // Default fallback
        const scoreEl = document.querySelector('#score-display');

        if (scoreEl && scoreEl.object3D) {
            // Force an update to ensure we get the real world coordinates
            scoreEl.object3D.updateMatrixWorld(true);
            scoreEl.object3D.getWorldPosition(targetPos);
            targetPos.z += 0.1; // Offset slightly forward so it doesn't clip
        }

        // 4. ANIMATION 1: FLOAT UP (0ms - 500ms)
        // We use the native A-Frame animation component, just like your old code.
        this.el.setAttribute('animation__float', {
            property: 'position',
            to: `${currentPos.x} ${currentPos.y + 0.25} ${currentPos.z}`,
            dur: 500,
            easing: 'easeOutQuad'
        });

        // 5. ANIMATION 2: FLY TO DASHBOARD (500ms - 1200ms)
        // Triggered after the float completes
        setTimeout(() => {
            // Fly to target
            this.el.setAttribute('animation__fly', {
                property: 'position',
                to: `${targetPos.x} ${targetPos.y} ${targetPos.z}`,
                dur: 700,
                easing: 'easeInQuad'
            });

            // Shrink while flying
            this.el.setAttribute('animation__shrink', {
                property: 'scale',
                to: '0 0 0',
                dur: 700,
                easing: 'easeInQuad'
            });
        }, 500);

        // 6. CLEANUP
        setTimeout(() => {
            if (this.el.parentNode) {
                this.el.parentNode.removeChild(this.el);
            }
        }, 1250);
    }
});