define([ 'jquery', './dictionary!', 'i18n' ], function($, dictionary, i18n) {
     //TODO: make sure dictionary and i18n are loaded exactly once to avoid multiple ajax requests for data
     i18n.locale = navigator.language;
     i18n.translations[navigator.language] = dictionary;
     return i18n;
});

