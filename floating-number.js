AFRAME.registerComponent('floating-number', {
    schema: {
        value: {type: 'number'},
        hitType: {type: 'string', default: 'normal'}
    },
    
    init: function() {
        const data = this.data;
        const position = this.el.getAttribute('position');
        
        // Basic error checking
        if (!position) {
            console.warn('Floating number created without position');
            return;
        }
        
        // Set text content and appearance with color
        const color = data.hitType === 'critical' ? '#FFD700' : '#FFFFFF';
        this.el.setAttribute('text', {
            value: `+${data.value}`,
            align: 'center',
            width: 6,
            color: color
        });
        
        // Animate upward movement and fade out
        this.el.setAttribute('animation', {
            property: 'position',
            to: `${position.x} ${position.y + 0.25} ${position.z}`,
            dur: 1200,
            easing: 'easeOutQuad'
        });
        
        this.el.setAttribute('animation__fade', {
            property: 'text.opacity',
            to: 0,
            dur: 1200,
            easing: 'easeOutQuad'
        });
        
        // Remove entity after animation completes
        setTimeout(() => {
            if (this.el.parentNode) {
                this.el.parentNode.removeChild(this.el);
            }
        }, 1300);
    }
});
