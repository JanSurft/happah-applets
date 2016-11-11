 //////////////////////////////////////////////////////////////////////////////
 //
 // @author: Tarek Wilkening (tarek_wilkening@web.de)
 //
 //////////////////////////////////////////////////////////////////////////////
 define(['jquery', 'three'], function($, THREE) {
      const label_offset_y = 10;
      const label_color = "black";

      var s_labelCount = Symbol('labelcount');
      var s_camera = Symbol('camera');
      var s_labels = Symbol('labels');
      var s_topOffset = Symbol('topoffset');
      var s_positions = Symbol('positions');

      class LabelManager {

           constructor(camera) {
                this.update = this.update.bind(this);

                this[s_labelCount] = 0;
                this[s_camera] = camera;
                this[s_labels] = [];
                this[s_positions] = [];
           }

           listenTo(element) {
                element.addEventListener('update', this.update, false);
           }
           stopListeningTo(element) {
                element.removeEventListener('update', this.update, false);
           }

           update() {
                var canvas = $(".hph-canvas")[0];
                // The scene has changed so we need to update our
                // labels' positions
                for (var i in this[s_labels]) {
                     var projected = this[s_positions][i].clone();
                     projected.project(this[s_camera]);
                     projected.x = Math.round((projected.x + 1) * canvas.width / 2);
                     projected.y = Math.round((-projected.y + 1) * canvas.height / 2) + label_offset_y;

                     // Limit to canvas frame
                     projected.x = (projected.x > canvas.width - 20) ? canvas.width - 20 : projected.x;
                     projected.y = (projected.y > canvas.height - 20) ? canvas.height - 20 : projected.y;

                     projected.max(new THREE.Vector3(0, 0, 0));

                     this[s_labels][i].css("left", this[s_positions][i].x + "px");
                     this[s_labels][i].css("top", this[s_positions][i].y + "px");
                }
                console.log("labelmanager.update");
           }

           addLabel(text, position) {
                // Create a new container
                $("#hph-canvas-wrapper").append("<div class=label" + this[s_labelCount] + "></div>");

                // Keep reference in case position changes
                this[s_positions].push(position);

                // Get a "pointer" to our new label
                var label = $(".label" + this[s_labelCount]);
                var canvas = $(".hph-canvas")[0];

                // CSS settings
                label.css("position", "absolute");
                label.css("z-index", "100");
                label.css("color", label_color);

                // Transform world-position vector to pixel coordinates
                var pos = position.clone();
                pos.project(this[s_camera]);
                pos.x = Math.round((pos.x + 1) * canvas.width / 2);
                pos.y = Math.round((-pos.y + 1) * canvas.height / 2) + label_offset_y;

                // Limit to canvas frame
                pos.x = (pos.x > canvas.width - 20) ? canvas.width - 20 : pos.x;
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
                this[s_labels] = [];
                this[s_positions] = [];
           }


      } // Class LabelManager
      return {
           LabelManager: LabelManager
      };
 });
