 /////////////////////////////////////////////////////////////////////////////
 //
 // How-to guide through the website
 // Based on the example from http://trentrichardson.com
 // @url http://trentrichardson.com/Impromptu/#Examples
 // @author Tarek Wilkening (tarek_wilkening@web.de)
 //
 /////////////////////////////////////////////////////////////////////////////
 define(['three', 'jquery', './menu'], function(THREE, $, MENU) {
      class Defaults {
           static orthographicCamera(canvas) {
                return new THREE.OrthographicCamera(canvas.width() / -2, canvas.width() / 2, canvas.height() / 2, canvas.height() / -2, 10, 10000);
           }
           static perspectiveCamera(canvas) {
                return new THREE.PerspectiveCamera(45,
                     canvas.width() / canvas.height(), 1, 1000);
           }
           static basicLights() {
                var lights = new THREE.Object3D();
                var hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x00ee00, .55);
                lights.add(hemisphereLight);
                var dirLight = new THREE.DirectionalLight(0xffffff);
                dirLight.position.set(0, 200, 100).normalize();
                lights.add(dirLight);
                return lights;
           }
           static toolbarMenu(container) {
                var menu = new MENU.Menu(container);
                menu.addButton("Toggle grid", "grid-toggle", "fa-th", "Grid");
                menu.addButton("Toggle controlpolygon", "poly-toggle", "fa-low-vision", "Control polygon");
                menu.addButton("Clear scene", "clear-all", "fa-trash", "Clear");
                menu.addButton("Start Tour", "show-help", "fa-info", "Guide");
                return menu;
           }
           static playerMenu(container) {
                var menu = new MENU.Menu(container);
                menu.addButton("Previous Frame", "hph-backward", "fa-chevron-left", "");
                menu.addButton("Play", "hph-play", "fa-play", "");
                menu.addButton("Pause", "hph-pause", "fa-pause", "");
                menu.addButton("Next Frame", "hph-forward", "fa-chevron-right", "");
                return menu;
           }

      } // Class Defaults

      return {
           Defaults: Defaults
      };
 });
