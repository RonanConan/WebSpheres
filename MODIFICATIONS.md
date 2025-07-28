# Researcher Modifications Guide

This document details exactly where in the code researchers can modify key experimental parameters. Make backup copies before making any changes.

## Session Length & Trial Structure

### Change Number of Trials Per Session
**File:** `sphere-manager.js`
**Location:** Lines ~12-14
```javascript
this.appearancesPerSphere = 32;        // Normal session: trials per sphere position
this.totalTrials = 11 * this.appearancesPerSphere;  // Total trials (352)
```
**To modify:**
- Change `32` to desired trials per sphere position
- Short session value is set separately (see below)

### Change Short Session Length  
**File:** `sphere-manager.js`
**Location:** Lines ~175-178 (in switchToShortSession function)
```javascript
this.appearancesPerSphere = 10;        // Short session: trials per sphere position  
this.totalTrials = 110;                // Total trials for short session
```
**File:** `data-manager.js`
**Location:** Line ~8
```javascript
this.totalTrials = 352;                // Default total trials
```

### Change Number of Sphere Positions
**File:** `sphere-manager.js`  
**Location:** Line ~28 (createSpheres function)
```javascript
for (let i = 0; i < 11; i++) {         // Number of sphere positions
```
**Also update these locations:**
- Line ~10: `this.appearanceCounts = [0,0,0,0,0,0,0,0,0,0,0];` (must have same number of zeros)
- Line ~78: `for (let i = 0; i < 11; i++)` in updateSpherePositions
- Line ~190: `for (let i = 0; i < 11; i++)` in selectRandomSphere (first loop)
- Line ~195: `for (let i = 0; i < 11; i++)` in selectRandomSphere (second loop) 
- Lines ~12-13: Update `this.totalTrials = NEW_COUNT * this.appearancesPerSphere`
**Critical:** All these must match the same number or the system will crash

## Timing Parameters

### Sphere Appearance Delay
**File:** `sphere-manager.js`
**Location:** Line ~225 (startAppearTimer function)
```javascript
}, 500);                               // 500ms delay before sphere appears
```

### Sphere Disappear Delay  
**File:** `sphere-manager.js`
**Location:** Line ~238 (startDisappearTimer function)
```javascript
}, 300);                               // 300ms delay before sphere disappears
```

### Manual Export Button Timing
**File:** `data-manager.js`
**Location:** Line ~26 (handleAButtonPress function)
```javascript
if (currentTime - this.lastPressTime > 2000) {  // 2 second timeout between presses
```
**To modify:** Change `2000` (milliseconds) for different timeout
**Warning:** Making this too short may cause accidental exports; too long may frustrate users

## Geometric Parameters

### Sphere Size
**File:** `sphere-manager.js`
**Location:** Line ~35 (createSpheres function)
```javascript
sphere.setAttribute('radius', '0.05'); // Sphere radius (5cm)
```

### Hit Detection Size
**File:** `sphere-manager.js`
**Location:** Line ~247 (isInsideSphere function)  
```javascript
const hitRadius = 0.08;               // Hit detection radius (8cm)
```

### Starting Rectangle Detection Zones
**File:** `sphere-manager.js`
**Location:** Lines ~257-261 (isInsideRectangle function)
```javascript
const width = 0.12;                   // Half-width of detection zone (12cm total = 24cm)
const height = 0.045;                 // Half-height of detection zone (4.5cm total = 9cm)  
const depth = 0.09;                   // Half-depth of detection zone (9cm total = 18cm)
```

### Starting Rectangle Visual Size  
**File:** `index.html`
**Location:** Lines ~30-31 and ~36-37
```html
geometry="width: 0.24; height: 0.09; depth: 0.18"  <!-- Visual rectangle size -->
```
**Note:** Should match detection zones (width = 2×0.12, height = 2×0.045, depth = 2×0.09)

### Arc Positioning
**File:** `sphere-manager.js`
**Location:** Line ~29 (createSpheres function)
```javascript
let angle = -40 + (i * 8);            // Arc from -40° to +40°, 8° increments
```
**To modify arc range:** Change `-40` (start angle) and `8` (increment)
**To modify total positions:** Change the loop limit `< 11`

## Calibration Parameters

### Reach Distance Calibration Factor
**File:** `sphere-manager.js`  
**Location:** Line ~72 (calibrateReach function)
```javascript
this.radius = Math.max(0.3, 0.8 * distance);  // Uses 80% of measured reach
```
**To modify:** Change `0.8` to desired percentage (e.g., `0.7` for 70%)
**Minimum value:** Change `0.3` for minimum reach distance (in meters)
**Warning:** If you increase the percentage above 0.8, consider increasing minimum accordingly

### Height Calibration Factor
**File:** `sphere-manager.js`
**Location:** Line ~85 (calibrateHeight function)  
```javascript
this.height = Math.max(0.5, 0.8 * cameraPos.y);  // Uses 80% of head height
```
**To modify:** Change `0.8` to desired percentage
**Minimum value:** Change `0.5` for minimum height (in meters)
**Warning:** If you increase the percentage above 0.8, consider increasing minimum accordingly

### Initial Positioning (Before Calibration)
**File:** `sphere-manager.js`
**Location:** Lines ~11-12 (init function)
```javascript
this.radius = 0.7;                    // Default reach radius  
this.height = 1.2;                    // Default sphere height
```

## Scoring System

### Point Ranges
**File:** `score-manager.js`
**Location:** Lines ~25 and ~30 (calculateHitPoints function)
```javascript
points: Math.floor(Math.random() * 5) + 1,     // Normal: 1-5 points
points: Math.floor(Math.random() * 6) + 5,     // Critical: 5-10 points  
```
**To modify normal range:** Change `5` (range) and `1` (minimum)
**To modify critical range:** Change `6` (range) and `5` (minimum)

### Critical Hit Probabilities
**File:** `score-manager.js`
**Location:** Lines ~6-7 (init function) - Default values
```javascript
this.leftHandCriticalChance = 0.2;    // 20% critical chance (not used)
this.rightHandCriticalChance = 0.2;   // 20% critical chance (not used)
```

**Location:** Lines ~20-32 (updateProbabilities function) - Actual values used
```javascript
// Condition 1 (NM - No Manipulation)
this.leftHandCriticalChance = 0.3;    // 30% critical chance
this.rightHandCriticalChance = 0.3;   // 30% critical chance

// Condition 2 (BT - Boost and Tax)  
if (this.dominantHand === 'LEFT') {
    this.leftHandCriticalChance = 0.05;   // 5% critical for LEFT when LEFT is dominant
    this.rightHandCriticalChance = 0.55;  // 55% critical for RIGHT when LEFT is dominant
} else {
    this.leftHandCriticalChance = 0.55;   // 55% critical for LEFT when RIGHT is dominant  
    this.rightHandCriticalChance = 0.05;  // 5% critical for RIGHT when RIGHT is dominant
}
// Pattern: Dominant hand always gets 5%, non-dominant gets 55%
```

## Visual Appearance

### Sphere Colors
**File:** `sphere-manager.js`
**Location:** Lines ~34, ~36, ~146 (createSpheres and tick functions)
```javascript
sphere.setAttribute('color', '#ff0000');      // Red when appearing
this.activeSphere.setAttribute('color', '#0000ff');  // Blue when hit
```

### Rectangle Colors and Transparency
**File:** `index.html`  
**Location:** Lines ~32, ~38
```html
material="color: #00ff00; transparent: true; opacity: 0.3"  <!-- Green, 30% opacity -->
```

### Text Scaling and Positioning
**File:** `index.html`
**Location:** Lines ~12-13, ~18-19  
```html
scale="0.45 0.45 0.45"               <!-- Text scale factor -->
```
**Dynamic positioning:** `sphere-manager.js` lines ~103-104 (updateTextPositions function)

## Audio Settings

### Sound File Paths
**File:** `audio-manager.js`
**Location:** Lines ~7-33 (createSounds function)
```javascript
this.normalSound.src = 'sounds/normal-hit.mp3';        // Normal hit sound
this.criticalSound.src = 'sounds/critical-hit.mp3';    // Critical hit sound
// ... other sound files
```

## Data Export Modifications

### Change Export Filename Pattern
**File:** `data-manager.js`
**Location:** Line ~95
```javascript
const filename = `vr-session-data-${timestamp}.csv`;
```

### Add/Remove Data Fields
**File:** `data-manager.js`
**Location:** Lines ~75-82 (exportCSV function)
- Modify CSV header: Line ~77
- Modify data rows: Line ~80

### Change Console Logging  
**File:** `data-manager.js`
**Location:** Line ~71
```javascript
console.log(`Trial ${this.trialNumber}: Target ${targetPosition + 1}...`);
```

## Critical Dependencies & Data Integrity

### Parameters That Must Stay Synchronized

**When changing number of sphere positions:**
1. Loop limits in `createSpheres`, `updateSpherePositions`, `selectRandomSphere` 
2. `appearanceCounts` array size (must have same number of elements)
3. `totalTrials` calculation (positions × appearancesPerSphere)
4. Arc angle calculations may need adjustment for different position counts

**When changing session lengths:**
1. `sphere-manager.js`: `this.appearancesPerSphere` and `this.totalTrials`
2. `data-manager.js`: `this.totalTrials` (default value)
3. Short session: Both `switchToShortSession` function and `data-manager` initial value

**When changing rectangle sizes:**
1. Detection zones in `isInsideRectangle` function (half-widths)
2. Visual rectangles in `index.html` (full dimensions)
3. These MUST match or participants will see green boxes they can't actually activate

## Arc Mathematics

For N positions: `angle = startAngle + (i * increment)` where i goes from 0 to N-1
- 11 positions: -40° + (i × 8°) gives positions from -40° to +40°
- If changing to 9 positions with same range: -40° + (i × 10°) 
- If changing to 5 positions with same range: -40° + (i × 20°)

## Common Modification Examples

### Example 1: Shorter Session (5 trials per position)
```javascript
// In sphere-manager.js, line ~12
this.appearancesPerSphere = 5;        // Instead of 32
// Total trials becomes: 11 × 5 = 55 trials
```

### Example 2: Faster Paced Game  
```javascript
// In sphere-manager.js
}, 250);  // Appearance delay: 250ms instead of 500ms  
}, 150);  // Disappear delay: 150ms instead of 300ms
// Warning: Too fast may not give participants enough time to react
```

### Example 3: Different Critical Hit Rates (Condition 1 only)
```javascript  
// In score-manager.js, updateProbabilities function
this.leftHandCriticalChance = 0.4;    // 40% instead of 30%
this.rightHandCriticalChance = 0.4;   // 40% instead of 30%
// Only affects NM condition; BT condition uses 0.05/0.55 pattern
```

### Example 4: Smaller Detection Zone
```javascript
// In sphere-manager.js, isInsideRectangle function  
const width = 0.08;   // 16cm total width instead of 24cm
const height = 0.03;  // 6cm total height instead of 9cm
// Also update index.html visual rectangles to match:
// geometry="width: 0.16; height: 0.06; depth: 0.18"
```

### Example 5: 9-Position Arc (Same 80° Range)
```javascript
// In sphere-manager.js, createSpheres function
for (let i = 0; i < 9; i++) {         // 9 positions instead of 11
    let angle = -40 + (i * 10);       // 10° increments instead of 8°
}
// Must also update:
// - appearanceCounts = [0,0,0,0,0,0,0,0,0]; (9 zeros)
// - All other loops to use < 9
// - totalTrials = 9 * this.appearancesPerSphere
```
