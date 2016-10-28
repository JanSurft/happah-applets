define(['jquery', 'translator'], function($, Translator) {
     var s_algorithm = Symbol('algorithm');
     var s_frames = Symbol('frames');
     var s_currentFrame = Symbol('currentframe');

     console.log(Translator.t('hello'));

     class Storyboard {

          constructor(algorithm) {
               this[s_algorithm] = algorithm;
               this[s_frames] = [];
               this[s_currentFrame] = 0;
          }

          // TODO: this needs actual implementation
          rebuild() {
               var storyboard = this[s_algorithm].storyboard();
               this[s_frames] = [];
               for (var i = 0; i < storyboard.size(); i++) {
                    this[s_frames].push(storyboard.frame(i));
               }
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

          currentFrame() {
               if (this[s_currentFrame] < this.size() - 1) {
                    $('#hph-forward').css("color", "#333");
               } else {
                    $('#hph-forward').css("color", "grey");
               }
               if (this[s_currentFrame] > 0) {
                    $('#hph-backward').css("color", "#333");
               } else {
                    $('#hph-backward').css("color", "grey");
               }

               return this.frame(this[s_currentFrame]);
          }

          nextFrame() {
               if (this[s_currentFrame] < this.size() - 1) {
                    this[s_currentFrame]++;
               }
               return this.currentFrame()
          }

          previousFrame() {
               if (this[s_currentFrame] > 0) {
                    this[s_currentFrame]--;
               }
               return this.currentFrame()
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
