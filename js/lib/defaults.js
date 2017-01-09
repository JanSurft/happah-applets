 /////////////////////////////////////////////////////////////////////////////
 //
 // How-to guide through the website
 // Based on the example from http://trentrichardson.com
 // @url http://trentrichardson.com/Impromptu/#Examples
 // @author Tarek Wilkening (tarek_wilkening@web.de)
 //
 /////////////////////////////////////////////////////////////////////////////
 define(['three', 'jquery'], function(THREE, $) {
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

      } // Class Defaults

      return {
           Defaults: Defaults
      };
 });
