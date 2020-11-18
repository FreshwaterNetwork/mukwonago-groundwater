define([
  "esri/layers/ArcGISDynamicMapServiceLayer",
  "esri/geometry/Extent",
  "esri/SpatialReference",
  "esri/tasks/query",
  "esri/tasks/QueryTask",
  "esri/tasks/IdentifyTask",
  "esri/tasks/IdentifyParameters",
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
  IdentifyTask,
  IdentifyParameters,
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
        const startingExtent = new Extent(
          -9875817.047046928,
          5276075.334701181,
          -9811304.195174327,
          5311236.367712314,
          new SpatialReference({ wkid: 102100 })
        );
        // User selections on chosen menus
        // $("#" + t.id + "ch-ISL")
        //   .chosen({ width: "182px", disable_search: true })
        //   .change(t, function (c, p) {});
        t.obj.opacityVal = 25;
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

        // create layers array
        t.layersArray = t.dynamicLayer.layerInfos;

        // if not state set, set extent to starting extent
        if (t.obj.stateSet == "no") {
          t.map.setExtent(startingExtent.expand(0.75), true);
        }

        ////////////////////////////// save and share code below ////////////////////////////////////////////////////////////
        if (t.obj.stateSet == "yes") {
          // display the correct layers on the map
          t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);

          // zoom to the correct area of the map
          t.map.setExtent(t.obj.extent.expand(1.5), true);
        }
      });
      t.map.on("click", (event) => {
        getRasterValue(event.mapPoint, 10);
      });
      function getRasterValue(mapPoint, layerID) {
        const identifyTask = new IdentifyTask(t.obj.url);
        const identifyParams = new IdentifyParameters();
        identifyParams.tolerance = 3;
        identifyParams.returnGeometry = true;
        identifyParams.layerIds = [layerID];
        identifyParams.geometry = mapPoint;
        identifyParams.mapExtent = t.map.extent;
        identifyTask.execute(identifyParams).addCallback(function (response) {
          // console.log(response[0].feature);
          displayRasterValue(response[0].feature);
        });
      }
      function displayRasterValue(value) {
        console.log(value.attributes);
      }
    },
  });
});
