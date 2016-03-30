define(['jquery', 'scene', 'storyboard', 'viewport', 'interface'], function($, Scene, Storyboard, Viewport, Interface) {
     return $.extend({}, Scene, Storyboard, Viewport, Interface);
});
