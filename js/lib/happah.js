define(['jquery', './scene', './storyboard', './viewport', './menu', './dragcontrols', './trackballcontrols', './decasteljaualgorithm', './line', './addcontrols', './scrollbar', './guide', './defaults', './colors'],
     function($, Scene, Storyboard, Viewport, Menu, DragControls, TrackballControls, DeCasteljauAlgorithm, Line, AddControls, Scrollbar, Guide, Defaults, Colors) {
          return $.extend({}, Scene, Storyboard, Viewport, Menu, DragControls, TrackballControls, DeCasteljauAlgorithm, Line, AddControls, Scrollbar, Guide, Defaults, Colors);
     });
