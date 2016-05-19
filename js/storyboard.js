define(['jquery', 'translator'], function($, Translator) {
     //var s_algorithm = Symbol('algorithm');
     var s_frames = Symbol('frames');

     console.log(Translator.t('description'));

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
          get geometries() {
               return this[s_geometries];
          }

     } //class Storyboard

     Storyboard.Frame = class {

               constructor() {
                    this.geometries = [];
                    this.geometries[0] = [];
                    this.points = [];
                    this.title = "";
                    this.description = "";
                    this.showCurve = true;
               }

          } //class Storyboard.Frame

     return {
          Storyboard: Storyboard
     };
});
