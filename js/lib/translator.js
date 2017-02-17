define(['i18n-js'], function(i18n) {
     i18n.defaultLocale = "en_US";
     i18n.locale = navigator.language;
     i18n.translations = {};
     i18n.translations["en"] = require('json-loader!yaml-loader!../../html/deCasteljau/i18n/en-US.yaml');
     i18n.translations["en-US"] = i18n.translations["en"];
     i18n.translations["de"] = require('json-loader!yaml-loader!../../html/deCasteljau/i18n/de-DE.yaml');
     i18n.translations["de-DE"] = i18n.translations["de"];
     return i18n;
});
