define(['jquery', 'translator'], function($, Translator) {
     var s_frames = Symbol('frames');

     console.log(Translator.t('hello'));

     class Storyboard {

          constructor() {
               this[s_frames] = [];
          }

          append(frame) {
               this[s_frames].push(frame);
          }

     } //class Storyboard

     Storyboard.Frame = class {

          } //class Storyboard.Frame

     return {
          Storyboard: Storyboard
     };
});
