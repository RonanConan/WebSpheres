# VR Reaching Task - Research Application

## Overview
This VR application is designed for research studies investigating the impact of reinforcement (via game points) on hand selection as assessed through a reaching task.

While seated, participants reach for spheres that appear at various positions, with the system collecting detailed performance and timing data. The layout of the stimuli is similar to prior studies which investigated hand selection behaviours in healthy controls ([Valyear et al., 2019](https://doi.org/10.3758/s13423-018-1510-1), [Stoloff et al., 2011](https://doi.org/10.3389/fnins.2011.00041), [Oliveira et al., 2010](https://doi.org/10.1073/pnas.1006223107)).

## Hardware Requirements
- **Primary**: Meta Quest 3 with Quest Browser
- **Compatibility**: Should work with other WebXR-compatible VR headsets with hand tracking capability
- **Input**: Hand tracking (no controllers required for gameplay)
- **Controls**: Bluetooth keyboard required for researcher controls (calibration, settings, data export)
- **Setup**: Stable, non-swiveling chair or bed edge for participant seating
- **Space**: 2m x 2m clear area around participant for arm extension
- **Lighting**: Well-lit room (avoid mirrors in view of cameras, as these can interfere with hand tracking)

## Application Access
1. **Running the Study**: Run via GitHub pages (or host yourself) on any WebXR-compatible browser
2. **Bluetooth Keyboard**: Pair keyboard with Quest 3 before starting session (this must be via Bluetooth; 2.4GHz dongles or similar may not work correctly)
3. **Researcher Position**: Sit within keyboard range where you can see participant (streaming from headset to see participant's point-of-view is recommended)

## File Structure
```
├── index.html              # Main application file
├── sphere-manager.js       # Core game logic and sphere positioning
├── score-manager.js        # Scoring system and experimental conditions
├── data-manager.js         # Data collection and CSV export
├── audio-manager.js        # Audio feedback system
└── sounds/                 # Audio files for feedback
    ├── normal-hit.mp3
    ├── critical-hit.mp3
    ├── reach-calibration.mp3
    ├── height-calibration.mp3
    ├── lap-calibration.mp3
    ├── switch.mp3
    ├── left-hand.mp3
    └── right-hand.mp3
```

## How the Task Works
1. **Starting Position**: Participant places both hands in semi-transparent green rectangular zones (home positions, which they always reach from)
2. **Sphere Appearance**: Red spheres appear randomly at 11 pre-assigned positions arranged in an 80° arc (-40° to +40° from centre, participant's perspective)
3. **Reaching**: Participant reaches out to touch the sphere with either hand
4. **Hit Detection**: System detects contact when hand comes within 8cm of sphere center (this is to allow for some imprecision stemming from the hand tracking)
5. **Scoring System**: Points awarded randomly based on probability:
   - **Normal hits**: 1-5 points (normal hit sound plays)
   - **Critical hits**: 5-10 points (critical hit sound plays)
   - The probability of critical vs normal hits depends on experimental condition and hand used
6. **Sphere Feedback**: Sphere turns blue when hit, disappears after 300ms
7. **Trial Reset**: Participant returns hands to starting zones to trigger next sphere (500ms delay)

## Experimental Conditions

### Condition 1: NM (No-Manipulation)
- **Both hands**: 30% critical hit chance, 70% normal hit chance
- **Purpose**: Baseline condition with equal reward probability for both hands

### Condition 2: BT (Boost-and-Tax)  
- **Non-dominant hand**: 55% critical hit chance, 45% normal hit chance
- **Dominant hand**: 5% critical hit chance, 95% normal hit chance
- **Purpose**: Incentivizes use of non-dominant hand through differential score probabilities that favour the non-dominant hand

**Important**: The system randomly determines hit type based on these probabilities, on a per-hit basis. Hits are not 'pre-assigned' a certain value (normal or critical).

## Session Types
- **Normal Session**: 352 trials (32 appearances per sphere position)
  - *Intended for*: Healthy controls
- **Short Session**: 110 trials (10 appearances per sphere position)  
  - *Intended for*: Patients (in initial use-case) or shorter studies
  - *Activated by*: 'N' key during setup

## Pre-Session Checklist
- [ ] All files present & correct, and accessible by browser
- [ ] Bluetooth keyboard paired and tested
- [ ] Room well-lit, preferably with no mirrors in area
- [ ] 2m x 2m clear space around participant chair
- [ ] Stable, non-swiveling chair positioned for participant (or use bed edge, depending on context)
- [ ] Researcher can see participant and reach keyboard
- [ ] Quest 3 (or compatible headset) fully charged and hand tracking enabled
- [ ] Audio working (for feedback sounds)

To avoid disappointment, it is recommended that the experimenter tests the application before commencing a study session, especially if considerable time has passed since the last testing session — WebXR APIs change relatively frequently and some aspects (especially hand tracking) can suddenly stop working correctly or at all.

## Setup Protocol

### 1. Participant Preparation
- Seat participant comfortably in stable, non-swiveling chair/on bed edge
- Ensure VR headset fits properly and is comfortable  
- **Ask directly**: "Which is your dominant/preferred hand?"
- **Explain the task clearly**:
  - "Red spheres will appear at different positions around you"
  - "Reach out and touch them with whichever hand feels natural"
  - "You'll earn points - try to score as many as possible"
  - "Use whichever hand feels right for each sphere - there's no wrong choice"
  - "Although you cannot _miss_ trials for being too slow, try not to linger too much on each sphere"
  - "Try not to move your trunk/torso, just your arms. Remember that if you need any adjustments, you can pause the experiment at any time; you also have the right to stop fully and withdraw at any time"

### 2. System Calibration (Required before each session)
**CRITICAL**: Calibration must be performed in the following order:

#### A. Reach Distance Calibration
- **Participant**: Extend right hand to maximum comfortable reaching distance and hold steady
- **Researcher**: Press `SPACEBAR` to capture reach measurement
- **Purpose**: Sets sphere positioning radius (system uses 80% of measured distance for optimal comfort)
- **Verification**: Spheres should appear within comfortable reach; if participant reports discomfort when reaching, re-calibrate (can be done at any time)

#### B. Height Calibration  
- **Participant**: Sit in normal, comfortable position looking straight ahead
- **Researcher**: Press `H` to capture head height
- **Purpose**: Positions spheres and UI elements at appropriate height (system uses 80% of measured height)
- **Verification**: Spheres should appear at natural arm level

#### C. Lap Position Calibration
- **Participant**: Place both hands in most comfortable resting position on lap/thighs
- **Researcher**: Press `L` to set starting hand zones  
- **Purpose**: Positions the green starting rectangles where participant's hands naturally rest
- **Verification**: Green rectangles should appear around participant's resting hand positions

### 3. Experimental Setup
#### Set Dominant Hand
- **Left-handed**: Press `1` (audio confirmation: "left hand")
- **Right-handed**: Press `2` (audio confirmation: "right hand")
- **Verification**: Critical for BT condition - double-check this matches participant's stated dominance; it does not matter if handedness is set while the NM condition (default) is active

#### Set Condition
- **Toggle between NM/BT**: Press `C` (audio confirmation: "switch")
- **Default**: Starts in NM (Condition 1)
- **Verification**: Ensure correct condition for your research protocol; to avoid disappointment, if in doubt, restart

#### Session Length (if needed)
- **Switch to short session**: Press `N` (audio confirmation: "switch")
- **Default**: Normal session (352 trials)

### 4. Start Session
- **Begin session**: Press `P` (audio confirmation: "switch")
- **Note**: Session cannot be paused once started
- **Effective pause**: Remove headset if break needed - spheres will stop appearing when hands are not detected in starting position

## During the Session

### Participant Instructions 
1. "Keep both hands in the green rectangles until a red sphere appears"
2. "When you see a red sphere, reach out with whichever hand feels right and touch it"  
3. "The sphere will turn blue when you hit it"
4. "Return your hands to the green starting areas after each reach"
5. "Continue until the session is finished, when the progress meter reaches 100% _and_ no more spheres appear"
6. "Use whichever hand feels natural - there are no wrong choices"

### Researcher Monitoring (if streaming)
- **Score display**: Shows current points earned (top of visual field)
- **Progress display**: Shows percentage completion (below score)
- **Session tracking**: Watch for participant fatigue, discomfort; it is recommended to ask at the halfway point if they want a break
- **Data verification**: Post-experiment, ensure that data look correct

### What Participants See
- Semi-transparent green rectangles for hand starting positions
- Red spheres appearing at various positions in an arc
- Score and progress text displays
- Spheres turning blue when successfully hit

## Data Collection & Export

### All Data Collected During Session

#### Exported to CSV File (Primary Research Data)
- **Trial**: Sequential trial number (1-352 or 1-110)
- **Target**: Sphere position (1-11, representing target positions from left to right from participant's perspective)
- **Hand**: Hand used for successful hit (LEFT/RIGHT)
- **Points**: Points awarded for hit (1-5 for normal, 5-10 for critical)
- **HitType**: Type of hit (normal or critical; this is needed as a point value of 5 can be a normal or a critical hit)
- **DecisionTime**: Time from sphere appearance to hand leaving start zone (milliseconds)
- **TotalMovementTime**: Time from sphere appearance to successful contact (milliseconds)

#### Internal Tracking Data (Used for Game Logic)
- **Appearance Counts**: Number of times each sphere position (1-11) has appeared
- **Total Appearances**: Running count of completed trials
- **Last Selected Position**: Previous sphere position (prevents immediate repeats)
- **Current Score**: Cumulative points earned
- **Session Progress**: Percentage completion (current/total trials)
- **Current Condition**: Experimental condition (1=NM, 2=BT)
- **Dominant Hand**: Participant's reported dominant hand (LEFT/RIGHT)
- **Critical Hit Probabilities**: Current reward probabilities for each hand
- **Calibration Data**: Reach radius, height offset, hand starting positions
- **System State**: Current game state (invisible, waiting-to-appear, visible, waiting-to-disappear)
- **Timing Data**: Sphere appearance timestamps, hit timestamps, state transition times

### Data Export Options

#### Automatic Export
- CSV file automatically downloads when session completes
- Filename format: `vr-session-data-YYYY-MM-DD-HH-MM-SS.csv`
- **Location**: Browser downloads folder (accessible via respective file manager app)
- Contains all primary research data (see "Exported to CSV File" above)

#### Manual Export Options
1. **Keyboard**: Press `S` key
2. **VR Controller**: Press A button 5 times within 2 seconds (Quest 3 right controller; this is a legacy feature superseded by the above, but useful if keyboard fails catastrophically)

#### Export Verification
- **Check file size**: CSV should be several KB for completed sessions
- **Open file**: Verify correct number of rows (should match trial count + 1 header row)
- **Data integrity**: Last trial number should match expected total (352 or 110)

## Troubleshooting

### Common Issues
- **Spheres not appearing**: Check that both hands are properly positioned in green rectangles
- **Need to pause session**: Remove headset - spheres stop appearing when hands not detected
- **Hand tracking not working**: 
  - Ensure good lighting (avoid direct sunlight)
  - Clean headset cameras with microfiber cloth
  - Check hand tracking frequency on Quest headsets — this should be set to your local mains frequency
- **Calibration problems**: 
  - Repeat calibration steps
  - Ensure participant holds positions steady during calibration
- **Data not exporting**: Try manual export with 'S' key

### Data-Related Issues
- **Incomplete session**: Manual export saves whatever data was collected
- **Lost connection**: CSV data exports locally, check Quest Downloads folder
- **Multiple attempts**: Each export gets unique timestamp filename

## Key Commands Reference
| Key | Function |
|-----|----------|
| `SPACE` | Calibrate reach distance |
| `H` | Calibrate height |
| `L` | Calibrate lap positions |
| `1` | Set left-handed |
| `2` | Set right-handed |
| `C` | Toggle condition (NM/BT) |
| `N` | Switch to short session |
| `P` | Start session (one-time) |
| `S` | Export data |

## Best Practices
1. **Always calibrate** before each participant - never skip this step
2. **Verify dominant hand** setting matches participant's stated dominance
3. **Check condition** setting before starting (NM vs BT)
4. **Monitor participant** continuously for fatigue
5. **Test all systems** before participant arrives (keyboard, hand tracking, audio)
6. **For breaks**: Remove headset temporarily - spheres stop appearing when hands not detected
7. **Keep spare batteries/charger** for Bluetooth keyboard
8. **Document any issues** that occur during session for data analysis notes
9. **Clean headset** between participants for hygiene

## Technical Specifications

### Sphere Properties  
- **Sphere radius**: 5cm
- **Hit detection radius**: 8cm (contact detected when hand within 8cm of sphere center; in effect this means a 3cm allowance is provided)
- **Color**: Red (changes to blue when hit)

### Starting Position Rectangles
- **Dimensions**: 24cm wide × 9cm tall × 18cm deep
- **Appearance**: Semi-transparent green boxes visible in VR
- **Position**: Calibrated to participant's natural hand resting positions

### Sphere Positioning Arc
- **Total arc**: 80° (-40° to +40° from centre)
- **Number of positions**: 11
- **Spacing**: 8° increments between positions
- **Radius**: 80% of participant's maximum reach (calibrated)
- **Height**: 80% of participant's head height (calibrated)

### Timing Parameters
- **Sphere appearance delay**: 500ms after hands detected in starting positions
- **Sphere visibility duration**: Until hit
- **Sphere disappear delay**: 300ms after successful hit
