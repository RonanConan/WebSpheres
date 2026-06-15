AFRAME.registerComponent('spectator-manager', {
    init: function () {
        this.connections = [];
        this.lastSendTime = 0;
        this.recentrePending = false;
        this.vec = new THREE.Vector3();
        this.pos = new THREE.Vector3();
        this.quat = new THREE.Quaternion();
        this.leftHandData = null;
        this.rightHandData = null;

        this.leftController = document.querySelector('[hand-tracking-controls="hand: left"]');
        this.rightController = document.querySelector('[hand-tracking-controls="hand: right"]');

        this.bindExtrasReady = this.onExtrasReady.bind(this);

        if (this.leftController) {
            const ext = this.leftController.components?.['hand-tracking-extras'];
            if (ext?.HandData) this.leftHandData = ext.HandData;
            this.leftController.addEventListener('hand-tracking-extras-ready', this.bindExtrasReady);
        }
        if (this.rightController) {
            const ext = this.rightController.components?.['hand-tracking-extras'];
            if (ext?.HandData) this.rightHandData = ext.HandData;
            this.rightController.addEventListener('hand-tracking-extras-ready', this.bindExtrasReady);
        }

        this.setupPeer();

        window.addEventListener('beforeunload', () => {
            if (this.peer) this.peer.destroy();
        });
    },

    onExtrasReady: function (evt) {
        const hand = evt.target.getAttribute('hand-tracking-controls')?.hand;
        if (hand === 'left') this.leftHandData = evt.detail.data;
        else if (hand === 'right') this.rightHandData = evt.detail.data;
    },

    setupPeer: function () {
        this.peer = new Peer('webspheres-host', { debug: 0 });

        this.peer.on('open', () => {
            console.log('[Spectator] Hosting as webspheres-host');
        });

        this.peer.on('connection', (conn) => {
            conn.on('open', () => {
                this.connections.push(conn);
            });
            conn.on('data', (rawData) => {
                try {
                    const data = JSON.parse(rawData);
                    if (data.code === 'KeyR') {
                        this.recentrePending = true;
                    } else if (data.code) {
                        document.dispatchEvent(new KeyboardEvent('keydown', { code: data.code, bubbles: true }));
                    }
                } catch (e) {}
            });
            conn.on('close', () => {
                this.connections = this.connections.filter(c => c !== conn);
            });
        });

        this.peer.on('error', (err) => {
            console.warn('[Spectator] PeerJS error:', err.type);
        });
    },

    getJointPositions: function (handData) {
        if (!handData || !handData.getValidity()) return null;
        const positions = [];
        for (let i = 0; i < 25; i++) {
            handData.getPosition(i, this.vec);
            positions.push(this.vec.x, this.vec.y, this.vec.z);
        }
        return positions;
    },

    doRecentre: function () {
        const renderer = this.el.sceneEl.renderer;
        const frame = this.el.sceneEl.frame;
        if (!frame || !renderer?.xr) return;

        const refSpace = renderer.xr.getReferenceSpace();
        if (!refSpace) return;

        const pose = frame.getViewerPose(refSpace);
        if (!pose) return;

        const q = pose.transform.orientation;
        const headQuat = new THREE.Quaternion(q.x, q.y, q.z, q.w);
        const euler = new THREE.Euler().setFromQuaternion(headQuat, 'YXZ');
        const yawQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, euler.y, 0));
        const inverseYaw = yawQuat.clone().invert();

        const p = pose.transform.position;
        const pos = new THREE.Vector3(p.x, 0, p.z).applyQuaternion(inverseYaw);

        const offsetTransform = new XRRigidTransform(
            { x: pos.x, y: 0, z: pos.z, w: 1 },
            { x: yawQuat.x, y: yawQuat.y, z: yawQuat.z, w: yawQuat.w }
        );

        renderer.xr.setReferenceSpace(refSpace.getOffsetReferenceSpace(offsetTransform));
    },

    tick: function (time) {
        if (this.recentrePending) {
            this.recentrePending = false;
            this.doRecentre();
        }

        if (this.connections.length === 0) return;
        if (time - this.lastSendTime < 33) return;
        this.lastSendTime = time;

        const cameraEl = this.el.sceneEl.camera?.el;
        let head = null;
        if (cameraEl) {
            cameraEl.object3D.getWorldPosition(this.pos);
            cameraEl.object3D.getWorldQuaternion(this.quat);
            head = {
                px: this.pos.x, py: this.pos.y, pz: this.pos.z,
                qx: this.quat.x, qy: this.quat.y, qz: this.quat.z, qw: this.quat.w
            };
        }

        const leftPos = this.getJointPositions(this.leftHandData);
        const rightPos = this.getJointPositions(this.rightHandData);

        const sm = document.querySelector('#sphere-manager')?.components?.['sphere-manager'];
        const scoreM = document.querySelector('#score-display')?.components?.['score-manager'];
        const dataM = document.querySelector('#data-manager')?.components?.['data-manager'];
        const homeEl = document.querySelector('#home-rectangle');
        const homePos = homeEl?.getAttribute('position') || { x: 0, y: 0.9, z: -0.4 };

        let activeSphere = -1;
        if (sm?.activeSphere) {
            activeSphere = sm.allSpheres.indexOf(sm.activeSphere);
        }

        const payload = JSON.stringify({
            head,
            left: leftPos,
            right: rightPos,
            leftValid: leftPos !== null,
            rightValid: rightPos !== null,
            activeSphere,
            radius: sm?.radius ?? 0.45,
            height: sm?.height ?? 1.2,
            score: scoreM?.score ?? 0,
            condition: scoreM?.currentCondition ?? 1,
            dominantHand: scoreM?.dominantHand ?? 'LEFT',
            fireMode: scoreM?.isFireMode ?? false,
            isPaused: sm?.isPaused ?? true,
            trialCount: dataM?.trialNumber ?? 0,
            totalTrials: sm?.totalTrials ?? 352,
            homePos: { x: homePos.x, y: homePos.y, z: homePos.z }
        });

        this.connections.forEach(conn => {
            if (conn.open) {
                try { conn.send(payload); } catch (e) {}
            }
        });
    },

    remove: function () {
        if (this.leftController) {
            this.leftController.removeEventListener('hand-tracking-extras-ready', this.bindExtrasReady);
        }
        if (this.rightController) {
            this.rightController.removeEventListener('hand-tracking-extras-ready', this.bindExtrasReady);
        }
        if (this.peer) this.peer.destroy();
    }
});
