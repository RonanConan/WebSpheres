AFRAME.registerComponent('data-manager', {
    init: function() {
        this.trialData = [];
        this.trialNumber = 0;
        this.setupManualExport();
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
            this.exportCSV();
            this.buttonPressCount = 0; // Reset after export
        }
    },
    
    recordTrial: function(targetPosition, handUsed, points, hitType) {
        this.trialNumber++;
        this.trialData.push({
            trial: this.trialNumber,
            target: targetPosition + 1, // Convert 0-10 to 1-11
            hand: handUsed,
            points: points,
            hitType: hitType
        });
        
        console.log(`Trial ${this.trialNumber}: Target ${targetPosition + 1}, Hand ${handUsed}, Points ${points}, Type ${hitType}`);
        
        // Check if session complete (110 trials)
        if (this.trialNumber >= 110) {
            setTimeout(() => {
                this.exportCSV();
            }, 1000); // Delay to ensure last trial is recorded
        }
    },
    
    exportCSV: function() {
        if (this.trialData.length === 0) {
            console.log('No trial data to export');
            return;
        }
        
        // Generate CSV content
        let csvContent = 'Trial,Target,Hand,Points,HitType\n';
        
        this.trialData.forEach(trial => {
            csvContent += `${trial.trial},${trial.target},${trial.hand},${trial.points},${trial.hitType}\n`;
        });
        
        // Create and download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `vr-session-data-${timestamp}.csv`;
        
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
    
    getTrialCount: function() {
        return this.trialNumber;
    },
    
    resetSession: function() {
        this.trialData = [];
        this.trialNumber = 0;
        console.log('Session data reset');
    }
});
