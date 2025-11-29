AFRAME.registerComponent('kinematics-manager', {
    init: function() {
        this.leftHandData = [];
        this.rightHandData = [];
        this.isTracking = false;
        this.sessionStartTime = 0;
        
        this.leftController = document.querySelector('[hand-tracking-controls="hand: left"]');
        this.rightController = document.querySelector('[hand-tracking-controls="hand: right"]');
        this.homeRectangle = document.querySelector('#home-rectangle');
    },
    
    startTracking: function(startTime) {
        this.isTracking = true;
        this.sessionStartTime = startTime || Date.now();
    },
    
    tick: function() {
        if (!this.isTracking) return;
        
        const timestamp = Date.now() - this.sessionStartTime;
        
        const leftPos = this.getHandPosition(this.leftController);
        const rightPos = this.getHandPosition(this.rightController);
        
        const homePos = this.homeRectangle.getAttribute('position');
        
        // Get active sphere position
        const sphereManager = document.querySelector('#sphere-manager').components['sphere-manager'];
        let targetX = '';
        let targetY = '';
        let targetZ = '';
        
        if (sphereManager && sphereManager.activeSphere) {
            const targetPos = sphereManager.activeSphere.getAttribute('position');
            targetX = targetPos.x;
            targetY = targetPos.y;
            targetZ = targetPos.z;
        }
        
        if (leftPos) {
            this.leftHandData.push({
                timestamp: timestamp,
                handX: leftPos.x,
                handY: leftPos.y,
                handZ: leftPos.z,
                homeX: homePos.x,
                homeY: homePos.y,
                homeZ: homePos.z,
                targetX: targetX,
                targetY: targetY,
                targetZ: targetZ
            });
        }
        
        if (rightPos) {
            this.rightHandData.push({
                timestamp: timestamp,
                handX: rightPos.x,
                handY: rightPos.y,
                handZ: rightPos.z,
                homeX: homePos.x,
                homeY: homePos.y,
                homeZ: homePos.z,
                targetX: targetX,
                targetY: targetY,
                targetZ: targetZ
            });
        }
    },
    
    getHandPosition: function(handController) {
        if (!handController?.components?.['hand-tracking-controls']) {
            return null;
        }
        return handController.components['hand-tracking-controls'].indexTipPosition;
    },
    
    exportCSV: function() {
        if (this.leftHandData.length > 0) {
            this.exportHandData(this.leftHandData, 'LEFT');
        }
        
        if (this.rightHandData.length > 0) {
            this.exportHandData(this.rightHandData, 'RIGHT');
        }
    },
    
    exportHandData: function(data, hand) {
        let csvContent = 'Timestamp,HandX,HandY,HandZ,HomeX,HomeY,HomeZ,TargetX,TargetY,TargetZ\n';
        
        data.forEach(entry => {
            csvContent += `${entry.timestamp},${entry.handX},${entry.handY},${entry.handZ},${entry.homeX},${entry.homeY},${entry.homeZ},${entry.targetX},${entry.targetY},${entry.targetZ}\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `kinematics-${hand}-${timestamp}.csv`;
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }
});
