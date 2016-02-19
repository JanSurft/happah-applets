define([ 'jquery' ], function($) {
     var s_frames = Symbol('frames');

     class Storyboard {

     constructor() {
          this[s_frames] = [];
     }

     append(frame) {
          this[s_frames].push(frame);
     }

     }//class Storyboard

     Storyboard.Frame = class {

     }//class Storyboard.Frame

     return { Storyboard: Storyboard };
});

