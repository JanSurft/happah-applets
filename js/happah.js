define(['jquery', 'scene', 'storyboard', 'viewport', 'menu', 'dragcontrols', 'trackballcontrols', 'curve'],
     function($, Scene, Storyboard, Viewport, Menu, DragControls, TrackballControls, Curve) {
          return $.extend({}, Scene, Storyboard, Viewport, Menu, DragControls, TrackballControls, Curve);
     });
