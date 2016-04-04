/**
 * ------------ TRACKBALL CONTROLS ------------
 * Moves the camera along the edge of a circle.
 *   --> Using Quaternion-Transformation.
 */
define(['three', 'happah'], function(THREE, happah) {
     var s_raycaster = Symbol('raycaster');
     var s_target = Symbol('target');
     var s_previousRay = Symbol('previousray');
     var s_mouseVector = Symbol('mousevector');
     var s_mouseRay = Symbol('mouseray');
     var s_sphere = Symbol('sphere');
     var s_moving = Symbol('moving');
     var s_radius = Symbol('radius');
     var s_oldAngle = Symbol('oldangle');
     var s_cameraVector = Symbol('cameraVector');
     var s_camera = Symbol('camera');
     var s_enabled = Symbol('enabled');

     class TrackballControls {

          constructor(camera) {
               this.onMouseKeyUp = this.onMouseKeyUp.bind(this);
               this.onMouseMove = this.onMouseMove.bind(this);
               this.onMouseKeyDown = this.onMouseKeyDown.bind(this);
               this.enable = this.enable.bind(this);
               this.disable = this.disable.bind(this);

               this[s_raycaster] = new THREE.Raycaster();
               this[s_camera] = camera;

               // The point where the camera looks at
               this[s_target] = new THREE.Vector3(0, 0, 0);
               this[s_previousRay] = new THREE.Ray(this[s_camera].position, this[s_target]);
               this[s_mouseVector] = new THREE.Vector3(0, 0, 1);
               this[s_cameraVector] = new THREE.Vector3(0, 0, 10);
               this[s_mouseRay] = new THREE.Ray(this[s_mouseVector], this[s_target]);
               this[s_sphere] = new THREE.Sphere(this[s_target], 10);
               this[s_moving] = false;
               this[s_radius] = 10;
               this[s_oldAngle] = 1;
               this[s_enabled] = true;

          }

          /**
           * 1. create axis from a ray through the target (x- y-axis)
           * 2. quaternion.setFromAxisAngle(ax, angle);
           * 3. cam.applyQuaternion(quat);
           * 4. ???
           * 5. profit.
           */
          onMouseMove(event) {

               if (this[s_enabled] === false) return;

               // Test
               console.log("Mouse move event, moving: " + this[s_moving]);

               if (this[s_moving]) {
                    // Get current mouse coordinates
                    var mouseX = ((event.clientX - elementPosition.x) / event.currentTarget.width) * 2 - 1;
                    var mouseY = -((event.clientY - elementPosition.y) / event.currentTarget.height) * 2 + 1;

                    // Get the distance from old mouse vector to the current one.
                    var mouseDeltaX = mouseX - this[s_mouseVector].x;
                    var mouseDeltaY = mouseY - this[s_mouseVector].y;

                    // Before going on, update the mousevector
                    this[s_mouseVector].x = mouseX;
                    this[s_mouseVector].y = mouseY;

                    // Create the axis
                    this[s_mouseRay].set(this[s_camera].position, this[s_target]);
                    var cameraDirection = this[s_mouseRay].direction.normalize();

                    // TEST: MOVE DIRECTION
                    var up = this[s_camera].up.clone();
                    var currentEyeDir = new THREE.Vector3();
                    var axis = new THREE.Vector3();
                    var moveDirection = new THREE.Vector3(mouseDeltaX, mouseDeltaY, 0);
                    var quaternion = new THREE.Quaternion();
                    quaternion.setFromAxisAngle(up, 0.015);

                    // The new ray through mouse + target
                    var currentMouseRay = new THREE.Ray(new THREE.Vector3(x, y, 1), this[s_target]);

                    // Get the angle between our mouse rays
                    //var angle = Math.atan2(currentMouseRay.direction.y - mouseRay.direction.y, currentMouseRay.direction.x - mouseRay.direction.x);
                    /*
                    var vAngle = Math.asin(mouseDeltaY / 20); //Math.atan2(mouseDeltaY, 1) / 16;
                    var hAngle = Math.asin(mouseDeltaX / 20);


                    // Build quaternion
                    var verticalQuaternion = new THREE.Quaternion();
                    var horizontalQuaternion = new THREE.Quaternion();
                    verticalQuaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), vAngle);
                    horizontalQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), hAngle);
                    //verticalQuaternion.setFromRotationMatrix(matrix);

                    */

                    //cameraVector.applyQuaternion(verticalQuaternion);
                    //camera.position.applyQuaternion(verticalQuaternion);
                    this[s_camera].position.applyQuaternion(quaternion);
                    //camera.position.transformDirection(matrix);
                    this[s_camera].lookAt(this[s_target]);
                    this[s_camera].updateProjectionMatrix();
               }

          }

          enable() {
               this[s_enabled] = true;
          }
          disable() {
               this[s_enabled] = false;
          }

          onMouseKeyDown(event) {
               if (this[s_enabled] === false) return;
               // Test
               console.log("Key pressed!");
               this[s_moving] = true;

               // Get the current mouse vector
               this[s_mouseVector].x = (event.clientX / window.innerWidth) * 2 - 1;
               this[s_mouseVector].y = -(event.clientY / window.innerHeight) * 2 + 1;

               this[s_mouseRay].set(this[s_mouseVector], this[s_target]);
          }

          onMouseKeyUp(event) {
               if (this[s_enabled] === false) return;
               // Test
               console.log("Key released!");

               this[s_moving] = false;
          }

          onMouseWheelMove(event) {
               if (this[s_enabled] === false) return;
               // Test
               console.log("Wheel moved!");

               // Check the wheels direction
               var wheelDelta = event.wheelDelta / 40;

               // Increase the sphere's radius
               this[s_sphere].radius += wheelDelta;

               // Get the new camera position from the sphere
               this[s_cameraVector].z -= wheelDelta;
          }

          setTarget(x, y, z) {
               this[s_target].set(x, y, z);
          }

     } // Class Trackball controls

     return {
          TrackballControls: TrackballControls
     };
});
