define(['jquery', 'translator'], function($, Translator) {
     var s_algorithm = Symbol('algorithm');
     var s_frames = Symbol('frames');

     console.log(Translator.t('hello'));

     class Storyboard {

          constructor(algorithm) {
               this[s_algorithm] = algorithm;
               this[s_frames] = [];
          }

          append(frame) {
               this[s_frames].push(frame);
          }

     } //class Storyboard

     Storyboard.Frame = class {

               constructor() {
                    this.segmentStrips = [];
                    this.points = [];
                    this.title = "";
                    this.description = "";
               }

          } //class Storyboard.Frame

     return {
          Storyboard: Storyboard
     };
});
