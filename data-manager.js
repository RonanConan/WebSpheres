AFRAME.registerComponent('data-manager', {
    init: function() {
        this.trialData = [];
        this.positionData = [];
        this.trialNumber = 0;
        this.sphereAppearTime = 0;
        this.currentDecisionTime = 0;
        this.sessionStartTime = Date.now();
        this.setupManualExport();
        this.waitForControllersAndStartTracking();
    },
    
    setupManualExport: function() {
        this.buttonPressCount = 0;
        this.lastPressTime = 0;
        this.listenerAttached = false;
        
        // Try to attach listener periodically until successful
        this.attachInterval = setInterval(() => {
            this.tryAttachListener();
        }, 1000);
    },
    
    tryAttachListener: function() {
        if (this.listenerAttached) return;
        
        const rightController = document.querySelector('[meta-touch-controls="hand: right"]');
        if (rightController) {
            rightController.addEventListener('abuttondown', () => {
                this.handleAButtonPress();
            });
            this.listenerAttached = true;
            clearInterval(this.attachInterval);
            console.log('A button listener attached successfully');
        }
    },
    
    handleAButtonPress: function() {
        const currentTime = Date.now();
        
        // Reset count if more than 2 seconds since last press
        if (currentTime - this.lastPressTime > 2000) {
            this.buttonPressCount = 0;
        }
        
        this.buttonPressCount++;
        this.lastPressTime = currentTime;
        
        console.log(`A button pressed ${this.buttonPressCount}/5 times`);
        
        if (this.buttonPressCount >= 5) {
            this.exportAllData();
            this.buttonPressCount = 0; // Reset after export
        }
    },
    
    waitForControllersAndStartTracking: function() {
        // Wait for controllers to be available before starting position tracking
        this.controllerCheckInterval = setInterval(() => {
            const leftController = document.querySelector('[meta-touch-controls="hand: left"]');
            const rightController = document.querySelector('[meta-touch-controls="hand: right"]');
            
            if (leftController && rightController) {
                clearInterval(this.controllerCheckInterval);
                this.startPositionTracking();
                console.log('Hand tracking started');
            }
        }, 100);
    },
    
    startPositionTracking: function() {
        // Track at 60Hz (approximately every 16.67ms)
        this.positionInterval = setInterval(() => {
            this.recordPositions();
        }, 16.67);
    },
    
    recordPositions: function() {
        const leftController = document.querySelector('[meta-touch-controls="hand: left"]');
        const rightController = document.querySelector('[meta-touch-controls="hand: right"]');
        
        // Get positions with error handling
        let leftPos = null;
        let rightPos = null;
        
        if (leftController) {
            leftPos = leftController.getAttribute('position');
        }
        
        if (rightController) {
            rightPos = rightController.getAttribute('position');
        }
        
        // Only record if we have valid position data
        if (leftPos || rightPos) {
            const timestamp = Date.now() - this.sessionStartTime;
            
            this.positionData.push({
                timestamp: timestamp,
                leftX: leftPos ? leftPos.x : null,
                leftY: leftPos ? leftPos.y : null,
                leftZ: leftPos ? leftPos.z : null,
                rightX: rightPos ? rightPos.x : null,
                rightY: rightPos ? rightPos.y : null,
                rightZ: rightPos ? rightPos.z : null
            });
        }
    },
    
    startDecisionTimer: function() {
        this.sphereAppearTime = Date.now();
        this.currentDecisionTime = 0;
    },
    
    stopDecisionTimer: function() {
        if (this.sphereAppearTime > 0) {
            this.currentDecisionTime = Date.now() - this.sphereAppearTime;
        }
    },
    
    recordTrial: function(targetPosition, handUsed, points, hitType, decisionTime) {
        this.trialNumber++;
        const timestamp = Date.now() - this.sessionStartTime;
        
        this.trialData.push({
            timestamp: timestamp,
            trial: this.trialNumber,
            target: targetPosition + 1, // Convert 0-10 to 1-11
            hand: handUsed,
            points: points,
            hitType: hitType,
            decisionTime: decisionTime
        });
        
        console.log(`Trial ${this.trialNumber}: Target ${targetPosition + 1}, Hand ${handUsed}, Points ${points}, Type ${hitType}, Decision Time ${decisionTime}ms`);
        
        // Reset timer for next trial
        this.sphereAppearTime = 0;
        this.currentDecisionTime = 0;
        
        // Check if session complete (110 trials)
        if (this.trialNumber >= 110) {
            setTimeout(() => {
                this.exportAllData();
            }, 1000); // Delay to ensure last trial is recorded
        }
    },
    
    exportAllData: function() {
        this.exportTrialCSV();
        // Small delay to prevent filename conflicts
        setTimeout(() => {
            this.exportPositionCSV();
        }, 100);
    },
    
    exportTrialCSV: function() {
        if (this.trialData.length === 0) {
            console.log('No trial data to export');
            return;
        }
        
        // Generate CSV content
        let csvContent = 'Timestamp,Trial,Target,Hand,Points,HitType,DecisionTime\n';
        
        this.trialData.forEach(trial => {
            csvContent += `${trial.timestamp},${trial.trial},${trial.target},${trial.hand},${trial.points},${trial.hitType},${trial.decisionTime}\n`;
        });
        
        // Create and download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `vr-trial-data-${timestamp}.csv`;
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        console.log(`Exported ${this.trialData.length} trials to ${filename}`);
    },
    
    exportPositionCSV: function() {
        if (this.positionData.length === 0) {
            console.log('No position data to export');
            return;
        }
        
        // Generate CSV content
        let csvContent = 'Timestamp,LeftX,LeftY,LeftZ,RightX,RightY,RightZ\n';
        
        this.positionData.forEach(pos => {
            // Handle null values in CSV
            const leftX = pos.leftX !== null ? pos.leftX : '';
            const leftY = pos.leftY !== null ? pos.leftY : '';
            const leftZ = pos.leftZ !== null ? pos.leftZ : '';
            const rightX = pos.rightX !== null ? pos.rightX : '';
            const rightY = pos.rightY !== null ? pos.rightY : '';
            const rightZ = pos.rightZ !== null ? pos.rightZ : '';
            
            csvContent += `${pos.timestamp},${leftX},${leftY},${leftZ},${rightX},${rightY},${rightZ}\n`;
        });
        
        // Create and download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `vr-position-data-${timestamp}.csv`;
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        console.log(`Exported ${this.positionData.length} position records to ${filename}`);
    },
    
    getTrialCount: function() {
        return this.trialNumber;
    },
    
    resetSession: function() {
        this.trialData = [];
        this.positionData = [];
        this.trialNumber = 0;
        this.sessionStartTime = Date.now();
        console.log('Session data reset');
    },
    
    remove: function() {
        if (this.positionInterval) {
            clearInterval(this.positionInterval);
        }
        if (this.attachInterval) {
            clearInterval(this.attachInterval);
        }
        if (this.controllerCheckInterval) {
            clearInterval(this.controllerCheckInterval);
        }
    }
});
