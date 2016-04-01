require.config({
    baseUrl: 'js',
    shim: {
        'bootstrap': {
            deps: ['jquery']
        },
        'three': {
            exports: 'THREE'
        },
        'TrackballControls': {
            deps: ['three'],
            exports: 'THREE'
        },
        'TransformControls': {
            deps: ['three'],
            exports: 'THREE'
        }
    },
    paths: {
        i18n: "http://raw.githubusercontent.com/fnando/i18n-js/master/app/assets/javascripts/i18n",
        jquery: "https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min",
        three: "http://threejs.org/build/three",
        TrackballControls: "http://threejs.org/examples/js/controls/TrackballControls",
        TransformControls: "http://threejs.org/examples/js/controls/TransformControls",
        bootstrap: "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap"
            //shader: '../lib/shader',
            //shaders: '../shaders'
    }
});

function deCasteljau(params) {
    var DEFAULTS = {
        controlPoints1D: [],
        recursionDepth: 1,
    }

    // if no parameters are given use dafaults
    var par = $.extend({}, DEFAULTS, params);

    var points = [];

    // copy control points for first iteration.
    for (i = 0; i < par['controlPoints1D'].length; i++) {
        points[i] = par['controlPoints1D'][i];
    }

    for (j = 0; j < par['recursionDepth']; j++) {
        var tempPoints = [];
        // The first control point does not change.
        tempPoints[0] = points[0];
        // Get the middle of each segment and make it a new point.
        for (i = 0; i < points.length - 1; i++) {
            tempPoints[i + 1] = new THREE.Vector3(
                (points[i + 1].x + points[i].x) / 2, (points[i + 1].y + points[i].y) / 2, (points[i + 1].z + points[i].z) / 2
            );
        }
        // The last control point remains unchanged.
        tempPoints[tempPoints.length] = points[points.length - 1];
        // Set points array for next iteration.
        points = tempPoints;
    }

    return points;
}

var subdivideTest = require(['happah', 'three'], function(happah, THREE) {
    var controlPoints = [
        new THREE.Vector3(-50, 0, -30), new THREE.Vector3(-40, 0, 30),
        new THREE.Vector3(40, 0, 30), new THREE.Vector3(50, 0, -30),
    ];
    var curve = new happah.Curve(controlPoints);
    return curve.subdivide();
});

require(['happah', 'three', 'jquery', 'bootstrap'], function(happah, THREE, $) {
    var scene = new happah.Scene();
    var viewport = new happah.Viewport($('.hph-canvas')[0], scene);
    scene.algorithm = deCasteljau;
    scene.addControlPoint(new THREE.Vector3(-50, 0, -30)); //TODO: get rid of THREE
    scene.addControlPoint(new THREE.Vector3(-40, 0, 30)); //TODO: get rid of THREE
    scene.addControlPoint(new THREE.Vector3(40, 0, 30)); //TODO: get rid of THREE
    scene.addControlPoint(new THREE.Vector3(50, 0, -30)); //TODO: get rid of THREE
    viewport.animate();

    // TEST
    var i = new happah.Menu(".dropdown-menu", scene);
    //var k = new happah.DragControls(scene, viewport[s_camera], viewport[s_controls]);
    console.log("happah initialized.");


    var storyboard = new happah.Storyboard();
    var frame0 = new happah.Storyboard.Frame();
    storyboard.append(frame0);

    var defaults = {
        algorithm: 'De Casteljau',
        Rekursionstiefe: 0
    };
});

//TODO: animate? why not just paint?
//TODO: take algorithm stuff out of scene
//TODO: take animate out of scene
//TODO: fix fragDepth
//TODO: simplify vertex shaders
//TODO: move shaders into module
//TODO: move camera from position 0 to position 1 (use quaternion)
//TODO: check spherical impostor implementation; one billboard for all impostors; use drawarrayinstances from webgl2
//TODO: shader preprocessor
//TODO: trackballcontrols: reimplement removing dep on camera
//TODO: single insert() method for all inserts with type variable in object classes
//TODO: webgl2...use features such as instanced arrays
//TODO: data should be only once in memory with flags about how to render it
//TODO: remove animate form scene
//TODO: event-based rendering instead of infinite loop
//TODO: ray/sphere intersection in fragment shader...also important for point manipulation
//TODO: interval overlay for choosing ratio in de casteljau algorithm
//TODO: install and use compass
