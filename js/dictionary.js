define(['jquery'], function() {
    return {
        load: function(name, req, onload, config) {
            $.ajaxSetup({
                beforeSend: function(xhr) {
                    if (xhr.overrideMimeType) xhr.overrideMimeType("application/json");
                }
            });
            $.getJSON("build/i18n/" + navigator.language + ".json", onload);
        }
    };
});
