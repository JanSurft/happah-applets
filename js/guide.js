 /////////////////////////////////////////////////////////////////////////////
 //
 // How-to guide through the website
 // Based on the example from http://trentrichardson.com
 // @url http://trentrichardson.com/Impromptu/#Examples
 // @author Tarek Wilkening (tarek_wilkening@web.de)
 //
 /////////////////////////////////////////////////////////////////////////////
 define(['jquery'], function($) {
      var s_tourStates = Symbol('tourstates');
      var s_helpStates = Symbol('helpstates');

      // For debug only
      var s_text = Symbol('text');

      class Guide {
           constructor() {
                this[s_helpStates] = [{
                     title: 'Help',
                     html: '<p>Adding Control-points: doubleclick on one end of the control-polygon.</p><p>Moving control-points: you can move control-points by drag and drop.</p><p> Change division ratio by moving the scrollbar-handle in the bottom.</p><p> Zoom in or out by scrolling your mousewheel.</p>',
                     buttons: {
                          Tour: 3,
                          Ok: 2
                     },
                     focus: 1,
                     position: {},
                     submit: this.tourSubmit
                }];

                this[s_tourStates] = [{
                     title: 'Help',
                     tex2jax: {
                          inlineMath: [
                               ['$', '$'],
                               ['\\(', '\\)']
                          ]
                     },
                     //html: this[s_text],
                     html: '<p>Adding Control-points: doubleclick on one end of the control-polygon.</p><p>Moving control-points: you can move control-points by drag and drop.</p><p> Change division ratio by moving the scrollbar-handle in the bottom.</p><p> Zoom in or out by scrolling your mousewheel.</p>',
                     buttons: {
                          Tour: 1,
                          Ok: 2
                     },
                     focus: 0,
                     position: {},
                     submit: this.tourSubmit
                }, {
                     title: 'Welcome',
                     html: 'Ready to take a quick tour through editors functionality?',
                     buttons: {
                          Next: 1
                     },
                     focus: 0,
                     position: {
                          container: 'h3',
                          x: 0,
                          y: 50,
                          width: 200,
                          arrow: 'tc'
                     },
                     submit: this.tourSubmit
                }, {
                     title: 'jump to previous Frame',
                     html: 'Jump to the previous frame here.',
                     buttons: {
                          Prev: -1,
                          Next: 1
                     },
                     focus: 1,
                     position: {
                          container: '#hph-backward',
                          x: 0,
                          y: 35,
                          width: 300,
                          arrow: 'tl'
                     },
                     submit: this.tourSubmit
                }, {
                     title: "Play/Pause animation",
                     html: 'Start/Stop animating over frames.',
                     buttons: {
                          Prev: -1,
                          Next: 1
                     },
                     focus: 1,
                     position: {
                          container: '#hph-play',
                          x: 0,
                          y: 35,
                          width: 200,
                          arrow: 'tl'
                     },
                     submit: this.tourSubmit
                }, {
                     title: 'Jump to next Frame',
                     html: 'Jumpt to the next frame.',
                     buttons: {
                          Prev: -1,
                          Next: 1
                     },
                     focus: 1,
                     position: {
                          container: '#hph-forward',
                          x: 0,
                          y: 35,
                          width: 200,
                          arrow: 'tl'
                     },
                     submit: this.tourSubmit
                }, {
                     title: 'Title of current frame',
                     html: 'The title of the current frame can be seen here.',
                     buttons: {
                          Prev: -1,
                          Next: 1
                     },
                     focus: 1,
                     position: {
                          container: '#hph-label',
                          x: 100,
                          y: -10,
                          width: 200,
                          arrow: 'lt'
                     },
                     submit: this.tourSubmit
                }, {
                     title: 'Toggle the grid',
                     html: 'The grid can be turned on/off by pressing this button.',
                     buttons: {
                          Prev: -1,
                          Next: 1
                     },
                     focus: 1,
                     position: {
                          container: '#grid-toggle',
                          x: 0,
                          y: 35,
                          width: 200,
                          arrow: 'tl'
                     },
                     submit: this.tourSubmit
                }, {
                     title: 'Toggle control-polygon',
                     html: 'Show/hide the control-/points and -polygon.',
                     buttons: {
                          Prev: -1,
                          Next: 1
                     },
                     focus: 1,
                     position: {
                          container: '#poly-toggle',
                          x: 0,
                          y: 35,
                          width: 200,
                          arrow: 'tl'
                     },
                     submit: this.tourSubmit
                }, {
                     title: 'Toggle curve',
                     html: 'Show/hide limes-curve.',
                     buttons: {
                          Prev: -1,
                          Next: 1
                     },
                     focus: 1,
                     position: {
                          container: '#poly-toggle',
                          x: 60,
                          y: 35,
                          width: 200,
                          arrow: 'tc'
                     },
                     submit: this.tourSubmit
                }, {
                     title: 'Clear scene',
                     html: 'Removes everything from the scene and enters add-mode. Add new control-points by clicking into the scene!',
                     buttons: {
                          Done: 2
                     },
                     focus: 1,
                     position: {
                          container: '#clear-all',
                          x: -125,
                          y: 35,
                          width: 200,
                          arrow: 'tr'
                     },
                     submit: this.tourSubmit
                }];
                console.log(this[s_tourStates]);
           }

           tourStart() {
                $.prompt(this[s_tourStates]);
           }

           showHelp() {
                $.prompt(this[s_tourStates]);
           }

           tourSubmit(e, v, m, f) {
                if (v === -1) {
                     $.prompt.prevState();
                     return false;
                } else if (v === 1) {
                     $.prompt.nextState();
                     return false;
                } else if (v === 3) {
                     console.log($.prompt.states);
                     $.prompt(this[s_tourStates]);
                     return true;
                }
           }

      } // Class Guide

      return {
           Guide: Guide
      };
 });
