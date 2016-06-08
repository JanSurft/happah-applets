define(['jquery', 'translator'], function($, Translator) {
     //var s_algorithm = Symbol('algorithm');
     var s_frames = Symbol('frames');

     console.log(Translator.t('hello'));

     class Storyboard {

          constructor() {
               //this[s_algorithm] = algorithm;
               this[s_frames] = [];
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
                    this.points = [];
                    this.title = "";
                    this.description = "";
                    this.showCurve = true;
                    // TODO: showpoly shall work, need button though
               }

          } //class Storyboard.Frame

     return {
          Storyboard: Storyboard
     };
});
