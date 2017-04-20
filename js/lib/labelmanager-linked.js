 //////////////////////////////////////////////////////////////////////////////
 //
 // @author: Tarek Wilkening (tarek_wilkening@web.de)
 //
 //////////////////////////////////////////////////////////////////////////////
 define(['jquery', 'three'], function($, THREE) {
      //const label_offset_y = 10;
      const label_color = "black";
      const label_font_size = "14pt";

      var s_head = Symbol('head');
      var s_tail = Symbol('tail');
      var s_viewport = Symbol('viewport');

      // TODO: add sentinel object to prevent assertions
      class LabelManager {

           constructor(viewport) {
                this.addLabel = this.addLabel.bind(this);
                this.updatePositions = this.updatePositions.bind(this);

                $(document).on("dragging", this.updatePositions);

                this.sceneCamera = viewport.camera;
                this.overlayCamera = viewport.overlayCam;
                this[s_viewport] = viewport;
                this[s_head] = null;
                this.canvas = viewport.canvas;

           }

           /**
            * Add a new label at the given position.
            * If overview = true, the label will be projected by the overlay
            * camera
            */
           addLabel(text, position, tag = "", overlay = false) {
                var label = null;
                if (!this[s_head]) {
                     this[s_head] = new Label(text, position, tag, overlay, null, this[s_viewport]);
                     this[s_tail] = this[s_head];
                } else {
                     label = new Label(text, position, tag, overlay, null, this[s_viewport]);
                     this[s_tail].next = label
                     this[s_tail] = label;
                }
           }

           /**
            * Remove all labels with matching tag
            */
           removeLabelsByTag(tag) {
                var iterator = this[s_head];
                var flag = false;
                if (!iterator) {
                     return flag;
                }
                if (iterator.tag == tag) {
                     this.removeLabel(iterator);
                     return true;
                }
                var i = 0;
                while (iterator.next) {
                     // Head has already been checked
                     iterator = iterator.next;
                     if (iterator.tag == tag) {
                          this.removeLabel(iterator);
                          flag = true;
                     }
                }
                return flag;
           }

           // TODO: removeAfter() to prevent iterating
           removeLabel(label) {
                // Remove div
                label.remove();

                if (!this[s_head]) {
                     return;
                }

                if (label == this[s_head]) {
                     this[s_head] = null;
                } else {
                     var iterator = this[s_head];
                     while (iterator.next) {
                          if (iterator.next == label) {
                               // Cut it out
                               iterator.next = label.next;

                               // Update tail pointer if necessary
                               if (label == this[s_tail]) {
                                    this[s_tail] = iterator;
                               }
                               return;
                          }
                          iterator = iterator.next;
                     }
                }
           }

           /**
            * Recalculates the projection from the position vector
            * that was given when added
            */
           updatePositions() {
                console.log("update positions triggered!");
                var iterator = this[s_head];
                if (!iterator) {
                     return;
                } else if (!iterator.next) {
                     iterator.updatePosition();
                     return;
                }
                while (iterator.next) {
                     iterator.updatePosition();
                     iterator = iterator.next;
                }
           }

      } // Class LabelManager

      var s_next = Symbol('next');
      var s_htmlObject = Symbol('htmlobject');
      var s_tag = Symbol('tag');
      var s_position = Symbol('position');
      var s_sceneCamera = Symbol('scenecamera');
      var s_overlayCamera = Symbol('overlaycamera');

      class Label {

           constructor(text, position, tag = "", overlay = false, next, viewport) {
                this[s_position] = position;
                this[s_next] = next;
                this[s_tag] = tag;
                this[s_overlayCamera] = viewport.overlayCam;
                this[s_sceneCamera] = viewport.camera;
                this.canvas = viewport.canvas;
                this.viewport = viewport;

                // Create a new container
                $("#hph-canvas-wrapper").append("<div class=" + "label" + tag + "></div>");

                // Get a "pointer" to our new label
                this[s_htmlObject] = $(".label" + tag);

                // CSS settings
                this[s_htmlObject].css("position", "absolute");
                this[s_htmlObject].css("z-index", "100");
                this[s_htmlObject].css("color", label_color);
                this[s_htmlObject].css("font-size", label_font_size);

                // Transform world-position vector to pixel coordinates
                var pos = position.clone();

                if (overlay) {
                     pos.project(this[s_overlayCamera]);
                     this[s_htmlObject].addClass('overlay');
                } else {
                     pos.project(this[s_sceneCamera]);
                }
                //pos.project(this[s_overlayCamera]);

                pos.x = Math.round((pos.x + 1) * this.canvas.width / 2);
                pos.y = Math.round((-pos.y + 1) * this.canvas.height / 2);

                // Limit to canvas frame
                pos.x = (pos.x > this.canvas.width - 20) ? this.canvas.width - 20 : pos.x;
                pos.y = (pos.y > this.canvas.height - 20) ? this.canvas.height - 20 : pos.y;

                pos.max(new THREE.Vector3(0, 0, 0));

                this[s_htmlObject].css("left", pos.x + "px");
                this[s_htmlObject].css("top", pos.y + "px");

                // Add text to the label
                this[s_htmlObject].append(text);
           }
           updatePosition() {
                //if (this[s_htmlObject].hasClass("overlay")) {
                //return;
                //}
                var pos = this[s_position].clone();

                if (this[s_htmlObject].hasClass("overlay")) {
                     pos.project(this[s_overlayCamera]);
                } else {
                     pos.project(this[s_sceneCamera]);
                }

                pos.x = Math.round((pos.x + 1) * this.canvas.width / 2);
                pos.y = Math.round((-pos.y + 1) * this.canvas.height / 2);

                // Limit to canvas frame
                pos.x = (pos.x > this.canvas.width - 20) ? this.canvas.width - 20 : pos.x;
                pos.y = (pos.y > this.canvas.height - 20) ? this.canvas.height - 20 : pos.y;

                pos.max(new THREE.Vector3(0, 0, 0));

                this[s_htmlObject].css("left", pos.x + "px");
                this[s_htmlObject].css("top", pos.y + "px");
           }
           remove() {
                this[s_htmlObject].remove();
           }

           set next(next) {
                this[s_next] = next;
           }
           get next() {
                return this[s_next];
           }
           get tag() {
                return this[s_tag];
           }

      } // class Label

      return {
           LabelManager: LabelManager
      };
 });
