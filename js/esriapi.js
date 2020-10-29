define([
  "esri/layers/ArcGISDynamicMapServiceLayer",
  "esri/geometry/Extent",
  "esri/SpatialReference",
  "esri/tasks/query",
  "esri/tasks/QueryTask",
  "dojo/_base/declare",
  "esri/layers/FeatureLayer",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleFillSymbol",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/graphic",
  "dojo/_base/Color",
  "esri/layers/GraphicsLayer",
], function (
  ArcGISDynamicMapServiceLayer,
  Extent,
  SpatialReference,
  Query,
  QueryTask,
  declare,
  FeatureLayer,
  SimpleLineSymbol,
  SimpleFillSymbol,
  SimpleMarkerSymbol,
  Graphic,
  Color,
  GraphicsLayer
) {
  "use strict";

  return declare(null, {
    esriApiFunctions: function (t) {
      // Add dynamic map service
      t.dynamicLayer = new ArcGISDynamicMapServiceLayer(t.obj.url, {
        opacity: 0.9,
      });
      t.map.addLayer(t.dynamicLayer);
      if (t.obj.visibleLayers.length > 0) {
        t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
      }
      t.dynamicLayer.on("load", function () {
        // User selections on chosen menus
        $("#" + t.id + "ch-ISL")
          .chosen({ width: "182px", disable_search: true })
          .change(t, function (c, p) {});
        t.obj.opacityVal = 50;
        // work with Opacity sliders /////////////////////////////////////////////
        $("#" + t.id + "sldr").slider({
          min: 0,
          max: 100,
          range: false,
          values: [t.obj.opacityVal],
        });
        t.dynamicLayer.setOpacity(1 - t.obj.opacityVal / 100); // set init opacity
        $("#" + t.id + "sldr").on("slide", function (c, ui) {
          t.obj.opacityVal = 1 - ui.value / 100;
          t.dynamicLayer.setOpacity(t.obj.opacityVal);
        });
        // hide the framework toolbox
        $("#map-utils-control").hide();
        // create layers array
        t.layersArray = t.dynamicLayer.layerInfos;
        if (t.obj.stateSet == "no") {
          t.map.setExtent(t.dynamicLayer.fullExtent.expand(1), true);
        }
        ////////////////////////////// save and share code below ////////////////////////////////////////////////////////////
        if (t.obj.stateSet == "yes") {
          // display the correct layers on the map
          t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);

          // zoom to the correct area of the map
          t.map.setExtent(t.obj.extent.expand(1.5), true);
        }
      });
    },
  });
});
