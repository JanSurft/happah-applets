define(['jquery', './scene', './storyboard', './viewport', './menu', './dragcontrols', './decasteljaualgorithm', './line', './scrollbar', './guide', './defaults', './colors', './spherical-impostor', './util'],
     function($, Scene, Storyboard, Viewport, Menu, DragControls, DeCasteljauAlgorithm, Line, Scrollbar, Guide, Defaults, Colors, SphericalImpostor, Util) {
          return $.extend({}, Scene, Storyboard, Viewport, Menu, DragControls, DeCasteljauAlgorithm, Line, Scrollbar, Guide, Defaults, Colors, SphericalImpostor, Util);
     });
