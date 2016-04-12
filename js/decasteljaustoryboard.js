//////////////////////////////////////////////////////////////////////////////
//
// @author: Stephan Engelmann (stephan-engelmann@gmx.de)
//
//////////////////////////////////////////////////////////////////////////////

define(['three'], function(THREE) {

     function deCasteljauStoryboard() {
          var storyboard = new happah.Storyboard();

          // add frames here
          var frame1 = new happah.Storyboad.Frame();
          frame1.showCurve = true;
          storyboard.append(frame1);

          return storyboard;
     }

});
