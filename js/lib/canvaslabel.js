 //////////////////////////////////////////////////////////////////////////////
 //
 //
 //
 //////////////////////////////////////////////////////////////////////////////
 define(['jquery', 'three'], function($, THREE) {
      var s_element = Symbol('element');

      class CanvasLabel {

           constructor() {
                // Create new container
                $("#hph-canvas-wrapper").append("<div class=label></div>");

                this[s_element] = $(".label");

                // make position independent from parent
                this[s_element].css("position", "absolute");
                this[s_element].css("z-index", "100");
                this[s_element].css("color", "black");
                //this[s_element].css("left", "100px");
           }

           addText(string) {
                this[s_element].append(string);
           }

           setPosition(position, camera) {
                // Transform world-position vector to pixel coordinates
                var canvas = $('.hph-canvas');
                var pos = position.clone();
                pos.unproject(camera);
                pos.x = Math.round((pos.x + 1) * canvas.width / 2);
                pos.y = Math.round((-pos.y + 1) * canvas.height / 2);

                this[s_element].css("left", pos.x + "px");
                this[s_element].css("top", pos.y + "px");
           }


      } // Clas CanvasLabel

      return {
           CanvasLabel: CanvasLabel
      };
 });
