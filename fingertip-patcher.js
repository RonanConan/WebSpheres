<script>
AFRAME.registerComponent('fingertip-patcher', {
  // Pre-allocate helpers
  init() {
    this._mat = new THREE.Matrix4();
    this._vec = new THREE.Vector3();

    /*  Tip indices in the hand-tracking-controls JOINTS array
        0  wrist
        1  thumb-metacarpal … 4  thumb-tip
        5  index-metacarpal … 9  index-tip
        10 middle-…          14 middle-tip
        15 ring-…            19 ring-tip
        20 pinky-…           24 pinky-tip
    */
    this.tipIndices = {
      thumb : 4,
      index : 9,   // already exposed, but we update it too for consistency
      middle: 14,
      ring  : 19,
      pinky : 24
    };
  },

  tick() {
    // Look for every active hand each frame
    this.el.sceneEl.querySelectorAll('[hand-tracking-controls]').forEach(handEl => {
      const ht = handEl.components['hand-tracking-controls'];
      if (!ht || !ht.hasPoses) return;   // hand not present this frame

      // For each fingertip we care about …
      Object.entries(this.tipIndices).forEach(([name, i]) => {
        // Allocate the Vector3 once if necessary
        const prop = `${name}TipPosition`;
        if (!ht[prop]) ht[prop] = new THREE.Vector3();

        // Extract joint matrix → local position
        this._mat.fromArray(ht.jointPoses, i * 16);
        ht[prop].setFromMatrixPosition(this._mat);

        // Convert to world space so it matches indexTipPosition convention
        handEl.object3D.localToWorld(ht[prop]);
      });
    });
  }
});
</script>
