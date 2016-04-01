define(['jquery', 'scene', 'storyboard', 'viewport', 'menu', 'dragcontrols'], function($, Scene, Storyboard, Viewport, Menu, DragControls) {
    return $.extend({}, Scene, Storyboard, Viewport, Menu, DragControls);
});
