define(['jquery', './scene', './storyboard', './viewport', './menu', './dragcontrols', './decasteljaualgorithm', './line', './scrollbar', './guide', './defaults', './colors'],
     function($, Scene, Storyboard, Viewport, Menu, DragControls, DeCasteljauAlgorithm, Line, Scrollbar, Guide, Defaults, Colors) {
          return $.extend({}, Scene, Storyboard, Viewport, Menu, DragControls, DeCasteljauAlgorithm, Line, Scrollbar, Guide, Defaults, Colors);
     });
