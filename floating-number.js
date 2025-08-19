AFRAME.registerComponent('floating-number', {
    schema: {
        value: {type: 'number'},
        hitType: {type: 'string', default: 'normal'}
    },
    
    init: function() {
        const data = this.data;
        const position = this.el.getAttribute('position');
        
        if (!position) {
            console.warn('Floating number created without position');
            return;
        }
        
        const color = data.hitType === 'critical' ? '#FFD700' : '#FFFFFF';
        this.el.setAttribute('text', {
            value: `+${data.value}`,
            align: 'center',
            width: 3,
            color: color
        });
        
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
        
        setTimeout(() => {
            if (this.el.parentNode) {
                this.el.parentNode.removeChild(this.el);
            }
        }, 1300);
    }
});
