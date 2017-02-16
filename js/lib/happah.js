define(['jquery', './scene', './storyboard', './viewport', './menu', './dragcontrols', './trackballcontrols', './decasteljaualgorithm', './line', './scrollbar', './guide', './defaults', './colors'],
     function($, Scene, Storyboard, Viewport, Menu, DragControls, TrackballControls, DeCasteljauAlgorithm, Line, Scrollbar, Guide, Defaults, Colors) {
          return $.extend({}, Scene, Storyboard, Viewport, Menu, DragControls, TrackballControls, DeCasteljauAlgorithm, Line, Scrollbar, Guide, Defaults, Colors);
     });
