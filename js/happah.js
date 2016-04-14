define(['jquery', 'scene', 'storyboard', 'viewport', 'menu', 'dragcontrols', 'trackballcontrols', 'curve', 'ray'],
    function($, Scene, Storyboard, Viewport, Menu, DragControls, TrackballControls, Curve, Ray) {
        return $.extend({}, Scene, Storyboard, Viewport, Menu, DragControls, TrackballControls, Curve, Ray);
    });
