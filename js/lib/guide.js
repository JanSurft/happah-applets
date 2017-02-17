 /////////////////////////////////////////////////////////////////////////////
 //
 // How-to guide through the website
 // Based on the example from http://trentrichardson.com
 // @url http://trentrichardson.com/Impromptu/#Examples
 // @author Tarek Wilkening (tarek_wilkening@web.de)
 //
 /////////////////////////////////////////////////////////////////////////////
 define(['jquery', './translator'], function($, Translator) {

      var s_tourStates = Symbol('tourstates');
      var s_helpStates = Symbol('helpstates');

      // For debug only
      var s_text = Symbol('text');

      class Guide {
           constructor() {
                this[s_tourStates] = [{
                     title: Translator.t('HELP_TITLE'),
                     tex2jax: {
                          inlineMath: [
                               ['$', '$'],
                               ['\\(', '\\)']
                          ]
                     },
                     html: Translator.t("HELP_OVERVIEW"),
                     buttons: {
                          Tour: 1,
                          Ok: 2
                     },
                     focus: 0,
                     position: {},
                     submit: this.tourSubmit
                }, {
                     title: Translator.t("TOUR_TITLE"),
                     html: Translator.t("TOUR_READY"),
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
                     title: Translator.t("TOUR_PREV_FRAME_TITLE"),
                     html: Translator.t("TOUR_PREV_FRAME_TEXT"),
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
                     title: Translator.t("TOUR_PLAY_PAUSE_TITLE"),
                     html: Translator.t("TOUR_PLAY_PAUSE_TEXT"),
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
                     title: Translator.t("TOUR_NEXT_FRAME_TITLE"),
                     html: Translator.t("TOUR_NEXT_FRAME_TEXT"),
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
                     title: Translator.t("TOUR_CURR_FRAME_TITLE"),
                     html: Translator.t("TOUR_CURR_FRAME_TEXT"),
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
                     title: Translator.t("TOUR_GRID_TITLE"),
                     html: Translator.t("TOUR_GRID_TEXT"),
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
                     title: Translator.t("TOUR_POLYGON_TITLE"),
                     html: Translator.t("TOUR_POLYGON_TEXT"),
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
                     title: Translator.t("TOUR_CURVE_TITLE"),
                     html: Translator.t("TOUR_CURVE_TEXT"),
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
                     title: Translator.t("TOUR_CLEAR_TITLE"),
                     html: Translator.t("TOUR_CLEAR_TEXT"),
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
                     $.prompt(this[s_tourStates]);
                     return true;
                }
           }

      } // Class Guide

      return {
           Guide: Guide
      };
 });
