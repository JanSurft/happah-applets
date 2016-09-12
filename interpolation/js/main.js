require.config({
    baseUrl: '../js',
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
        impromptu: "https://cdn.rawgit.com/trentrichardson/jQuery-Impromptu/master/dist/jquery-impromptu.min",
        mathjax: "https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML",
        jquery: "https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min",
        three: "http://threejs.org/build/three",
        TrackballControls: "http://threejs.org/examples/js/controls/TrackballControls",
        TransformControls: "http://threejs.org/examples/js/controls/TransformControls",
        bootstrap: "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap",
        //shader: '../lib/shader',
        //shaders: '../shaders'
    }
});

require(['happah', 'three', 'jquery', 'bootstrap', 'impromptu', 'mathjax'], function(happah, THREE, $) {
    var scene = new happah.Scene();
    var algorithm = new happah.Line(scene.controlPoints);
    var viewport = new happah.Viewport($('.hph-canvas')[0], scene, algorithm);
    viewport.camera.position.set(0, 1, 0);
    viewport.camera.lookAt(scene.position);
    viewport.camera.zoom = 2.5;
    viewport.camera.updateProjectionMatrix();

    // Initialize some points
    viewport.addControls.addControlPoints([
        new THREE.Vector3(-50, 0, -30),
        new THREE.Vector3(-40, 0, 30)
    ]);

    viewport.update();

    // TEST
    //var i = new happah.Menu(".dropdown-menu", scene, viewport);
    //var l = new happah.Menu(".btn-group", scene, viewport);
    console.log("happah initialized.");
});
