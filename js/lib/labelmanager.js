 //////////////////////////////////////////////////////////////////////////////
 //
 // @author: Tarek Wilkening (tarek_wilkening@web.de)
 //
 //////////////////////////////////////////////////////////////////////////////
 define(['jquery', 'three'], function($, THREE) {
      //const label_offset_y = 10;
      const label_color = "black";
      const label_font_size = "150%";

      var s_labelCount = Symbol('labelcount');
      var s_sceneCamera = Symbol('scenecamera');
      var s_overlayCamera = Symbol('overlaycamera');
      var s_labels = Symbol('labels');
      var s_positions = Symbol('positions');

      class LabelManager {

           constructor(sceneCamera, overlayCamera) {
                this[s_labelCount] = 0;
                this[s_sceneCamera] = sceneCamera;
                this[s_overlayCamera] = overlayCamera;
                this[s_labels] = [];
                this[s_positions] = [];
           }

           listenTo(element) {
                element.addEventListener('update', this.update, false);
           }
           stopListeningTo(element) {
                element.removeEventListener('update', this.update, false);
           }

           /**
            * Add a new label at the given position.
            * If overview = true, the label will be projected by the overlay
            * camera
            */
           addLabel(text, position, tag = "", overlay = false) {
                // Create a new container
                $("#hph-canvas-wrapper").append("<div class=" + "label" + tag + this[s_labelCount] + "></div>");

                // Keep reference in case position changes
                this[s_positions].push(position);

                // Get a "pointer" to our new label
                var label = $(".label" + tag + this[s_labelCount]);
                var canvas = $(".hph-canvas")[0];

                // CSS settings
                label.css("position", "absolute");
                label.css("z-index", "100");
                label.css("color", label_color);
                label.css("font-size", label_font_size);

                // Transform world-position vector to pixel coordinates
                var pos = position.clone();

                if (overlay) {
                     pos.project(this[s_overlayCamera]);
                } else {
                     pos.project(this[s_sceneCamera]);
                }
                pos.x = Math.round((pos.x + 1) * canvas.width / 2);
                pos.y = Math.round((-pos.y + 1) * canvas.height / 2);

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

           /**
            * Recalculates the projection from the position vector
            * that was given when added
            */
           updatePositions() {
                var canvas = $(".hph-canvas")[0];

                for (var i in this[s_labels]) {
                     // Project position to screen
                     var pos = this[s_positions][i].clone();

                     // Overlay does never change so only treat scene labels
                     pos.project(this[s_sceneCamera]);

                     pos.x = Math.round((pos.x + 1) * canvas.width / 2);
                     pos.y = Math.round((-pos.y + 1) * canvas.height / 2);

                     // Limit to canvas
                     pos.x = (pos.x > canvas.width - 20) ? canvas.width - 20 : pos.x;
                     pos.y = (pos.y > canvas.height - 20) ? canvas.height - 20 : pos.y;

                     pos.max(new THREE.Vector3(0, 0, 0));

                     this[s_labels][i].css("left", pos.x + "px");
                     this[s_labels][i].css("top", pos.y + "px");
                }
           }

           /**
            * Remove all labels with matching tag
            */
           removeLabels(tag) {
                if (tag == null) {
                     for (var i in this[s_labels]) {
                          this[s_labels][i].remove();
                     }
                } else {
                     for (var i in this[s_labels]) {
                          if (this[s_labels][i].selector.includes(tag)) {
                               this[s_labels][i].remove();
                          }
                     }
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
