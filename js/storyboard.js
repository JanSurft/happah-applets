define(['jquery', 'translator'], function($, Translator) {
     var s_algorithm = Symbol('algorithm');
     var s_frames = Symbol('frames');

     console.log(Translator.t('hello'));

     class Storyboard {

          constructor(algorithm) {
               this[s_algorithm] = algorithm;
               this[s_frames] = [];
               this.update = this.update.bind(this);
          }

          append(frame) {
               this[s_frames].push(frame);
          }

          get frame() {
               return this[s_frames];
          }

          /**
           * Update the position of each point without the need to spawn new
           * impostors
           */
          update(ratio) {
               var _this = this;
               // Evaluate all points
               // frame0 = controlPolygon
               for (var i = 1; i < this[s_frames].length; i++) {
                    var pointMatrix = new Array();
                    // TODO: put this out of loop
                    for (var k = 1; k < i; k++) {
                         this[s_algorithm].evaluate(ratio, function add(points) {
                              pointMatrix.push(points);
                         });
                    }
                    // update the position for every impostor in every frame
                    for (var k in pointMatrix[i])
                         this[s_frames][i].points[k].position.copy(pointMatrix[k][j]);

                    // Update meshes as well
                    // But use mesh.update or something similar to avoid new.

               }
          }

     } //class Storyboard

     Storyboard.Frame = class {

               constructor() {
                    this.meshes = [];
                    this.mesh;
                    this.points = [];
                    this.title = "";
                    this.description = "";
                    this.show = false;
               }

          } //class Storyboard.Frame

     return {
          Storyboard: Storyboard
     };
});
