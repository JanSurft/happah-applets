define(['jquery', 'three', 'lib/util'], function($, THREE, UTIL) {
     var s_camera = Symbol('camera');
     var s_oldMouse = Symbol('old');
     var s_enabled = Symbol('enabled');
     var s_cameraTarget = Symbol('cameratarget');
     var s_scene = Symbol('scene');
     var s_helper = Symbol('helper');
     var s_pq = Symbol('pq');

     var s_ppos = Symbol('ppos');

     class TrackballControls {

          constructor(camera, scene) {
               this.mouseDown = this.mouseDown.bind(this);
               this.mouseMove = this.mouseMove.bind(this);
               this.mouseUp = this.mouseUp.bind(this);

               this[s_camera] = camera;
               this[s_oldMouse] = camera.position;
               this[s_enabled] = false;
               this[s_scene] = scene;
               this[s_ppos] = new THREE.Vector3();
               this[s_pq] = new THREE.Quaternion();

               // The target where the camera is looking
               this[s_cameraTarget] = new THREE.Vector3(0, 0, 0);

               if ((camera && camera.isPerspectiveCamera)) {
                    //
               } else if ((camera && camera.isOrthographicCamera)) {
                    this[s_oldMouse].setZ((camera.near + camera.far) / (camera.near - camera.far)).unproject(camera);
               } else {
                    console.error('HAPPAH.TrackballControls: Unsupported camera type.');
               }
          }

          listenTo(domElement) {
               domElement.addEventListener('mousedown', this.mouseDown, false);
               domElement.addEventListener('mousemove', this.mouseMove, false);
               domElement.addEventListener('mouseup', this.mouseUp, false);
          }
          stopListeningTo(domElement) {
               domElement.removeEventListener('mousedown', this.mouseDown, false);
               domElement.removeEventListener('mousemove', this.mouseMove, false);
               domElement.removeEventListener('mouseup', this.mouseUp, false);
          }

          mouseDown(event) {
               // Enable trackball controls
               this[s_enabled] = true;
          }

          mouseMove(event) {
               if (!this[s_enabled]) {
                    return;
               }
               // Get html position for origin offset
               var elementPosition = UTIL.Util.getElementPosition(event.currentTarget);

               // Calculate relative mouse position
               var newMouse = new THREE.Vector3();
               newMouse.x = ((event.clientX - elementPosition.x) / event.currentTarget.width) * 2 - 1;
               newMouse.y = -((event.clientY - elementPosition.y) / event.currentTarget.height) * 2 + 1;

               // Direction of the camera
               var eyeDirection = this[s_camera].position.sub(this[s_cameraTarget]);

               // Extracted from THREE.Raycaster
               if ((this[s_camera] && this[s_camera].isPerspectiveCamera)) {
                    //this.ray.origin.setFromMatrixPosition(camera.matrixWorld);
                    //this.ray.direction.set(coords.x, coords.y, 0.5).unproject(camera).sub(this.ray.origin).normalize();
               } else if ((this[s_camera] && this[s_camera].isOrthographicCamera)) {
                    newMouse.setZ((this[s_camera].near + this[s_camera].far) / (this[s_camera].near - this[s_camera].far)).unproject(this[s_camera]);
               } else {
                    console.error('HAPPAH.TrackballControls: Unsupported camera type.');
               }
               // Direction in which we moved the cursor
               var mouseDirection = new THREE.Vector3(newMouse.x - this[s_oldMouse].x, newMouse.y - this[s_oldMouse].y, newMouse.z - this[s_oldMouse].z);

               // TODO: calculate median of previous directions to get smooth
               // movement
               if (mouseDirection.length() < 2) {
                    return;
               }
               var axis = mouseDirection.cross(this[s_camera].getWorldDirection()).normalize()

               this[s_scene].remove(this[s_helper]);
               this[s_helper] = new THREE.ArrowHelper(axis, new THREE.Vector3(0, 0, 0), 10);
               this[s_scene].add(this[s_helper]);

               // Calculate distance to previous point
               var delta = mouseDirection.length();

               // Calculate angle to move TODO parameter for radius
               var angle = 0.1; //2 * Math.asin(delta / 2 * 4) * (Math.PI / 180);

               // Create the quaternion
               //this[s_pq].copy(this[s_camera].quaternion);
               //var qm = new THREE.Quaternion();
               //qm.setFromAxisAngle(axis, angle);
               //var q = new THREE.Quaternion();
               //THREE.Quaternion.slerp(this[s_camera].quaternion, q, qm, 0.07);
               //this[s_camera].quaternion.copy(qm);
               //this[s_camera].quaternion.normalize();

               // Apply quaternion
               //this[s_camera].setRotationFromAxisAngle(axis, angle);
               var previousAngle = this[s_camera].quaternion.w;
               //this[s_camera].setRotationFromAxisAngle(axis, previousAngle);
               //this[s_camera].quaternion.w += 1;

               this[s_oldMouse] = newMouse;

               $.event.trigger({
                    type: "change",
                    message: "trackball controls update"
               });
          }

          mouseUp(event) {
               this[s_enabled] = false;
          }

     } // Class Trackball controls

     return {
          TrackballControls: TrackballControls
     };
});
