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
            // Add dynamic map service
            t.dynamicLayer = new ArcGISDynamicMapServiceLayer(t.obj.url, {
                opacity: 0.9,
            });
            t.map.addLayer(t.dynamicLayer);
            if (t.obj.visibleLayers.length > 0) {
                t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
            }
            console.log("search test");
            t.search = new Search(
                {
                    map: t.map,
                    enableInfoWindow: false,
                    enableHighlight: false,
                    zoomScale: 2,
                },
                t.id + "mgw-search-bar"
            );
            console.log(t.search);
            t.search.startup();
            t.search.on("search-results", function (e) {
                console.log(e, "eeeeee");
            });
            var circleSymb = new SimpleFillSymbol(
                SimpleFillSymbol.STYLE_NULL,
                new SimpleLineSymbol(
                    SimpleLineSymbol.STYLE_SHORTDASHDOTDOT,
                    new Color([105, 105, 105]),
                    2
                ),
                new Color([255, 255, 0, 0.25])
            );
            t.map.on("click", (evt) => {
                console.log(evt);
                var circle = new Circle({
                    center: evt.mapPoint,
                    geodesic: true,
                    radius: 3,
                    radiusUnit: "esriMiles",
                });
                t.map.graphics.clear();
                var graphic = new Graphic(circle, circleSymb);
                t.map.graphics.add(graphic);
                var query = new Query();
                var qt = new QueryTask(
                    "https://cirrus.tnc.org/arcgis/rest/services/FN_Wisconsin/mukwonago_groundwater_v11162020/MapServer/1"
                );
                query.geometry = circle.getExtent();
                query.returnGeometry = true;
                query.outFields = ["*"];

                qt.execute(query, function (evt) {
                    console.log(evt);
                    // if (evt.features.length > 0) {
                    //     t.obj.maskClick = "yes";
                    // } else {
                    //     t.obj.maskClick = "no";
                    // }
                });
            });
            t.dynamicLayer.on("load", function () {
                t.obj.opacityVal = 25;
                // work with Opacity sliders /////////////////////////////////////////////
                $("#" + t.id + "sldr").slider({
                    min: 0,
                    max: 100,
                    range: false,
                    values: [t.obj.opacityVal],
                });

                // t.dynamicLayer.setOpacity(1 - t.obj.opacityVal / 100); // set init opacity
                $("#" + t.id + "sldr").on("slide", function (c, ui) {
                    t.obj.opacityVal = 1 - ui.value / 100;
                    // t.dynamicLayer.setOpacity(t.obj.opacityVal);
                });
                // hide the framework toolbox
                // create layers array
                t.layersArray = t.dynamicLayer.layerInfos;
                if (t.obj.stateSet == "no") {
                    t.map.setExtent(
                        t.dynamicLayer.fullExtent.expand(0.55),
                        true
                    );
                }

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
        },
    });
});
