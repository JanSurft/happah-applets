define(['jquery', './scene', './storyboard', './viewport', './menu', './dragcontrols', './trackballcontrols', './curve', './line', './addcontrols', './scrollbar', './guide', './defaults'],
     function($, Scene, Storyboard, Viewport, Menu, DragControls, TrackballControls, Curve, Line, AddControls, Scrollbar, Guide, Defaults) {
          return $.extend({}, Scene, Storyboard, Viewport, Menu, DragControls, TrackballControls, Curve, Line, AddControls, Scrollbar, Guide, Defaults);
     });
