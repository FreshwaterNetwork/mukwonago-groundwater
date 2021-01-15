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
                console.log(results.results[0][0].feature, "eeeeee");
                t.obj.knownMapPoint = results.results[0][0].feature.geometry;
                t.esriapi.searchWaterFeatures(t);
            });

            // on map click event
            t.map.on("click", (evt) => {
                console.log(evt.mapPoint);
                t.obj.knownMapPoint = evt.mapPoint;
                t.esriapi.searchWaterFeatures(t);
                t.obj.mapClicked = true;
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
            // function searchWaterFeatures(point) {
            //     t.map.graphics.clear();
            //     t.selectedFeatures = [];
            //     // create a search circle with a 3 mile radius
            //     var searchCircle = new Circle({
            //         center: t.obj.knownMapPoint,
            //         geodesic: true,
            //         radius: 3,
            //         radiusUnit: "esriMiles",
            //     });
            //     const pointMarker = new SimpleMarkerSymbol(
            //         SimpleMarkerSymbol.STYLE_CIRCLE,
            //         10,
            //         new SimpleLineSymbol(
            //             SimpleLineSymbol.STYLE_SOLID,
            //             new Color([255, 0, 0]),
            //             1
            //         ),
            //         new Color([0, 100, 155, 0.67])
            //     );
            //     var pointGraphic = new Graphic(
            //         t.obj.knownMapPoint,
            //         pointMarker
            //     );
            //     t.map.graphics.add(pointGraphic);

            //     // clear map of graphics and then construct a new graphic based on searchCircle
            //     // t.map.graphics.clear();
            //     // var graphic = new Graphic(searchCircle, circleSymb);
            //     // t.map.graphics.add(graphic);

            //     // create a new query with the search circle as geom input
            //     var query = new Query();
            //     query.geometry = searchCircle.getExtent();
            //     query.returnGeometry = true;
            //     query.outFields = ["*"];
            //     // loop through the freshwater features and query each one based on searchCircle geom
            //     const freshwaterFeaturesURLs = [1, 2, 3];
            //     let i = 0;
            //     freshwaterFeaturesURLs.forEach((feature) => {
            //         let qt = new QueryTask(t.obj.url + "/" + feature);
            //         qt.execute(query, (results) => {
            //             results.features.forEach((feat) => {
            //                 t.selectedFeatures.push(feat);
            //             });
            //             i++;
            //             if (i === 3) {
            //                 // t.clicks.buildDrawdownTable(t);
            //                 findDrawdownDepletions(t.selectedFeatures);
            //             }
            //         });
            //     });

            //     // function queryTaskResults(results) {
            //     //     console.log(results.features);
            //     // }
            // }
            // function findDrawdownDepletions(feats) {
            //     let shortFeatNames = [];
            //     feats.forEach((feat) => {
            //         console.log(feat.attributes.Name);
            //         shortFeatNames.push(feat.attributes.Name);
            //     });
            //     console.log(
            //         "@@@@@@@",
            //         feats,
            //         t.obj.knownGPMValue,
            //         shortFeatNames
            //     );
            // }
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
                        // t.clicks.buildDrawdownTable(t);
                        findDrawdownDepletions(t.selectedFeatures);
                    }
                });
            });

            function findDrawdownDepletions(feats) {
                let waterFeatureData = [];
                feats.forEach((feat) => {
                    let commonName;
                    if (feat.attributes.CommonName) {
                        commonName = feat.attributes.CommonName;
                    } else {
                        commonName = feat.attributes.Name;
                    }
                    waterFeatureData.push({
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
                        if (
                            parseInt(t.obj.knownGPMValue) ===
                            parseInt(feat.attributes.gpm)
                        ) {
                            // build out water feature data
                            waterFeatureData.forEach((waterFeat) => {
                                let streamFlowDepletion = null;
                                let lakeDepletion = null;
                                let fenDrawdown =
                                    waterFeat.shortName + "_ddn_max";

                                let isLake = waterFeat.shortName.includes("lk");
                                if (isLake) {
                                    lakeDepletion =
                                        waterFeat.shortName + "_flow_rel";
                                }

                                let isStream = waterFeat.shortName.includes(
                                    "sfr"
                                );
                                if (isStream) {
                                    streamFlowDepletion =
                                        waterFeat.shortName + "_flow_rel";
                                }

                                waterFeat.fenDrawdown =
                                    feat.attributes[fenDrawdown];
                                waterFeat.lakeDepletion =
                                    feat.attributes[lakeDepletion];
                                waterFeat.streamDepletion =
                                    feat.attributes[streamFlowDepletion];
                            });
                            // send data to clicks to build the html table
                            t.clicks.buildDrawdownTable(t, waterFeatureData);
                        }
                    });
                });
            }
        },
    });
});
