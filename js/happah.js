define(['jquery', 'scene', 'storyboard', 'viewport', 'menu', 'curve'], function($, Scene, Storyboard, Viewport, Menu, Curve) {
     return $.extend({}, Scene, Storyboard, Viewport, Menu, Curve);
});
