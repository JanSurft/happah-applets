define(['jquery', 'three', './translator'], function($, THREE, Translator) {
     var s_frames = Symbol('frames');
     var s_index = Symbol('index');

     $(".hph-description").append(Translator.t('APPLET_DESCRIPTION'));

     class Storyboard {

          constructor() {
               this[s_frames] = [];
               this[s_index] = 0;
          }

          append(frame) {
               this[s_frames].push(frame);
          }

          frame(index) {
               return this[s_frames][index];
          }

          size() {
               return this[s_frames].length;
          }

          lastFrame() {
               return this[s_frames][this.size() - 1];
          }

          firstFrame() {
               return this[s_frames][0];
          }

          get index() {
               return this[s_index];
          }
          set index(index) {
               this[s_index] = index;
          }

          currentFrame() {
               if (this[s_index] < this.size() - 1) {
                    $('#hph-forward').css("color", "#333");
               } else {
                    $('#hph-forward').css("color", "grey");
               }
               if (this[s_index] > 0) {
                    $('#hph-backward').css("color", "#333");
               } else {
                    $('#hph-backward').css("color", "grey");
               }

               return this.frame(this[s_index]);
          }

          nextFrame() {
               if (this[s_index] < this.size() - 1) {
                    this[s_index]++;
               }
               return this.currentFrame()
          }

          previousFrame() {
               if (this[s_index] > 0) {
                    this[s_index]--;
               }
               return this.currentFrame()
          }

     } //class Storyboard

     Storyboard.Frame = class {

               constructor() {
                    this.lines = [];
                    this.labels = [];
                    this.points = new THREE.Object3D();
                    this.title = "";
                    this.description = "";
               }

               clone(orig) {
                    var myCopy = new Storyboard.Frame();
                    myCopy.lines = this.lines;
                    myCopy.labels = this.labels;
                    myCopy.points = this.points.clone();
                    myCopy.title = "insert new points";
                    return myCopy;
               }

          } //class Storyboard.Frame

     return {
          Storyboard: Storyboard
     };
});
