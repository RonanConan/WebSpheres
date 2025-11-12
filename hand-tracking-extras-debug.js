AFRAME.registerComponent("hand-tracking-extras", {
  init: function () {
    console.log("🟢 hand-tracking-extras INIT called for:", this.el);
    console.log("🔍 Available components on this element:", Object.keys(this.el.components));
    this.el.addEventListener("enter-vr", this.play.bind(this));
    this.el.addEventListener("exit-vr", this.pause.bind(this));
    this.debugLogged = false;
  },
  
  tick: function () {
    return function () {
      if (this.isPaused) {
        return;
      }
      
      // Only log once to avoid spam
      if (!this.debugLogged) {
        console.log("📋 All components on hand element:", Object.keys(this.el.components));
        this.debugLogged = true;
      }
      
      var handTrackingControls = this.el.components['hand-tracking-controls'];
      
      if (!handTrackingControls) {
        console.warn("⚠️ No hand-tracking-controls found");
        return;
      }
      
      console.log("🔍 hand-tracking-controls object:", handTrackingControls);
      console.log("🔍 hand-tracking-controls.controller:", handTrackingControls.controller);
      
      // Check if we can access the controller through the hand-tracking-controls
      if (handTrackingControls.controller && handTrackingControls.controller.hand) {
        console.log("✅ Found controller.hand!");
        
        var frame = this.el.sceneEl.frame;
        if (!frame) {
          console.warn("⚠️ No frame available");
          return;
        }
        
        console.log("✅ Frame available!");
        
        // Check for reference space
        var xrSession = this.el.sceneEl.renderer.xr.getSession();
        if (!xrSession) {
          console.warn("⚠️ No XR session");
          return;
        }
        
        console.log("✅ XR Session available!");
        
        var referenceSpace = this.el.sceneEl.renderer.xr.getReferenceSpace();
        if (!referenceSpace) {
          console.warn("⚠️ No reference space");
          return;
        }
        
        console.log("✅ Reference space available!");
        console.log("🎉 ALL REQUIREMENTS MET - Should create HandData now!");
        
        if (!this.HandData) {
          this.createHandData(handTrackingControls.controller, frame, referenceSpace);
        }
        
        this.HandData.updateData(handTrackingControls.controller, frame, referenceSpace);
      } else {
        console.warn("⚠️ No controller or controller.hand");
      }
    };
  }(),
  
  createHandData: function(controller, frame, referenceSpace) {
    console.log("🎉 Creating HandData!");
    
    const HandData = function() {
      const Joint_Count = 25;
      const rotMtx = { elements: new Float32Array(16) };
      const radii = new Float32Array(Joint_Count);
      const transforms = new Float32Array(4 * 4 * Joint_Count);
      var validPoses = false;
      
      var tmpVector = new THREE.Vector3();
      var tmpQuaternion = new THREE.Quaternion();
      var tmpDummy = new THREE.Object3D();
      
      const JointObject = function(id, num, parent) {
        this.id = id;
        this.num = num;
        this.parent = parent;
      };
      
      JointObject.prototype.getPosition = function(_vector) {
        return this.parent.getPosition(this.num, _vector);
      };
      
      JointObject.prototype.isValid = function() {
        return this.parent.getValidity(this.num);
      };
      
      let num = 0;
      const joints = {
        Wrist: new JointObject("wrist", num++, this),
        T_Metacarpal: new JointObject("thumb-metacarpal", num++, this),
        T_Proximal: new JointObject("thumb-phalanx-proximal", num++, this),
        T_Distal: new JointObject("thumb-phalanx-distal", num++, this),
        T_Tip: new JointObject("thumb-tip", num++, this),
        I_Metacarpal: new JointObject("index-finger-metacarpal", num++, this),
        I_Proximal: new JointObject("index-finger-phalanx-proximal", num++, this),
        I_Intermediate: new JointObject("index-finger-phalanx-intermediate", num++, this),
        I_Distal: new JointObject("index-finger-phalanx-distal", num++, this),
        I_Tip: new JointObject("index-finger-tip", num++, this),
        M_Metacarpal: new JointObject("middle-finger-metacarpal", num++, this),
        M_Proximal: new JointObject("middle-finger-phalanx-proximal", num++, this),
        M_Intermediate: new JointObject("middle-finger-phalanx-intermediate", num++, this),
        M_Distal: new JointObject("middle-finger-phalanx-distal", num++, this),
        M_Tip: new JointObject("middle-finger-tip", num++, this),
        R_Metacarpal: new JointObject("ring-finger-metacarpal", num++, this),
        R_Proximal: new JointObject("ring-finger-phalanx-proximal", num++, this),
        R_Intermediate: new JointObject("ring-finger-phalanx-intermediate", num++, this),
        R_Distal: new JointObject("ring-finger-phalanx-distal", num++, this),
        R_Tip: new JointObject("ring-finger-tip", num++, this),
        L_Metacarpal: new JointObject("pinky-finger-metacarpal", num++, this),
        L_Proximal: new JointObject("pinky-finger-phalanx-proximal", num++, this),
        L_Intermediate: new JointObject("pinky-finger-phalanx-intermediate", num++, this),
        L_Distal: new JointObject("pinky-finger-phalanx-distal", num++, this),
        L_Tip: new JointObject("pinky-finger-tip", num++, this)
      };
      
      this.joints = joints;
      
      this.updateData = (controller, frame, referenceSpace) => {
        frame.fillJointRadii(controller.hand.values(), radii);
        validPoses = frame.fillPoses(controller.hand.values(), referenceSpace, transforms);
        if (!validPoses) return;
      };
      
      this.getPosition = (id, _vector) => {
        const mtxOffset = id * 16;
        let vector = _vector ? _vector : tmpVector.clone();
        return vector.fromArray(transforms, mtxOffset + 12);
      };
      
      this.getValidity = () => validPoses;
    };
    
    this.HandData = new HandData();
    console.log("✅ HandData created:", this.HandData);
    console.log("✅ Joints available:", Object.keys(this.HandData.joints));
    
    this.el.emit("hand-tracking-extras-ready", {
      data: this.HandData
    });
    
    console.log("🎉 hand-tracking-extras-ready EVENT EMITTED!");
  },
  
  play: function () {
    console.log("▶️ hand-tracking-extras PLAY called");
    this.isPaused = false;
  },
  
  pause: function () {
    console.log("⏸️ hand-tracking-extras PAUSE called");
    this.isPaused = true;
  },
  
  remove: function () {
    this.el.removeEventListener("enter-vr", this.play);
    this.el.removeEventListener("exit-vr", this.pause);
  }
});
