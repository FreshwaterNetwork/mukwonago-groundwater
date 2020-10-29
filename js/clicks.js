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
      // if trying to click on a point change the click tolerance
      if (t.obj.queryTracker == 0 || t.obj.queryTracker == 1) {
        var centerPoint = new esri.geometry.Point(
          t.obj.pnt.x,
          t.obj.pnt.y,
          t.obj.pnt.spatialReference
        );
        var mapWidth = t.map.extent.getWidth();
        var mapWidthPixels = t.map.width;
        var pixelWidth = mapWidth / mapWidthPixels;
        var tolerance = 10 * pixelWidth;
        var pnt = t.obj.pnt;
        var ext = new esri.geometry.Extent(
          1,
          1,
          tolerance,
          tolerance,
          t.obj.pnt.spatialReference
        );
        p = ext.centerAt(centerPoint);
      }

      // start of query ///////////////////////////////////////////////////////////////////////
      t.q = new Query();
      // use query tracker to create the correct url
      t.qt = new QueryTask(t.url + "/" + t.obj.queryTracker);
      t.q.geometry = p;
      // t.q.returnGeometry = true;
      t.q.outFields = ["*"];
      // execute query ///////////////////
      if (t.obj.queryTracker) {
        t.qt.execute(t.q);
      }
      t.qt.on("complete", function (evt) {});
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
