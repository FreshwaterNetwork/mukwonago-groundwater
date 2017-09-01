define([
	"esri/layers/ArcGISDynamicMapServiceLayer", "esri/geometry/Extent", "esri/SpatialReference", "esri/tasks/query" ,"esri/tasks/QueryTask", "dojo/_base/declare", "esri/layers/FeatureLayer", 
	"esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol","esri/symbols/SimpleMarkerSymbol", "esri/graphic", "dojo/_base/Color", 
],
function ( 	ArcGISDynamicMapServiceLayer, Extent, SpatialReference, Query, QueryTask, declare, FeatureLayer, 
			SimpleLineSymbol, SimpleFillSymbol, SimpleMarkerSymbol, Graphic, Color) {
        "use strict";

        return declare(null, {
			esriApiFunctions: function(t){	
				// Add dynamic map service layer number 2
				t.dynamicLayer2 = new ArcGISDynamicMapServiceLayer(t.url, {opacity:0.7});
				t.map.addLayer(t.dynamicLayer2);
				if (t.obj.visibleLayers.length > 0){	
					t.dynamicLayer2.setVisibleLayers(t.obj.visibleLayers2);
				}
				// Add dynamic map service
				t.dynamicLayer = new ArcGISDynamicMapServiceLayer(t.url, {opacity:0.7});
				t.map.addLayer(t.dynamicLayer);
				if (t.obj.visibleLayers.length > 0){	
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				}
				
// Dynamic layer on load ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				t.dynamicLayer.on("load", function () { 

					

					t.layersArray = t.dynamicLayer.layerInfos;
					t.obj.dynamicLyrExt = t.dynamicLayer.fullExtent.expand(1);
					
					t.clicks.featureLayerListeners(t);
					if (t.obj.stateSet == "no"){
						t.map.setExtent(t.dynamicLayer.fullExtent.expand(.6), true)
					}
// Save and Share ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
					// Save and Share Handler					
					if (t.obj.stateSet == "yes"){
						// set slider values
						$.each(t.obj.slIdsVals,function(i,v){
							$('#' + t.id + v[0]).slider('values', v[1]);
						});	
						// checkboxes for sliders
						$.each(t.obj.slCbIds,function(i,v){
							$('#' + t.id + v).trigger('click');
						})
						// set radio buttons to checked state
						$.each(t.obj.rbIds,function(i,v){
							$('#' + t.id + v).attr('checked', true);
						})
						// checkboxes for radio buttons
						$.each(t.obj.rbCbIds,function(i,v){
							$('#' + t.id + v).trigger('click');
						})
						//extent
						var extent = new Extent(t.obj.extent.xmin, t.obj.extent.ymin, t.obj.extent.xmax, t.obj.extent.ymax, new SpatialReference({ wkid:4326 }))
						t.map.setExtent(extent, true);
						t.obj.stateSet = "no";
					}	
					// trigger initial top control clicks
					$.each($('#' + t.id + 'top-controls input'),function(i,v){
						if (t.obj[v.name] == v.value){
							$('#' + v.id).trigger('click');	
						}	
					});
					// work with Opacity sliders /////////////////////////////////////////////
					$("#" + t.id +"sldr").slider({ min: 0, max: 100, range: false, values: [t.obj.opacityVal] })
					t.dynamicLayer.setOpacity(1 - t.obj.opacityVal/100); // set init opacity
					$("#" + t.id +"sldr").on( "slide", function(c,ui){
						t.obj.opacityVal = 1 - ui.value/100;
						t.dynamicLayer.setOpacity(t.obj.opacityVal);
					})
					$("#" + t.id +"sldr1").slider({ min: 0, max: 100, range: false, values: [t.obj.opacityVal2] })
					t.dynamicLayer.setOpacity(1 - t.obj.opacityVal/100); // set init opacity
					$("#" + t.id +"sldr1").on( "slide", function(c,ui){
						t.obj.opacityVal2 = 1 - ui.value/100;
						t.dynamicLayer2.setOpacity(t.obj.opacityVal2);
					})	
				});
				// Work with the explain each choice buttons
				$('.wfa-helpLinkText').unbind().on('click',function(c){
					if(c.currentTarget.id == 'dijit_layout_ContentPane_0explainButton'){
						let helpText = $('.wfa-helpText');
						$.each(helpText,function(i,v){
							if($(v).is(":visible") == false){
								$(v).slideDown();
								$(c.currentTarget).html('Hide Explanations')
								$(c.currentTarget).css('color', 'rgb(140, 33, 48)')
							}else{
								$(v).slideUp();
								$(c.currentTarget).html('Explain Each Section')
								$(c.currentTarget).css('color', 'blue')
							}
						})
					}
				})

// the code below may be useful. we used it to hide a legend item but it is clunky.
				// t.map.on("update-end", function (e) {
				// 	let span = $(".layer-legends").find('span');
				// 	$.each(span,function(i,v){
				// 		if($(v).html() == 'HUC - Mask'){
				// 			$(v).parent().parent().hide()
				// 		}
				// 	});
				// })	
				// t.map.on("update-start", function (e) {
				// 	let span = $(".layer-legends").find('span');
				// 	$.each(span,function(i,v){
				// 		if($(v).html() == 'HUC - Mask'){
				// 			$(v).parent().parent().hide()
				// 		}
				// 	});
				// })

				t.dynamicLayer2.on("load", function () {	
					t.layersArray2 = t.dynamicLayer.layerInfos;
				});				
			}
		});
    }
);