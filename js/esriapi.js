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
  "esri/geometry/Circle",
  "esri/dijit/Search",
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
  Circle,
  Search,
  Graphic,
  Color,
  GraphicsLayer
) {
  "use strict";

  return declare(null, {
    esriApiFunctions: function (t) {
      t.selectedWaterFeatures = [];
      t.hoverGraphicsLayer = new GraphicsLayer();
      t.map.addLayer(t.hoverGraphicsLayer);
      // circle symbology
      t.circleSymb = new SimpleFillSymbol(
        SimpleFillSymbol.STYLE_NULL,
        new SimpleLineSymbol(
          SimpleLineSymbol.STYLE_SHORTDASHDOTDOT,
          new Color([105, 105, 105]),
          2
        ),
        new Color([255, 255, 0, 0.25])
      );
      // Add dynamic map service
      t.dynamicLayer = new ArcGISDynamicMapServiceLayer(t.obj.url, {
        opacity: 0.9,
      });
      t.map.addLayer(t.dynamicLayer);

      // set the visible layers
      if (t.obj.visibleLayers.length > 0) {
        t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
      }

      // create the search bar
      t.search = new Search(
        {
          map: t.map,
          enableInfoWindow: false,
          enableHighlight: false,
          zoomScale: 2,
        },
        t.id + "mgw-search-bar"
      );

      // init the startup widget
      t.search.startup();

      // on search event
      t.search.on("search-results", function (results) {
        t.obj.knownMapPoint = results.results[0][0].feature.geometry;
        t.esriapi.searchWaterFeatures(t);
      });

      // on map click event
      t.map.on("click", (evt) => {
        if (t.obj.inEvaluate) {
          t.obj.knownMapPoint = evt.mapPoint;
          t.esriapi.searchWaterFeatures(t);
          t.obj.mapClicked = true;
        }
        if (t.obj.inSearch) {
          t.searchMapPoint = evt.mapPoint;
          t.esriapi.selectWaterFeature(t);
        }
      });

      // on dynamic layer load
      t.dynamicLayer.on("load", function () {
        // create layers array
        t.layersArray = t.dynamicLayer.layerInfos;
        if (t.obj.stateSet == "no") {
          const startingPoint = {
            x: -9840713.49516717,
            y: 5289833.999792501,
            spatialReference: { wkid: 102100, latestWkid: 3857 },
          };
          t.map.centerAndZoom(startingPoint, 11);
        }
        t.dynamicLayer.setOpacity(1 - t.obj.opacityVal / 100); // set init opacity
        $("#" + t.id + "sldr").on("slide", function (c, ui) {
          t.obj.opacityVal = 1 - ui.value / 100;
          t.dynamicLayer.setOpacity(t.obj.opacityVal);
        });
        ////////////////////////////// save and share code below ////////////////////////////////////////////////////////////
        if (t.obj.stateSet == "yes") {
          // display the correct layers on the map
          t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);

          // zoom to the correct area of the map
          t.map.setExtent(t.obj.extent.expand(1.5), true);
        }
      });
    },
    searchWaterFeatures: function (t) {
      // clear map of graphics and then construct a new graphic based on searchCircle
      t.map.graphics.clear();
      t.selectedFeatures = [];
      // create a search circle with a 3 mile radius
      var searchCircle = new Circle({
        center: t.obj.knownMapPoint,
        geodesic: true,
        radius: 3,
        radiusUnit: "esriMiles",
      });
      const pointMarker = new SimpleMarkerSymbol(
        SimpleMarkerSymbol.STYLE_CIRCLE,
        10,
        new SimpleLineSymbol(
          SimpleLineSymbol.STYLE_SOLID,
          new Color([255, 0, 0]),
          1
        ),
        new Color([0, 100, 155, 0.67])
      );
      var pointGraphic = new Graphic(t.obj.knownMapPoint, pointMarker);
      t.map.graphics.add(pointGraphic);

      // t.map.graphics.clear();
      var graphic = new Graphic(searchCircle, t.circleSymb);
      t.map.graphics.add(graphic);

      // create a new query with the search circle as geom input
      var query = new Query();
      query.geometry = searchCircle.getExtent();
      query.returnGeometry = true;
      query.outFields = ["*"];
      // loop through the freshwater features and query each one based on searchCircle geom
      const freshwaterFeaturesURLs = [1, 2, 3];
      let i = 0;
      freshwaterFeaturesURLs.forEach((feature) => {
        let qt = new QueryTask(t.obj.url + "/" + feature);
        qt.execute(query, (results) => {
          results.features.forEach((feat) => {
            t.selectedFeatures.push(feat);
          });
          i++;
          if (i === 3) {
            findDrawdownDepletions(t.selectedFeatures);
          }
        });
      });

      function findDrawdownDepletions(feats) {
        t.waterFeatureData = [];
        feats.forEach((feat) => {
          let commonName;
          if (feat.attributes.CommonName) {
            commonName = feat.attributes.CommonName;
          } else {
            commonName = feat.attributes.Name;
          }
          t.waterFeatureData.push({
            shortName: feat.attributes.Name,
            commonName: commonName,
          });
        });
        let query = new Query();
        query.geometry = t.obj.knownMapPoint;
        query.returnGeometry = true;
        query.outFields = ["*"];
        let qt = new QueryTask(t.obj.url + "/4");
        qt.execute(query, (results) => {
          results.features.forEach((feat) => {
            let geometry = feat.geometry;
            if (
              parseInt(t.obj.knownGPMValue) === parseInt(feat.attributes.gpm)
            ) {
              // build out water feature data
              t.waterFeatureData.forEach((waterFeat) => {
                let streamFlowDepletion = null;
                let lakeDepletion = null;
                let fenDrawdown = waterFeat.shortName + "_ddn_max";

                let isLake = waterFeat.shortName.includes("lk");
                if (isLake) {
                  lakeDepletion = waterFeat.shortName + "_flow_rel";
                }

                let isStream = waterFeat.shortName.includes("sfr");
                if (isStream) {
                  streamFlowDepletion = waterFeat.shortName + "_flow_rel";
                }
                // waterFeat.fenDrawdown = feat.attributes[fenDrawdown];
                // waterFeat.depletion = feat.attributes[lakeDepletion];
                // waterFeat.depletion = feat.attributes[streamFlowDepletion];
                waterFeat.fenDrawdown = feat.attributes[fenDrawdown];
                waterFeat.lakeDepletion = feat.attributes[lakeDepletion];
                waterFeat.streamDepletion =
                  feat.attributes[streamFlowDepletion];
                waterFeat.geometry = geometry;
              });
              // send data to clicks to build the html table
              t.clicks.buildDrawdownTable(t, t.waterFeatureData);
            }
          });
        });
      }
    },
    selectWaterFeature: function (t) {
      // scale dependent click to grab a point
      let centerPoint = new esri.geometry.Point(
        t.searchMapPoint.x,
        t.searchMapPoint.y,
        t.searchMapPoint.spatialReference
      );
      let mapWidth = t.map.extent.getWidth();
      let mapWidthPixels = t.map.width;
      // change the tolerence below to adjust how many pixels will be grabbed when clicking on a point or line
      let tolerance = 10 * (mapWidth / mapWidthPixels);
      let ext = new esri.geometry.Extent(
        1,
        1,
        tolerance,
        tolerance,
        t.searchMapPoint.spatialReference
      );
      var query = new Query();
      query.geometry = ext.centerAt(centerPoint);
      query.returnGeometry = true;
      query.outFields = ["*"];
      let qt1 = new QueryTask(t.obj.url + "/3");
      let qt2 = new QueryTask(t.obj.url + "/2");
      let qt3 = new QueryTask(t.obj.url + "/1");
      qt1.execute(query, (fens) => {
        if (fens.features.length > 0) {
          fens.features.forEach((fen) => {
            const index = t.selectedWaterFeatures.findIndex(
              (item) => item.attributes.CommonName == fen.attributes.CommonName
            );
            if (index == -1) {
              t.selectedWaterFeatures.push(fen);
            }
          });
        }
        qt2.execute(query, (lakes) => {
          if (lakes.features.length > 0) {
            lakes.features.forEach((lake) => {
              //   t.selectedWaterFeatures.push(lake);
              const index = t.selectedWaterFeatures.findIndex(
                (item) =>
                  item.attributes.CommonName == lake.attributes.CommonName
              );
              if (index == -1) {
                t.selectedWaterFeatures.push(lake);
              }
            });
          }
          qt3.execute(query, (streams) => {
            if (streams.features.length > 0) {
              streams.features.forEach((stream) => {
                // t.selectedWaterFeatures.push(stream);
                const index = t.selectedWaterFeatures.findIndex(
                  (item) =>
                    item.attributes.CommonName == stream.attributes.CommonName
                );
                if (index == -1) {
                  t.selectedWaterFeatures.push(stream);
                }
              });
            }
            t.esriapi.highlightSelectedWaterFeatures(t);
            t.clicks.buildSelectedWaterFeatureTable(t);
          });
        });
      });
    },
    highlightSelectedWaterFeatures: function (t, hoverRowGeometry) {
      // Add the buffer graphic to the map
      var polySelectSym = new SimpleFillSymbol()
        .setColor(new Color([56, 102, 164, 0.0]))
        .setOutline(
          new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID,
            new Color([255, 255, 0]),
            2
          )
        );
      const pointMarker = new SimpleMarkerSymbol(
        SimpleMarkerSymbol.STYLE_CIRCLE,
        10,
        new SimpleLineSymbol(
          SimpleLineSymbol.STYLE_SOLID,
          new Color([255, 255, 0]),
          1
        ),
        new Color([255, 255, 0, 1])
      );
      if (hoverRowGeometry) {
        let selectGraphic;
        t.hoverGraphicsLayer.clear();
        let isPoly = hoverRowGeometry.hasOwnProperty("rings");

        if (isPoly) {
          selectGraphic = new Graphic(hoverRowGeometry, polySelectSym);
        } else {
          selectGraphic = new Graphic(hoverRowGeometry, pointMarker);
        }
        t.hoverGraphicsLayer.add(selectGraphic);
      } else {
        t.map.graphics.clear();
        t.selectedWaterFeatures.forEach((feat) => {
          if (feat.attributes.Name.includes("sfr")) {
            var polySelectGraphic = new Graphic(feat.geometry, pointMarker);
            t.map.graphics.add(polySelectGraphic);
          } else {
            var polySelectGraphic = new Graphic(feat.geometry, polySelectSym);
            t.map.graphics.add(polySelectGraphic);
          }
        });
      }
    },
    displayDrawdownRasterOnMap: function (t) {
      t.obj.visibleLayers = [0, 1, 2, 3];
      let layerName;
      console.log(t.obj.selectedFeatureName);
      if (t.obj.selectedFeatureName.includes("Fen")) {
        layerName = `${t.obj.selectedFeatureName} - Drawdown - ${t.obj.knownSearchGPMValue} gpm`;
      } else {
        layerName = `${t.obj.selectedFeatureName} - Depletion - ${t.obj.knownSearchGPMValue} gpm`;
      }
      console.log(t.obj.selectedFeatureName);
      //   console.log(t.obj.knownSearchGPMValue);
      //   console.log(t.layersArray);
      console.log(layerName);
      t.layersArray.forEach((lyr) => {
        if (lyr.name == layerName) {
          console.log(lyr.id);
          t.obj.visibleLayers.push(lyr.id);
          t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
        }
      });
    },
  });
});
