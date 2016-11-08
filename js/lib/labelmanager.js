 //////////////////////////////////////////////////////////////////////////////
 //
 // @author: Tarek Wilkening (tarek_wilkening@web.de)
 //
 //////////////////////////////////////////////////////////////////////////////
 define(['jquery', 'three'], function($, THREE) {
      var s_labelCount = Symbol('labelcount');
      var s_camera = Symbol('camera');
      var s_labels = Symbol('labels');

      class LabelManager {

           constructor(camera) {
                this[s_labelCount] = 0;
                this[s_camera] = camera;
                this[s_labels] = [];
           }

           addLabel(text, position) {
                // Create a new container
                $("#hph-canvas-wrapper").append("<div class=label" + this[s_labelCount] + "></div>");

                // Get a "pointer" to our new label
                var label = $(".label" + this[s_labelCount]);
                var canvas = $(".hph-canvas")[0];

                // CSS settings
                label.css("position", "absolute");
                label.css("z-index", "100");
                label.css("color", "gold");

                // Transform world-position vector to pixel coordinates
                var pos = position.clone();
                pos.project(this[s_camera]);
                pos.x = Math.round((pos.x + 1) * canvas.width / 2);
                pos.y = Math.round((-pos.y + 1) * canvas.height / 2);

                // Limit to canvas frame
                pos.x = (pos.x > canvas.width) ? canvas.width : pos.x;
                pos.y = (pos.y > canvas.height - 20) ? canvas.height - 20 : pos.y;

                pos.max(new THREE.Vector3(0, 0, 0));

                label.css("left", pos.x + "px");
                label.css("top", pos.y + "px");

                // Add text to the label
                label.append(text);

                this[s_labelCount]++;
                this[s_labels].push(label);
                //return label;
           }

           removeLabels() {
                for (var i in this[s_labels]) {
                     this[s_labels][i].remove();
                }
                // Reset counter
                this[s_labelCount] = 0;
           }


      } // Class LabelManager
      return {
           LabelManager: LabelManager
      };
 });
