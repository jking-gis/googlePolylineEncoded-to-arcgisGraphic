/*AUTHOR: Jeff King*/

define([
  "dojo/_base/declare",
  "dojo/_base/kernel",
  "dojo/_base/lang",
  "dojo/io-query",
  "esri/config",
  "esri/geometry/webMercatorUtils",
  "esri/geometry/Polyline",
  "esri/symbols/SimpleLineSymbol",
  "esri/graphic",
  "dojo/domReady!"
], function(
  declare, kernel, lang, ioQuery, esriConfig, webMercatorUtils, Polyline,
  SimpleLineSymbol, Graphic) {
  return declare([], {
    config: null,

    constructor: function (config) {
      this.config = config;
    },

    encodePoly: function(decodedPolyline) {
      console.log("To be added later");
    },

    decodePoly: function(encodedString) {
      var codeChunks = [];
      var codeChunk = [];
      var coord = [];

      var i; var x = 0; var y = 0;
      for(i=0; i<encodedString.length; i++) {
        codeChunk[x] = encodedString.charCodeAt(i) - 63;
        if((codeChunk[x] & 0x20) === 0x0) {
          codeChunk = codeChunk.reverse();
          var j; var codeChunk_string = "";

          var zerosToAdd = 8 - ((codeChunk.length*5) % 8);
          for(j=0; j<zerosToAdd; j++) {
              codeChunk_string = codeChunk_string + "0";
          }

          for(j=0; j<codeChunk.length; j++) {
            codeChunk[j] = codeChunk[j].toString(2);
            codeChunk[j] = "00000".substr(codeChunk[j].length) + codeChunk[j]
            codeChunk_string = codeChunk_string + codeChunk[j];
          }

          var codeChunk_bin = parseInt(codeChunk_string, 2);
          var negative = false;
          if(codeChunk_bin & 0x1) {
            negative = true;
            codeChunk_bin = ~(codeChunk_bin >> 1);
            codeChunk_bin = codeChunk_bin - 0x1;
            codeChunk_bin = ~(codeChunk_bin >> 1);
            codeChunk_bin = codeChunk_bin * -1;
            codeChunk_bin = codeChunk_bin << 1;
          }else {
            codeChunk_bin = codeChunk_bin >> 1;
          }

          codeChunk_bin = codeChunk_bin / 100000;
          coord[y%2] = codeChunk_bin;

          if(y%2 == 1) {
            codeChunks[Math.floor(y/2)] = coord.reverse();
            if(y>1) {
              codeChunks[Math.floor(y/2)][0] = codeChunks[Math.floor(y/2)][0] + codeChunks[Math.floor(y/2) - 1][0];
              codeChunks[Math.floor(y/2)][1] = codeChunks[Math.floor(y/2)][1] + codeChunks[Math.floor(y/2) - 1][1];
            }
            coord = [];
          }

          y++;
          x = 0;
          codeChunk = [];
        }else {
          codeChunk[x] = codeChunk[x] & 0x1F;
          x++;
        }
      }

      return codeChunks;
    },

    decodePoly_toGraphic: function(encodedString, lineSymbol) {
      var line = new Polyline(this.decodePoly(encodedString));
      var lineGraphic = new Graphic(line, lineSymbol);
      return lineGraphic;
    }
  });
});
