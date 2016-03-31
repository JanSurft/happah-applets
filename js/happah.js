define(['jquery', 'scene', 'storyboard', 'viewport', 'menu', 'dragControls'], function($, Scene, Storyboard, Viewport, Menu, DragControls) {
     return $.extend({}, Scene, Storyboard, Viewport, Menu, DragControls);
});
