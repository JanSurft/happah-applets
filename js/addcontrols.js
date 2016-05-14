//////////////////////////////////////////////////////////////////////////////
//
// AddControls
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', 'spherical-impostor'], function($, THREE, happah) {
    var s_camera = Symbol('camera');
    var s_renderer = Symbol('renderer');
    var s_scene = Symbol('scene');
    var s_storyboard = Symbol('storyboard');
    var s_algorithm = Symbol('algorithm');

    // For testing purposes only
    var s_addMode = Symbol('addMode');
    var s_isHead = Symbol('ishead');

    class AddControls {

        constructor(renderer, scene, algorithm, storyboard, camera) {
            this.onMouseDoubleclick = this.onMouseDoubleclick.bind(this);
            this.onMouseClick = this.onMouseClick.bind(this);

            this[s_renderer] = renderer;
            this[s_scene] = scene;
            this[s_algorithm] = algorithm;
            this[s_storyboard] = storyboard;
            this[s_addMode] = false;
            this[s_camera] = camera;
        }

        /** Returns the position of an HTML element */
        getElementPosition(element) {
            var position = new THREE.Vector2(0, 0);

            while (element) {
                position.x += (element.offsetLeft - element.scrollLeft + element.clientLeft);
                position.y += (element.offsetTop - element.scrollTop + element.clientTop);
                element = element.offsetParent;
            }
            return position
        }

        onMouseDoubleclick(event) {
            // Get current mouse position on screen
            var elementPosition = this.getElementPosition(event.currentTarget);

            var vector = new THREE.Vector2();
            vector.x = ((event.clientX - elementPosition.x) / event.currentTarget.width) * 2 - 1;
            vector.y = -((event.clientY - elementPosition.y) / event.currentTarget.height) * 2 + 1;

            // Create new raycaster from mouse position
            var raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(vector, this[s_camera]);

            // Check if we hit a sphericalImpostor. If so, save the position
            // NOTE: only check for first and last impostor (head/tail)
            var impostors = this[s_scene]._controlPointImpostors.children;
            var headTail = [impostors[0], impostors[impostors.length - 1]];
            var intersects = raycaster.intersectObjects(headTail, true);
            if (intersects[0] == headTail[0]) {
                // Dblclick on head
                this[s_isHead] = true;
            } else {
                this[s_isHead] = false;
            }

            // Toggle add mode
            if (intersects[0]) {
                this[s_addMode] = true;
                // Set the cursor
                this[s_renderer].domElement.style.cursor = "crosshair";
                //this[s_dragControls].disable();
            }
        }

        onMouseClick(event) {
            if (this[s_addMode]) {
                // Get current mouse position on screen
                var elementPosition = this.getElementPosition(event.currentTarget);

                var vector = new THREE.Vector2();
                vector.x = ((event.clientX - elementPosition.x) / event.currentTarget.width) * 2 - 1;
                vector.y = -((event.clientY - elementPosition.y) / event.currentTarget.height) * 2 + 1;

                // Create new raycaster
                var raycaster = new THREE.Raycaster();
                raycaster.setFromCamera(vector, this[s_camera]);

                // Intersect with impostors
                var impostors = this[s_scene]._controlPointImpostors.children;
                var intersects = raycaster.intersectObjects(impostors, true);

                // Exit add mode.
                if (intersects[0]) {
                    this[s_addMode] = false;
                    this[s_renderer].domElement.style.cursor = "default";
                    //this[s_dragControls].enable();
                    return;
                }

                // Intersect with XZ-plane
                var position = raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));

                // Add a new point to the specified position
                this[s_scene].addControlPoints([position], this[s_isHead]);

                this[s_storyboard] = this[s_algorithm].storyboard();
            }
        }


    } //class Addcontrols

    return {
        AddControls: AddControls
    };
});