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
            var circleSymb = new SimpleFillSymbol(
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
                searchWaterFeatures(results.results[0][0].feature.geometry);
            });

            // on map click event
            t.map.on("click", (evt) => {
                searchWaterFeatures(evt.mapPoint);
            });

            // on dynamic layer load
            t.dynamicLayer.on("load", function () {
                // create layers array
                t.layersArray = t.dynamicLayer.layerInfos;
                if (t.obj.stateSet == "no") {
                    t.map.setExtent(
                        t.dynamicLayer.fullExtent.expand(0.3),
                        true
                    );
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
            function searchWaterFeatures(point) {
                t.map.graphics.clear();
                let selectedFeatures = [];
                // create a search circle with a 3 mile radius
                var searchCircle = new Circle({
                    center: point,
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
                var pointGraphic = new Graphic(point, pointMarker);
                t.map.graphics.add(pointGraphic);

                // clear map of graphics and then construct a new graphic based on searchCircle
                // t.map.graphics.clear();
                // var graphic = new Graphic(searchCircle, circleSymb);
                // t.map.graphics.add(graphic);

                // create a new query with the search circle as geom input
                var query = new Query();
                query.geometry = searchCircle.getExtent();
                query.returnGeometry = true;
                query.outFields = ["*"];
                // loop through the freshwater features and query each one based on searchCircle geom
                const freshwaterFeaturesURLs = [1, 2, 3];
                freshwaterFeaturesURLs.forEach((feature) => {
                    console.log(feature);
                    let qt = new QueryTask(t.obj.url + "/" + feature);
                    qt.execute(query, queryTaskResults);
                });
                function queryTaskResults(results) {
                    console.log(results.features);
                    selectedFeatures.push(results.features);
                }
            }
        },
    });
});
