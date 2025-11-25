AFRAME.registerComponent('haze-manager', {
    init: function () {
        this.hazeLayers = [];
        this.currentState = 'idle';
        this.idleColor = '#00FFFF';
        this.lastMilestone = 0;

        this.createHazeLayers();
        this.startIdlePulse();
        this.setupListeners();
    },

    createHazeLayers: function () {
        const dashboard = document.querySelector('#holo-dashboard');
        if (!dashboard) return;

        const layerConfigs = [
            { scale: 1.15, opacity: 0.15, zOffset: -0.02 },
            { scale: 1.3, opacity: 0.08, zOffset: -0.04 }
        ];

        layerConfigs.forEach((config, index) => {
            const layer = document.createElement('a-plane');
            layer.setAttribute('id', `haze-layer-${index}`);
            layer.setAttribute('width', 1.4 * config.scale);
            layer.setAttribute('height', 0.6 * config.scale);
            layer.setAttribute('position', `0 0 ${config.zOffset}`);
            layer.setAttribute('material', {
                color: this.idleColor,
                opacity: config.opacity,
                transparent: true,
                shader: 'flat',
                side: 'double'
            });

            dashboard.appendChild(layer);
            this.hazeLayers.push(layer);
        });
    },

    setupListeners: function () {
        this.el.sceneEl.addEventListener('haze-normal-hit', () => this.triggerNormalHit());
        this.el.sceneEl.addEventListener('haze-critical-hit', () => this.triggerCriticalHit());
        this.el.sceneEl.addEventListener('haze-milestone', () => this.triggerMilestone());
    },

    startIdlePulse: function () {
        this.hazeLayers.forEach(layer => {
            layer.removeAttribute('animation__pulse');
            layer.setAttribute('animation__pulse', {
                property: 'material.opacity',
                from: parseFloat(layer.getAttribute('material').opacity),
                to: parseFloat(layer.getAttribute('material').opacity) * 0.5,
                dur: 2000,
                dir: 'alternate',
                loop: true,
                easing: 'easeInOutSine'
            });
        });
        this.currentState = 'idle';
    },

    setColor: function (color) {
        this.hazeLayers.forEach(layer => {
            layer.setAttribute('material', 'color', color);
        });
    },

    triggerNormalHit: function () {
        if (this.currentState === 'milestone') return;

        this.hazeLayers.forEach(layer => layer.removeAttribute('animation__pulse'));
        this.setColor('#888888');

        setTimeout(() => {
            this.setColor(this.idleColor);
            this.startIdlePulse();
        }, 200);
    },

    triggerCriticalHit: function () {
        if (this.currentState === 'milestone') return;

        this.currentState = 'critical';
        this.hazeLayers.forEach(layer => layer.removeAttribute('animation__pulse'));
        this.setColor('#FFD700');

        this.hazeLayers.forEach(layer => {
            const baseOpacity = parseFloat(layer.getAttribute('material').opacity) || 0.15;
            layer.setAttribute('animation__pulse', {
                property: 'material.opacity',
                from: baseOpacity,
                to: baseOpacity * 2,
                dur: 150,
                dir: 'alternate',
                loop: 3,
                easing: 'easeInOutSine'
            });
        });

        setTimeout(() => {
            this.setColor(this.idleColor);
            this.startIdlePulse();
        }, 900);
    },

    triggerMilestone: function () {
        this.currentState = 'milestone';
        this.hazeLayers.forEach(layer => layer.removeAttribute('animation__pulse'));

        const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#8B00FF'];
        let colorIndex = 0;

        const cycleInterval = setInterval(() => {
            this.setColor(colors[colorIndex]);
            colorIndex++;
            if (colorIndex >= colors.length) colorIndex = 0;
        }, 200);

        setTimeout(() => {
            clearInterval(cycleInterval);
            this.setColor(this.idleColor);
            this.startIdlePulse();
        }, 2000);
    },

    checkMilestone: function (score) {
        const currentMilestone = Math.floor(score / 100);
        if (currentMilestone > this.lastMilestone) {
            this.lastMilestone = currentMilestone;
            return true;
        }
        return false;
    }
});
