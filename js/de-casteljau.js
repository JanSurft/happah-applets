var init = function() {
     var scene = happah.scene();
     var camera = DEFAULTS.getCamera();
     var renderer = DEFAULTS.getRenderer();
     var controls = DEFAULTS.getControls(camera);
     var grid = DEFAULTS.getGrid();
     scene.add(grid);

     camera.position.z=5;
     controls.target.set(0,0,0);
     renderer.setSize(300,300);
     document.body.appendChild(renderer.domElement);
}
