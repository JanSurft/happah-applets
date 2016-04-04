define(['jquery', 'scene', 'storyboard', 'viewport', 'menu', 'dragcontrols', 'trackballcontrols'], function($, Scene, Storyboard, Viewport, Menu, DragControls, TrackballControls) {
     return $.extend({}, Scene, Storyboard, Viewport, Menu, DragControls, TrackballControls);
});
