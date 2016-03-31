define(['jquery', 'scene', 'storyboard', 'viewport', 'menu'], function($, Scene, Storyboard, Viewport, Menu) {
     return $.extend({}, Scene, Storyboard, Viewport, Menu);
});
