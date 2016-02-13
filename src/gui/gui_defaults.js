/**
 * Holds default values for simple viewport setup.
 */
HAPPAH.GUI_DEFAULTS = {
    getScene: function() {
        return new THREE.Scene();
    },

    getCamera: function( /* options */ ) {
        return new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    },

    getRenderer: function( /* options */ ) {
        return new THREE.WebGLRenderer();
    },

    getGrid: function() {
        return new THREE.GridHelper(100, 10);
    },

    getControls: function(camera) {
        // TODO: Remove all references to THREE->Examples!
        //return new THREE.TrackballControls(camera);
        return new THREE.TrackballControls(camera);
    },

    getLight: function(color) {
        return new THREE.AmbientLight(color);
    },
    getLights: function() {
        var lights = [];
        var light = new THREE.PointLight(0xffffff, 1, 0);
        light.position.set(0, 200, 0);
        lights.push(light);
        light = new THREE.PointLight(0xffffff, 1, 0);
        light.position.set(100, 200, 100);
        lights.push(light);
        light = new THREE.PointLight(0xffffff, 1, 0);
        light.position.set(-100, -200, -100);
        lights.push(light);
        lights.push(new THREE.HemisphereLight(0xffffbb, 0x080820, 1));
        lights.push(new THREE.AmbientLight(0x000000));
        return lights;
    }
};
