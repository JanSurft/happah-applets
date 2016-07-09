define(['jquery', 'scene', 'storyboard', 'viewport', 'menu', 'dragcontrols', 'trackballcontrols', 'curve', 'ray', 'addcontrols', 'scrollbar', 'guide'],
    function($, Scene, Storyboard, Viewport, Menu, DragControls, TrackballControls, Curve, Ray, AddControls, Scrollbar, Guide) {
        return $.extend({}, Scene, Storyboard, Viewport, Menu, DragControls, TrackballControls, Curve, Ray, AddControls, Scrollbar, Guide);
    });
