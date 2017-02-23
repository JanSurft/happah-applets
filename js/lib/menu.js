////////////////////////////////////////////////////////////////////////////
//
// Menu class
// Offers methods to dynamically add buttons to a certain HTML-container.
//
// @author Tarek Wilkening (tarek_wilkening@web.de)
//
//////////////////////////////////////////////////////////////////////////////
define(['jquery', 'three', './guide'], function($, THREE, guide) {
     var s_container = Symbol('container');

     class Menu {
          constructor(container) {
               this[s_container] = container;
               $(this[s_container]).find("#grid-toggle").on('click', {
                    _this: this
               }, this.addButton);
          }

          /**
           * Add a new button to the container specified in the constructor.
           * The title is also used as event type, so your eventListener
           * should listen for the title of that button.
           */
          addButton(title, id, icon, label) {
               var button = document.createElement('a');
               button.href = "#";
               button.className = "btn btn-default fa " + icon;
               button.title = title;
               button.id = id;
               button.innerHTML = " " + label;
               $(this[s_container]).append(button);
               $('#' + button.id).on('click', function() {
                    $.event.trigger({
                         type: title
                    });
               });
               return button;
          }

     } // Class Menu

     return {
          Menu: Menu
     };

});
