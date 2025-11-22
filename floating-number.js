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
        const camera = this.el.sceneEl.camera;
        if (camera) {
            this.el.object3D.lookAt(camera.position);
        }

        // Find Destination (The Dashboard Score)
        const dashboardScoreEl = document.querySelector('#dashboard-score');
        let targetPosition = new THREE.Vector3(0, 1.6, -1.5); // Default fallback

        if (dashboardScoreEl) {
            // We need World Position, as dashboard might be rotated/nested
            dashboardScoreEl.object3D.getWorldPosition(targetPosition);
            // Offset slightly so it flies *into* the number, not behind it
            targetPosition.z += 0.1;
        }

        // === ANIMATION SEQUENCE ===
        // Phase 1: Float Up (Readability) - 500ms
        // Phase 2: Fly to Dashboard - 700ms

        const startTime = Date.now();
        const phase1Duration = 500;
        const phase2Duration = 700;

        this.animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;

            if (elapsed < phase1Duration) {
                // PHASE 1: Float Up
                const progress = elapsed / phase1Duration;
                // Ease out quad
                const ease = 1 - (1 - progress) * (1 - progress);

                this.el.object3D.position.y = startPosition.y + (0.3 * ease);

            } else if (elapsed < (phase1Duration + phase2Duration)) {
                // PHASE 2: Fly to Target
                const flightProgress = (elapsed - phase1Duration) / phase2Duration;
                // Ease in back (pull back slightly then shoot) or just Ease In Quad
                const ease = flightProgress * flightProgress;

                // Interpolate Position
                // Current start point is (startPosition + 0.3y)
                const currentStart = startPosition.clone();
                currentStart.y += 0.3;

                this.el.object3D.position.lerpVectors(currentStart, targetPosition, ease);

                // Scale down as it approaches
                const currentScale = 1 - ease;
                this.el.object3D.scale.set(currentScale, currentScale, currentScale);

            } else {
                // END: Clean up
                if (this.el.parentNode) {
                    this.el.parentNode.removeChild(this.el);
                }
                return; // Stop loop
            }

            requestAnimationFrame(this.animate);
        };

        this.animate();
    }
});