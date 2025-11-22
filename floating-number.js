AFRAME.registerComponent('floating-number', {
    schema: {
        value: { type: 'number' },
        hitType: { type: 'string', default: 'normal' }
    },

    init: function () {
        const data = this.data;
        const startPosition = this.el.object3D.position.clone();

        // Setup Visuals
        const color = data.hitType === 'critical' ? '#FFD700' : '#FFFFFF';
        const scale = data.hitType === 'critical' ? '1.5 1.5 1.5' : '1 1 1';

        this.el.setAttribute('text', {
            value: `+${data.value}`,
            align: 'center',
            width: 4,
            color: color,
            font: 'exo2bold'
        });
        this.el.setAttribute('scale', scale);

        // Face Camera initially
        if (this.el.sceneEl.camera) {
            this.el.object3D.lookAt(this.el.sceneEl.camera.position);
        }

        // FIXED: Target the restored ID #score-display
        const dashboardScoreEl = document.querySelector('#score-display');
        let targetPosition = new THREE.Vector3(0, 1.6, -1.5); // Default fallback

        if (dashboardScoreEl) {
            dashboardScoreEl.object3D.getWorldPosition(targetPosition);
            targetPosition.z += 0.1;
        }

        // === ANIMATION SEQUENCE ===
        const startTime = Date.now();
        const phase1Duration = 500;
        const phase2Duration = 700;

        this.animate = () => {
            if (!this.el.parentNode) return;

            const now = Date.now();
            const elapsed = now - startTime;

            if (elapsed < phase1Duration) {
                const progress = elapsed / phase1Duration;
                const ease = 1 - (1 - progress) * (1 - progress);
                this.el.object3D.position.y = startPosition.y + (0.3 * ease);

            } else if (elapsed < (phase1Duration + phase2Duration)) {
                const flightProgress = (elapsed - phase1Duration) / phase2Duration;
                const ease = flightProgress * flightProgress;

                const currentStart = startPosition.clone();
                currentStart.y += 0.3;

                this.el.object3D.position.lerpVectors(currentStart, targetPosition, ease);

                const currentScale = 1 - ease;
                this.el.object3D.scale.set(currentScale, currentScale, currentScale);

            } else {
                if (this.el.parentNode) {
                    this.el.parentNode.removeChild(this.el);
                }
                return;
            }

            requestAnimationFrame(this.animate);
        };

        this.animate();
    }
});