define(['jquery', './scene', './storyboard', './viewport', './menu', './dragcontrols', './trackballcontrols', './decasteljaualgorithm', './line', './addcontrols', './scrollbar', './guide', './defaults'],
     function($, Scene, Storyboard, Viewport, Menu, DragControls, TrackballControls, DeCasteljauAlgorithm, Line, AddControls, Scrollbar, Guide, Defaults) {
          return $.extend({}, Scene, Storyboard, Viewport, Menu, DragControls, TrackballControls, DeCasteljauAlgorithm, Line, AddControls, Scrollbar, Guide, Defaults);
     });
