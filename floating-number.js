AFRAME.registerComponent('floating-number', {
    schema: {
        value: { type: 'number' },
        hitType: { type: 'string', default: 'normal' }
    },

    init: function () {
        // 1. Setup Visuals
        const color = this.data.hitType === 'critical' ? '#FFD700' : '#FFFFFF';
        // Critical hits are larger
        const scale = this.data.hitType === 'critical' ? 1.5 : 1.0;

        this.el.setAttribute('text', {
            value: `+${this.data.value}`,
            align: 'center',
            width: 4,
            color: color,
            font: 'exo2bold'
        });

        // Apply initial scale
        this.el.object3D.scale.set(scale, scale, scale);

        // 2. Capture Starting State
        // We clone the position so we have a fixed reference point
        this.startPos = this.el.object3D.position.clone();

        // 3. Animation Timing
        this.startTime = Date.now();
        this.phase1Duration = 500;  // Float Up (ms)
        this.phase2Duration = 700;  // Fly to Dashboard (ms)

        // 4. Prepare Target Vector
        this.targetPos = new THREE.Vector3();
        this.targetFound = false;

        // Reusable helper for camera lookAt to avoid garbage collection
        this.cameraWorldPos = new THREE.Vector3();
    },

    tick: function (time, timeDelta) {
        const now = Date.now();
        const elapsed = now - this.startTime;

        // === 1. HANDLE ORIENTATION (Fixes "Floor Tilt") ===
        // We check if the camera exists and update the lookAt every single frame.
        // This ensures that even if tracking starts late, the text will correct itself.
        if (this.el.sceneEl.camera) {
            this.el.sceneEl.camera.getWorldPosition(this.cameraWorldPos);
            this.el.object3D.lookAt(this.cameraWorldPos);
        }

        // === 2. HANDLE ANIMATION ===
        if (elapsed < this.phase1Duration) {
            // --- PHASE 1: FLOAT UP ---
            // Simple ease-out float
            const progress = elapsed / this.phase1Duration;
            const ease = 1 - (1 - progress) * (1 - progress);

            this.el.object3D.position.y = this.startPos.y + (0.3 * ease);

        } else if (elapsed < (this.phase1Duration + this.phase2Duration)) {
            // --- PHASE 2: FLY TO DASHBOARD ---

            // Calculate Target Position ONCE at the start of Phase 2
            // We do this here (delayed) to ensure the Dashboard is fully rendered/positioned.
            if (!this.targetFound) {
                const scoreEl = document.querySelector('#score-display');
                if (scoreEl && scoreEl.object3D) {
                    // FORCE update the dashboard's position in the world
                    scoreEl.object3D.updateMatrixWorld(true);
                    scoreEl.object3D.getWorldPosition(this.targetPos);
                    this.targetPos.z += 0.1; // Offset slightly forward
                    this.targetFound = true;
                } else {
                    // Fallback if dashboard is missing: just fly up higher
                    this.targetPos.copy(this.startPos).add(new THREE.Vector3(0, 1.0, 0));
                    this.targetFound = true;
                }
            }

            const flightProgress = (elapsed - this.phase1Duration) / this.phase2Duration;
            const ease = flightProgress * flightProgress; // Accelerate

            // Interpolate from the "Float Top" position to the "Target" position
            const floatTop = this.startPos.clone();
            floatTop.y += 0.3;

            this.el.object3D.position.lerpVectors(floatTop, this.targetPos, ease);

            // Shrink effect
            const baseScale = this.data.hitType === 'critical' ? 1.5 : 1.0;
            const currentScale = baseScale * (1 - ease);
            this.el.object3D.scale.set(currentScale, currentScale, currentScale);

        } else {
            // === 3. CLEANUP ===
            // Animation finished, remove entity from scene
            if (this.el.parentNode) {
                this.el.parentNode.removeChild(this.el);
            }
        }
    }
});