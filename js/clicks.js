define([
  "dojo/_base/declare",
  "esri/tasks/query",
  "esri/tasks/QueryTask",
], function (declare, Query, QueryTask) {
  "use strict";

  return declare(null, {
    eventListeners: function (t) {},

    // map click functionality call the map click query function //////////////////////////////////////////////////
    mapClickFunction: function (t) {
      t.map.on("click", function (c) {
        t.obj.pnt = c.mapPoint;
        t.clicks.mapClickQuery(t, t.obj.pnt); // call t.mapClickQuery function
      });
    },
    // map click query function /////////////////////////////////////////////////////////////////////
    mapClickQuery: function (t, p) {
      console.log(p);
    },

    makeVariables: function (t) {
      t.habitatSel = 0;
    },
    commaSeparateNumber: function (val) {
      while (/(\d+)(\d{3})/.test(val.toString())) {
        val = val.toString().replace(/(\d+)(\d{3})/, "$1" + "," + "$2");
      }
      return val;
    },
    abbreviateNumber: function (num) {
      if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
      }
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
      }
      return num;
    },
  });
});
