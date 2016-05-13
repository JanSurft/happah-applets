define(['jquery', 'scene', 'storyboard', 'viewport', 'menu', 'dragcontrols', 'trackballcontrols', 'curve', 'ray', 'addcontrols', 'scrollbar'],
     function($, Scene, Storyboard, Viewport, Menu, DragControls, TrackballControls, Curve, Ray, AddControls, Scrollbar) {
          return $.extend({}, Scene, Storyboard, Viewport, Menu, DragControls, TrackballControls, Curve, Ray, AddControls, Scrollbar);
     });
