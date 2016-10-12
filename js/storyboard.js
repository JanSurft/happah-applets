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
