define([
	"esri/layers/ArcGISDynamicMapServiceLayer", "esri/geometry/Extent", "esri/SpatialReference", "esri/tasks/query" ,"esri/tasks/QueryTask", "dojo/_base/declare", "esri/layers/FeatureLayer", 
	"esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol","esri/symbols/SimpleMarkerSymbol", "esri/graphic", "dojo/_base/Color","esri/layers/GraphicsLayer"
],
function ( 	ArcGISDynamicMapServiceLayer, Extent, SpatialReference, Query, QueryTask, declare, FeatureLayer, 
			SimpleLineSymbol, SimpleFillSymbol, SimpleMarkerSymbol, Graphic, Color, GraphicsLayer) {
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

// // the code for the flood tags api is below and works as is //////////////////////////////////////////
// 					console.time('log')
					// var url = "https://api.floodtags.com/v1/tags/fews-world/geojson?until=2018-02-19&since=2018-02-01&apiKey=e0692cae-eb63-4160-8850-52be0d7ef7fe"
				 //    $.get( url, function( data ) {
				 //      console.log(data)
				 //      t.data2 = data;
				 //      // add graphic to map function call
				 //     //  t.clicks.addGeoJson(t);
				 //    	// console.log(t.data2);
				 //    	t.countiesGraphicsLayer = new GraphicsLayer({ id: "dataGraphic" });
					// 	$.each(t.data2.features, function(i,v){
					// 		let coordinates = v["geometry"]["coordinates"];
					// 		let attributes = v["properties"]
					// 		let point = {"geometry":{"points":[coordinates],"spatialReference":4326},
					// 	    "symbol":{"color":[255,208,100,255],"size":20,"angle":0,"xoffset":0,"yoffset":0,"type":"esriSMS","style":"esriSMSCircle", 
					// 	    "outline":{"color":[176,35,105,255],"width":1,"type":"esriSLS","style":"esriSLSSolid"}}, "attributes":attributes};
					// 	    var gra = new Graphic(point);
					// 	  	t.countiesGraphicsLayer.add(gra);
					// 	})
					// 	 t.map.addLayer(t.countiesGraphicsLayer);
					// 	 t.countiesGraphicsLayer.on("click",function (evt) {
					// 		console.log(evt.graphic.attributes)
							
					// 	})
					// 	 console.timeEnd('log')
				 //    });
				 //    // var url2 = "https://api.floodtags.com/v1/tags/fews-world/t-959347183396016128&apiKey=e0692cae-eb63-4160-8850-52be0d7ef7fe"
				 //    // to request a specific tag
				 //    var url2 = "https://api.floodtags.com/v1/tags/t-964498811530989569"
				 //    $.get( url2, function( data ) {
				 //      console.log(data)
				 //      t.data2 = data;
				 //  	});



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
						// remove all blueFont classes first before adding it back to current target
						$.each($('#' + t.id + 'contentWrapper').find('.aoc-mainCB'), function(i,v){
							$(v).removeClass('blueFont');
						})
						$('#' + t.obj.radButtonTracker).parent().prev().addClass('blueFont')
						// if there is a selected layer set layer defs and add layer to map
						t.obj.layerDefinitions[t.obj.queryTracker] = t.obj.query;
						t.dynamicLayer.setLayerDefinitions(t.obj.layerDefinitions);
						// if something has been selected slide down the correct att box and populate
						if(t.obj.query){
							$('#' + t.id + t.obj.toggleTracker + "Wrapper").slideDown();
							$('#' + t.id + "selectedAttributes").show();
							let v1 = $($('#' + t.id + t.obj.toggleTracker + "Wrapper").find('.aoc-attText')[0]).html(t.obj.attsTracker[0]);
							let v2 = $($('#' + t.id + t.obj.toggleTracker + "Wrapper").find('.aoc-attText')[1]).html(t.obj.attsTracker[1])
							// handle the report link for habitat
							if(t.obj.toggleTracker == 'habitat'){
								var html = "<a style='color:blue;' href='plugins/AOCapp/assets/report.pdf#page=" + t.obj.attsTracker[2] + "' target='_blank'>Click to view in report</a>"
								let v3 = $($('#' + t.id + t.obj.toggleTracker + "Wrapper").find('.aoc-attText')[2]).html(html)
							}else{
								let v3 = $($('#' + t.id + t.obj.toggleTracker + "Wrapper").find('.aoc-attText')[2]).html(t.obj.attsTracker[2])
							}
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
							$.each($('#' + t.id + 'supData input'),function(i,v){
								if(y == v.value){
									$(v).prop('checked', 'true');
								}
							})
						})
						// zoom to the correct area of the map
						t.map.setExtent(t.obj.extent.expand(1.5), true);
					}
				});	
			}
		});
    }
);