//////////////////////////////////////////////////////////////////////////////
//
// Interface
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three'], function($, THREE) {
    var s_scene = Symbol('scene');
    var s_viewport = Symbol('viewport');
    var s_gridEnabled = Symbol('gridenabled');
    //var s_addModeEnabled = Symbol('addmodeenabled');
    var s_showControlPoly = Symbol('showcontrolpoly');
    var s_content = Symbol('content');
    var s_sequence = Symbol('sequence');

    class Menu {
        constructor(selector, scene, viewport) {
            this[s_content] = $(selector);
            this[s_scene] = scene;
            this[s_viewport] = viewport;
            this[s_gridEnabled] = true;
            // this[s_addModeEnabled] = false;
            this[s_showControlPoly] = true;
            this[s_viewport].gridState = true;
            this[s_sequence] = false;
            $('#grid-toggle').addClass('active');
            $('#hph-pause').hide();

            this[s_content].find("#grid-toggle").on('click', {
                _this: this
            }, this.toggleGrid);
            this[s_content].find("#addmode-toggle").on('click', {
                _this: this
            }, this.toggleAddMode);
            this[s_content].find("#poly-toggle").on('click', {
                _this: this
            }, this.toggleControlPolygon);
            this[s_content].find("#clear-all").on('click', {
                _this: this
            }, this.clearControlPoints);
            this[s_content].find("#hph-forward").on('click', {
                _this: this
            }, this.next);
            this[s_content].find("#hph-backward").on('click', {
                _this: this
            }, this.previous);
            this[s_content].find("#hph-play").on('click', {
                _this: this
            }, this.current);
            this[s_content].find("#hph-pause").on('click', {
                _this: this
            }, this.pause);
        }

        toggleGrid(event) {
            event.data._this[s_gridEnabled] = !event.data._this[s_gridEnabled];

            if (event.data._this[s_gridEnabled]) {
                $('#grid-toggle').addClass('active');
            } else {
                $('#grid-toggle').removeClass('active');
            }
            event.data._this[s_viewport].gridState = event.data._this[s_gridEnabled];
        }

        toggleControlPolygon(event) {
            var state = !event.data._this[s_showControlPoly];
            event.data._this[s_showControlPoly] = state;

            if (state) {
                $('#poly-toggle').addClass('active');
            } else {
                $('#poly-toggle').removeClass('active');
            }
            // TBD: the state should be handles by the storyboard
            event.data._this[s_scene].controlPolygonState = state;
        }

        next(event) {
            event.data._this[s_viewport].nextFrame();
        }

        previous(event) {
            event.data._this[s_viewport].previousFrame();
        }

        current(event) {
            // Switch visibility of play/pause button
            $('#hph-pause').show();
            $('#hph-play').hide();

            //event.data._this[s_viewport].currentFrame();
            event.data._this[s_viewport].sequence = true;
        }

        pause(event) {
            // Switch visibility of play/pause button
            $('#hph-play').show();
            $('#hph-pause').hide();

            event.data._this[s_viewport].sequence = false;
        }

        clearControlPoints(event) {
            //event.data._this[s_scene].removeControlPoints();
            event.data._this[s_viewport].clearScene();
        }

    } // Class Menu

    return {
        Menu: Menu
    };

});
