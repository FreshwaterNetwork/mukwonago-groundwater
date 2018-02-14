define([
	"esri/layers/ArcGISDynamicMapServiceLayer", "esri/geometry/Extent", "esri/SpatialReference", "esri/tasks/query" ,"esri/tasks/QueryTask", "dojo/_base/declare", "esri/layers/FeatureLayer", 
	"esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol","esri/symbols/SimpleMarkerSymbol", "esri/graphic", "dojo/_base/Color"
],
function ( 	ArcGISDynamicMapServiceLayer, Extent, SpatialReference, Query, QueryTask, declare, FeatureLayer, 
			SimpleLineSymbol, SimpleFillSymbol, SimpleMarkerSymbol, Graphic, Color) {
        "use strict";

        return declare(null, {
			esriApiFunctions: function(t){	
				// Add dynamic map service
				t.dynamicLayer = new ArcGISDynamicMapServiceLayer(t.url, {opacity:0.7});
				t.map.addLayer(t.dynamicLayer);
				if (t.obj.visibleLayers.length > 0){	
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				}
				t.dynamicLayer.on("load", function () {
					// hide the framework toolbox	
					$('#map-utils-control').hide();	
					// create layers array
					t.layersArray = t.dynamicLayer.layerInfos;
					if (t.obj.stateSet == "no"){
						t.map.setExtent(t.dynamicLayer.fullExtent.expand(1), true)
					}
////////////////////////////// save and share code below ////////////////////////////////////////////////////////////
					if(t.obj.stateSet == 'yes'){
						// bring in layer defs var
						t.obj.layerDefinitions = [];
						// check the correct cb's
						$.each(t.obj.cbTracker, function(i,v){
							$('#' + v).prop('checked', true);
						})
						// put the radio button in the right place
						$('#' + t.obj.radButtonTracker).prop('checked', true);
						// if there is a selected layer set layer defs and add layer to map
						t.obj.layerDefinitions[t.obj.queryTracker] = t.obj.query;
						t.dynamicLayer.setLayerDefinitions(t.obj.layerDefinitions);
						// if something has been selected slide down the correct att box and populate
						if(t.obj.query){
							$('#' + t.id + t.obj.toggleTracker + "Wrapper").slideDown();
							$('#' + t.id + "selectedAttributes").show();
							let v1 = $($('#' + t.id + t.obj.toggleTracker + "Wrapper").find('.aoc-attText')[0]).html(t.obj.attsTracker[0]);
							let v2 = $($('#' + t.id + t.obj.toggleTracker + "Wrapper").find('.aoc-attText')[1]).html(t.obj.attsTracker[1])
							let v3 = $($('#' + t.id + t.obj.toggleTracker + "Wrapper").find('.aoc-attText')[2]).html(t.obj.attsTracker[2])
							let v4 = $($('#' + t.id + t.obj.toggleTracker + "Wrapper").find('.aoc-attText')[3]).html(t.obj.attsTracker[3])
							let v5 = $($('#' + t.id + t.obj.toggleTracker + "Wrapper").find('.aoc-attText')[4]).html(t.obj.attsTracker[4])
							let v6 = $($('#' + t.id + t.obj.toggleTracker + "Wrapper").find('.aoc-attText')[5]).html(t.obj.attsTracker[5])
							let v7 = $($('#' + t.id + t.obj.toggleTracker + "Wrapper").find('.aoc-attText')[6]).html(t.obj.attsTracker[6])
							let v8 = $($('#' + t.id + t.obj.toggleTracker + "Wrapper").find('.aoc-attText')[7]).html(t.obj.attsTracker[7])
						}
						// display the correct layers on the map
						t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
						// check the correct checkboxes in the sup data section ////////////////////////
						$.each(t.obj.supCheckArray,function(i,y){
							console.log(y);
							$.each($('#' + t.id + 'supData input'),function(i,v){
								if(y == v.value){
									$(v).prop('checked', 'true');
								}
							})
						})
						// zoom to the correct area of the map
						t.map.setExtent(t.obj.extent, true);
					}
				});					
			}
		});
    }
);