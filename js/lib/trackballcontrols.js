define(['three'], function(THREE) {
     var s_raycaster = Symbol('raycaster');
     var s_target = Symbol('target');
     var s_previousRay = Symbol('previousray');
     var s_previousIntersect = Symbol('previousintersect');
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
     var s_box = Symbol('box');

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
               this[s_previousIntersect] = new THREE.Vector3();
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
               var geo = new THREE.BoxGeometry(1, 1, 1);
               var mat = new THREE.MeshBasicMaterial({
                    color: 0x00dd00
               });
               this[s_box] = new THREE.Mesh(geo, mat);
               //            this[s_scene].add(this[s_box]);

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
          // TODO: override intersect method of three.sphere so that one can
          // get an intersect point that is on the sphere.
          onMouseMove(event) {

               if (this[s_enabled] == false) return;

               if (this[s_moving]) {
                    // TODO: don't calculate the position every time.
                    var elementPosition = this.getElementPosition(event.currentTarget);
                    var currentMouseVec = new THREE.Vector2();

                    // Get current mouse coordinates
                    currentMouseVec.x = ((event.clientX - elementPosition.x) / event.currentTarget.width) * 2 - 1;
                    currentMouseVec.y = -((event.clientY - elementPosition.y) / event.currentTarget.height) * 2 + 1;

                    // Adjust raycaster
                    this[s_raycaster].setFromCamera(currentMouseVec, this[s_camera]);

                    // Get eye direction
                    var eyeDirection = this[s_raycaster].ray.direction.clone().normalize();

                    // Create plane in front (inside) of camera
                    this[s_plane] = new THREE.Plane(eyeDirection, -this[s_camera].position.length());

                    // Create intersect with plane
                    var intersect = this[s_raycaster].ray.intersectPlane(this[s_plane]);
                    console.log(intersect);

                    // Get move direction
                    var moveDirection = intersect.clone().add(this[s_previousIntersect]);

                    // Get angle
                    var angle = moveDirection.length();

                    // Get move axis
                    var axis = new THREE.Vector3();
                    // TODO: set the origin of these vectors
                    axis = this[s_target].clone().add(axis.crossVectors(eyeDirection, moveDirection));

                    // Create quaternion from axis and angle
                    var quaternion = new THREE.Quaternion();
                    quaternion.setFromAxisAngle(axis, angle);

                    // Apply to camera position vector
                    this[s_camera].position.applyQuaternion(quaternion);
                    this[s_camera].lookAt(this[s_target]);
                    this[s_camera].updateProjectionMatrix();
                    /*
                     // RIGHT AFERT CURRENTMOUSEVEC..
                    // Get the cameras eye direction
                    this[s_raycaster].setFromCamera(currentMouseVec, this[s_camera]);
                    var ray = new happah.Ray();
                    ray.copy(this[s_raycaster].ray);

                    // Create sphere in front of the camera
                    var sphere = new THREE.Sphere(this[s_target], this[s_camera].position.length());

                    var newIntersect = ray.intersectSphere(sphere);

                    var ray1 = sphere.center.clone().add(this[s_previousIntersect]);
                    var ray2 = sphere.center.clone().add(newIntersect);

                    var angle = ray1.angleTo(ray2);


                    // Get the axis to rotate the camera around
                    var axis = this[s_previousIntersect].clone().add(newIntersect) //.cross(this[s_raycaster].ray.direction);
                    axis = this[s_target].clone().add(axis).cross(this[s_raycaster].ray.direction);
                    axis = axis.normalize();

                    //this[s_previousIntersect] = newIntersect;

                    var quaternion = new THREE.Quaternion();
                    quaternion.setFromAxisAngle(axis.normalize(), angle * 0.15);

                    console.log("distance to target:");
                    console.log(this[s_target].distanceTo(this[s_camera].position));
                    //this[s_camera].position.applyQuaternion(quaternion);
                    this[s_scene].remove(this[s_helper]);
                    this[s_helper] = new THREE.ArrowHelper(axis, this[s_target], 5, 0x335544);
                    this[s_scene].add(this[s_helper]);

                    this[s_camera].lookAt(this[s_target]);
                    this[s_camera].updateProjectionMatrix();
                    console.log(this[s_camera].position);
                    */
               }
          }

          enable() {
               this[s_enabled] = true;
          }
          disable() {
               this[s_enabled] = false;
          }

          onMouseKeyDown(event) {
               if (this[s_enabled] == false) return;
               // Test
               this[s_moving] = true;
               var elementPosition = this.getElementPosition(event.currentTarget);

               // Get the current mouse vector
               this[s_mouseVector].x = ((event.clientX - elementPosition.x) / event.currentTarget.width) * 2 - 1;
               this[s_mouseVector].y = -((event.clientY - elementPosition.y) / event.currentTarget.height) * 2 + 1;

               this[s_mouseRay].set(this[s_mouseVector], this[s_target]);

               // Get the cameras eye direction
               this[s_raycaster].setFromCamera(this[s_mouseVector], this[s_camera]);

               // Create sphere in front of the camera
               this[s_plane] = new THREE.Plane(this[s_raycaster].ray.direction.clone().normalize(), -this[s_camera].position.length());

               //
               this[s_previousIntersect] = this[s_raycaster].ray.intersectPlane(this[s_plane]);
          }

          onMouseKeyUp(event) {
               if (this[s_enabled] == false) return;
               // Test

               this[s_moving] = false;
          }

          onMouseWheelMove(event) {
               if (this[s_enabled] == false) return;
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
