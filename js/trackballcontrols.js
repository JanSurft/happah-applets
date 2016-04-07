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
    //TEMP
    var s_scene = Symbol('scene');
    var s_helper = Symbol('arrow');

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
         * 1. create axis from a ray through the target (x- y-axis)
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

                // Vector between old mouse pos and new mouse pos.
                var cameraDirection = new THREE.Vector2();
                cameraDirection.addVectors(this[s_mouseVector], currentMouseVec);

                // Transform to 3D world space
                var cameraWorldDirection = new THREE.Vector3();
                cameraWorldDirection.x = cameraDirection.x;
                cameraWorldDirection.y = cameraDirection.y;
                cameraWorldDirection.z = 0;
                cameraWorldDirection.applyMatrix4(this[s_camera].matrixWorld);


                // Factor
                var accelerator = 0.0015;

                // Get the distance from old mouse vector to the current one.
                var mouseDeltaX = (currentMouseVec.x - this[s_mouseVector].x);
                var mouseDeltaY = (currentMouseVec.y - this[s_mouseVector].y);

                // Before going on, update the mousevector
                this[s_mouseVector].x = currentMouseVec.x;
                this[s_mouseVector].y = currentMouseVec.y;

                /** Create the axis */
                // Create a vector in camera space
                var rightVec = new THREE.Vector3(0, 0, 1);
                var topVec = new THREE.Vector3(1, 0, 0);

                // Transform into world space
                rightVec = rightVec.applyMatrix4(this[s_camera].matrixWorld);
                topVec = topVec.applyMatrix4(this[s_camera].matrixWorld);
                // Helper arrow to visualize directions
                this[s_helper].setDirection(cameraWorldDirection);

                // Generate a quaternion for vertical movement
                var verticalQuat = new THREE.Quaternion();
                var horizontalQuat = new THREE.Quaternion();
                verticalQuat.setFromAxisAngle(rightVec, mouseDeltaY * 0.00015);
                horizontalQuat.setFromAxisAngle(topVec, mouseDeltaX * 0.00015);

                // Create a ray from that vectror through the target
                var rightRay = new THREE.Ray(this[s_target], rightVec);
                var topRay = new THREE.Ray(this[s_target], topVec);

                // Create the mouse ray
                this[s_mouseRay].set(this[s_camera].position, this[s_target]);
                var cameraDirection = this[s_mouseRay].direction.normalize();

                // TEST: MOVE DIRECTION
                var up = this[s_camera].up.clone();
                var currentEyeDir = new THREE.Vector3();
                var axis = new THREE.Vector3();
                var moveDirection = new THREE.Vector3(mouseDeltaX, mouseDeltaY, 0);
                var quaternion = new THREE.Quaternion();
                quaternion.setFromAxisAngle(cameraWorldDirection, (mouseDeltaX / mouseDeltaY) * accelerator);

                // The new ray through mouse + target
                var currentMouseRay = new THREE.Ray(new THREE.Vector3(currentMouseVec.x, currentMouseVec.y, 1), this[s_target]);

                // Get the angle between our mouse rays
                //var angle = Math.atan2(currentMouseRay.direction.y - mouseRay.direction.y, currentMouseRay.direction.x - mouseRay.direction.x);


                this[s_camera].position.applyQuaternion(quaternion);
                //camera.position.applyQuaternion(verticalQuaternion);
                //this[s_camera].position.applyQuaternion(horizontalQuat);
                //this[s_camera].position.applyQuaternion(verticalQuat);
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
