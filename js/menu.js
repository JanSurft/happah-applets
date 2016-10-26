////////////////////////////////////////////////////////////////////////////
//
// Interface
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', 'guide'], function($, THREE, guide) {
     var s_scene = Symbol('scene');
     var s_viewport = Symbol('viewport');
     var s_gridEnabled = Symbol('gridenabled');
     //var s_addModeEnabled = Symbol('addmodeenabled');
     var s_showControlPoly = Symbol('showcontrolpoly');
     var s_showCurve = Symbol('showcurve');
     var s_content = Symbol('content');
     var s_sequence = Symbol('sequence');

     class Menu {
          constructor(selector, scene, viewport) {
               this[s_content] = $(selector);
               this[s_scene] = scene;
               this[s_viewport] = viewport;
               this[s_gridEnabled] = false;
               // this[s_addModeEnabled] = false;
               this[s_showControlPoly] = true;
               this[s_viewport].gridState = false;
               this[s_sequence] = false;
               this[s_showCurve] = false;
               //$('#grid-toggle').addClass('active');
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
               }, this.play);
               this[s_content].find("#hph-pause").on('click', {
                    _this: this
               }, this.pause);
               this[s_content].find("#show-help").on('click', {
                    _this: this
               }, this.help);
               this[s_content].find("#curve-toggle").on('click', {
                    _this: this
               }, this.toggleCurve);
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
               event.data._this[s_viewport].polyState = state;
          }

          next(event) {
               event.data._this[s_viewport].nextFrame();
          }

          previous(event) {
               event.data._this[s_viewport].previousFrame();
          }

          play(event) {
               // Switch visibility of play/pause button
               $('#hph-pause').show();
               $('#hph-play').hide();

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
          help(event) {
               var tourPrompt = new guide.Guide();
               tourPrompt.showHelp();
          }
          toggleCurve(event) {
               var state = !event.data._this[s_showCurve];
               event.data._this[s_showCurve] = state;

               if (state) {
                    $('#curve-toggle').addClass('active');
               } else {
                    $('#curve-toggle').removeClass('active');
               }
               event.data._this[s_viewport].curveState = state;
          }

     } // Class Menu

     return {
          Menu: Menu
     };

});
