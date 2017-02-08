//////////////////////////////////////////////////////////////////////////////
//
// @author: Stephan Engelmann (stephan-engelmann@gmx.de)
//
// A color palette definition to be used across multiple applets to achieve a
// consistent overall impression.
//
//////////////////////////////////////////////////////////////////////////////

define([], function() {

     class Colors {
          static get BLACK() { return 0x000000; }
          static get COLOR1() {return 0xAF0B0B;}
          static get COLOR1_LIGHT() {return 0xD41C1C;}
          static get COLOR1_LIGHTEST() {return 0xE34848;}
          static get COLOR1_DARK() {return 0x910000;}
          static get COLOR1_DARKEST() {return 0x6B0000;}
          static get COLOR2() {return 0xAF550B;}
          static get COLOR2_LIGHT() {return 0xD46F1C;}
          static get COLOR2_LIGHTEST() {return 0xE38E48;}
          static get COLOR2_DARK() {return 0x914200;}
          static get COLOR2_DARKEST() {return 0x6B3100;}
          static get COLOR3() {return 0x076969;}
          static get COLOR3_LIGHT() {return 0x117F7F;}
          static get COLOR3_LIGHTEST() {return 0x2B8888;}
          static get COLOR3_DARK() {return 0x005757;}
          static get COLOR3_DARKEST() {return 0x004040;}
          static get COLOR4() {return 0x098C09;}
          static get COLOR4_LIGHT() {return 0x16A916;}
          static get COLOR4_LIGHTEST() {return 0x3AB53A;}
          static get COLOR4_DARK() {return 0x007400;}
          static get COLOR4_DARKEST() {return 0x005600;}
          static get GREY() {return 0x888888;}
          static get RED() { return 0xFF0000; }
     }

     return {
          Colors: Colors
     };

});
