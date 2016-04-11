define(['three', 'happah'], function(THREE, happah) {
     var s_raycaster = Symbol('raycaster');
     var s_target = Symbol('target');
     var s_previousRay = Symbol('previousray');
     var s_raycaster = Symbol('raycaster');
     var s_cameraPlane = Symbol('cameraplane');
     var s_mouseVector = Symbol('mousevector');
     var s_mouseRay = Symbol('mouseray');
     var s_cameraRay = Symbol('cameraray');
     var s_sphere = Symbol('sphere');
     var s_moving = Symbol('moving');
     var s_radius = Symbol('radius');
     var s_oldAngle = Symbol('oldangle');
     var s_cameraVector = Symbol('cameraVector');
     var s_camera = Symbol('camera');
     var s_enabled = Symbol('enabled');
     //TEMP
     var s_scene = Symbol('scene');
     var s_helper = Symbol('arrow');
     var s_plane = Symbol('plane');

     class TrackballControls {

          constructor(camera, scene) {
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
               this[s_mouseVector] = new THREE.Vector2();
               this[s_cameraVector] = new THREE.Vector3(0, 0, 10);
               this[s_mouseRay] = new THREE.Ray(this[s_mouseVector], this[s_target]);
               this[s_sphere] = new THREE.Sphere(this[s_target], 10);
               this[s_cameraPlane] = new THREE.Plane(this[s_mouseRay].direction, 10);
               this[s_raycaster] = new THREE.Raycaster();
               this[s_cameraRay] = new THREE.Ray(this[s_target], this[s_camera].getWorldDirection());
               this[s_plane] = new THREE.Plane(this[s_camera].position, 0);
               this[s_moving] = false;
               this[s_radius] = 10;
               this[s_oldAngle] = 1;
               this[s_enabled] = true;
               this[s_scene] = scene;

               this[s_helper] = new THREE.ArrowHelper(this[s_mouseVector], this[s_target], 4, 0xfffe00);
               this[s_scene].add(this[s_helper]);

          }

          /** Returns the position of our HTML element */
          getElementPosition(element) {
               var position = new THREE.Vector2(0, 0);

               while (element) {
                    position.x += (element.offsetLeft - element.scrollLeft + element.clientLeft);
                    position.y += (element.offsetTop - element.scrollTop + element.clientTop);
                    element = element.offsetParent;
               }
               return position;
          }

          /**
           * 1. Create the direction vector from old and new mouse position
           * 2. quaternion.setFromAxisAngle(ax, angle);
           * 3. cam.applyQuaternion(quat);
           * 4. ???
           * 5. profit.
           */
          onMouseMove(event) {

               if (this[s_enabled] === false) return;

               if (this[s_moving]) {
                    // TODO: don't calculate the position every time.
                    //       -> only on window resize...
                    var elementPosition = this.getElementPosition(event.currentTarget);
                    var currentMouseVec = new THREE.Vector2();

                    // Get current mouse coordinates
                    currentMouseVec.x = ((event.clientX - elementPosition.x) / event.currentTarget.width) * 2 - 1;
                    currentMouseVec.y = -((event.clientY - elementPosition.y) / event.currentTarget.height) * 2 + 1;

                    // Get the cameras eye direction
                    this[s_raycaster].setFromCamera(new THREE.Vector2(0, 0), this[s_camera]);

                    // Create a plane in front of the camera to simulate screen space
                    this[s_plane].set(this[s_raycaster].ray.direction, -this[s_camera].position.dot(this[s_raycaster].ray.direction) + 1);
                    console.log(this[s_camera].position);

                    // Create a ray from mouse vector.
                    this[s_raycaster].setFromCamera(currentMouseVec, this[s_camera]);
                    var currentRay = this[s_raycaster].ray;

                    // Get the intersection points of old and new ray
                    var oldIntersect = this[s_previousRay].intersectPlane(cameraPlane);
                    var newIntersect = currentRay.intersectPlane(cameraPlane);

                    // Create vector between both intersects
                    var direction = oldIntersect.add(newIntersect);
                    console.log(direction);

                    // Generate the rotation axis from mouse dir and camera ray
                    var axis = this[s_previousRay].direction.cross(direction);
                    this[s_helper].setDirection(axis);

                    // Create quaternion for camera rotation
                    var quaternion = new THREE.Quaternion();

                    // Set the values
                    quaternion.setFromAxisAngle(axis, direction.length * 0.000015);

                    // Update previous ray
                    this[s_previousRay] = currentRay;

                    // Update camera orientation
                    this[s_camera].position.applyQuaternion(quaternion);

                    //this[s_camera].lookAt(this[s_target]);
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
               this[s_moving] = true;

               // Get the current mouse vector
               this[s_mouseVector].x = (event.clientX / window.innerWidth) * 2 - 1;
               this[s_mouseVector].y = -(event.clientY / window.innerHeight) * 2 + 1;

               this[s_mouseRay].set(this[s_mouseVector], this[s_target]);
          }

          onMouseKeyUp(event) {
               if (this[s_enabled] === false) return;
               // Test

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
