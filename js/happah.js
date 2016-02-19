define([ 'jquery', 'scene', 'storyboard', 'viewport' ], function($, Scene, Storyboard, Viewport) {
     return $.extend({}, Scene, Storyboard, Viewport);
});

