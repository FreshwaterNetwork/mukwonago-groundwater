define([
	"dojo/_base/declare", "esri/tasks/query", "esri/tasks/QueryTask"
],
function ( declare, Query, QueryTask ) {
        "use strict";

        return declare(null, {
			eventListeners: function(t){
				// call the map click function at the start to load it
				t.clicks.mapClickFunction(t);
				// on zoom end turn on layer with and without borders depending on a zoom level scale of 75000 ///////////////
				t.map.on("zoom-end", function(){
					if(t.map.getScale() < 75001){
						t.obj.scale = 'in'
					}else{
						t.obj.scale = 'out'
					}
				})
				// Main header toggle button///////////////////////////////////////////
				$('#' + t.id + 'mainRadioBtns input').on('click',function(c){
					// console.log(c);
					let val = c.currentTarget.value;
					t.currentCheckVal = c.currentTarget;
					const sections = $(".aoc-contentBelowHeader .aoc-mainSection");
					t.clicks.toggleFunc(t)
				});
				// checkboxes for suplementary data
				$('#' + t.id + 'supDataWrapper input').on('click',function(c){
					let val = parseInt(c.currentTarget.value.split('-')[1]);
					if(c.currentTarget.checked){
						t.obj.visibleLayers.push(val)
					}else{
						// remove item from visible layer list
						let index = t.obj.visibleLayers.indexOf(val)
						t.obj.visibleLayers.splice(index,1);
					}
					// set the visible layers
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				});
			}, 

			// map click functionality call the map click query function //////////////////////////////////////////////////
			mapClickFunction: function(t){
				t.map.on('click',function(c){
					t.obj.pnt = c.mapPoint;
					t.clicks.mapClickQuery(t,t.obj.pnt); // call t.mapClickQuery function
				});
			},
			// map click query function /////////////////////////////////////////////////////////////////////
			mapClickQuery: function(t, p){
				// query layer array, the layers here get queried.
				t.queryLayers = [6,8,9,10]
				// loop through all the query layers and query each one if they are viz.
				$.each(t.queryLayers,function(i,v){
					let index = t.obj.visibleLayers.indexOf(v);
					// test to see if one of the query layers is in the visible layers array
					if (index > -1){
						// adjust the tolerance of the point click
						var centerPoint = new esri.geometry.Point(p.x,p.y,p.spatialReference);
						var mapWidth = t.map.extent.getWidth();
						var mapWidthPixels = t.map.width;
						var pixelWidth = mapWidth/mapWidthPixels;
						// change the tolerence below to adjust how many pixels will be grabbed when clicking on a point or line
						var tolerance = 5 * pixelWidth;
						var pnt = p;
						var ext = new esri.geometry.Extent(1,1, tolerance, tolerance, p.spatialReference);
						// query for the fish passage points click ///////////////////////////////
						t.q = new Query();
						t.qt = new QueryTask(t.url + "/" + v);
						t.q.geometry = ext.centerAt(centerPoint);;
						t.q.returnGeometry = true;
						t.q.outFields = ["*"];
						// query the map on click
						t.qt.execute(t.q, function(evt){
							if(evt.features.length > 0){
								console.log(evt, v)
							}
						})
					}
				})

				t.layerDefinitions = [];
				
				// // wetland click query /////////////////////////////////////////////////////////////////
				// let wetlandIndex = t.obj.visibleLayers.indexOf(t.wetlands);
				// if (wetlandIndex > -1){
				// 	t.qw = new Query();
				// 	t.qtw = new QueryTask(t.url + "/" + t.wetlandsSel);
				// 	t.qw.geometry = p;
				// 	t.qw.returnGeometry = true;
				// 	t.qw.outFields = ["*"];
				// 	// query the map on click
				// 	t.qtw.execute(t.qw, function(evt){
				// 		if (evt.features.length > 0) {
				// 			// push wetland selected layer to visible layers array
				// 			if(t.obj.visibleLayers.indexOf(t.wetlandsSel) > -1){
				// 				'do nothing'
				// 			}else{
				// 				t.obj.visibleLayers.push(t.wetlandsSel);
				// 			}
				// 			// create the fish where clause to be used for the survey point seleceted feature
				// 			t.obj.wetlandOID = evt.features[0].attributes.OBJECTID;
				// 			t.obj.wetlandWhere = "OBJECTID = " + t.obj.wetlandOID;
				// 			// set layer deffs
				// 			t.layerDefinitions[t.wetlandsSel] = t.obj.wetlandWhere;
				// 			t.dynamicLayer.setLayerDefinitions(t.layerDefinitions);
				// 		}else{
				// 			// remove the selected layer if no features were clicked
				// 			let index = t.obj.visibleLayers.indexOf(t.wetlandsSel)
				// 			if (index > -1) {
				// 				t.obj.visibleLayers.splice(index,1);
				// 			}
				// 		}
				// 		t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				// 	});
				// }

				// // survey rank point click /////////////////////////////////////////////////////////////////////
				// let surveyRankIndex = t.obj.visibleLayers.indexOf(t.surveyRank);
				// if (surveyRankIndex > 0){
				// 	// adjust the tolerance of the point click
				// 	var centerPoint = new esri.geometry.Point(p.x,p.y,p.spatialReference);
				// 	var mapWidth = t.map.extent.getWidth();
				// 	var mapWidthPixels = t.map.width;
				// 	var pixelWidth = mapWidth/mapWidthPixels;
				// 	// change the tolerence below to adjust how many pixels will be grabbed when clicking on a point or line
				// 	var tolerance = 10 * pixelWidth;
				// 	var pnt = p;
				// 	var ext = new esri.geometry.Extent(1,1, tolerance, tolerance, p.spatialReference);
				// 	// query for the fish passage points click ///////////////////////////////
				// 	t.q2 = new Query();
				// 	t.qt2 = new QueryTask(t.url + "/" + t.surveyRank);
				// 	t.q2.geometry = ext.centerAt(centerPoint);;
				// 	t.q2.returnGeometry = true;
				// 	t.q2.outFields = ["*"];
				// 	// query the map on click
				// 	t.qt2.execute(t.q2, function(evt){
				// 		if (evt.features.length > 0){
				// 			// test to see if the survey point selected is already visible
				// 			if(t.obj.visibleLayers.indexOf(t.surveyRankSel) > 0){
				// 				'do nothing'
				// 			}else{
				// 				t.obj.visibleLayers.push(t.surveyRankSel);
				// 				t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				// 			}
				// 			// create the fish where clause to be used for the survey point seleceted feature
				// 			t.obj.fishOID = evt.features[0].attributes.OBJECTID;
				// 			t.obj.fishWhere = "OBJECTID = " + t.obj.fishOID;
							
				// 			// set layer deffs
							
				// 			t.layerDefinitions[t.surveyRankSel] = t.obj.fishWhere;
				// 			t.dynamicLayer.setLayerDefinitions(t.layerDefinitions);
				// 		}else{
				// 			// remove the selected layer if no features were clicked
				// 			let index = t.obj.visibleLayers.indexOf(t.surveyRankSel)
				// 			if (index > -1) {
				// 				t.obj.visibleLayers.splice(index,1);
				// 			}
				// 		}
				// 		t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				// 	});
				// }
				// t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
			},

			// main toggle button function./////////////////////////////////////////////
			toggleFunc: function(t){
				// declare layers for each section
				const aocHabitat = [t.habitatSites];
				const watershedContr = [t.wetlands, t.prwWetlands];
				const fishPassage = [t.surveyRank]
				// check to see if the checkbox is checked
				if(t.currentCheckVal.checked){
					switch(t.currentCheckVal.value){
						case 'wildlife':
							t.obj.visibleLayers = t.obj.visibleLayers.concat(aocHabitat)
							break;
						case 'watershed':
							t.obj.visibleLayers = t.obj.visibleLayers.concat(watershedContr)
							break;
						case 'fish':
							t.obj.visibleLayers = t.obj.visibleLayers.concat(fishPassage)
							break;
						default:
							console.log('none of the cases matched');
					}
				}else{
					switch(t.currentCheckVal.value){
						case 'wildlife':
							t.obj.visibleLayers = t.obj.visibleLayers.filter(function(x){
								return aocHabitat.indexOf(x) < 0;
							})
							break;
						case 'watershed':
							t.obj.visibleLayers = t.obj.visibleLayers.filter(function(x){
								return watershedContr.indexOf(x) < 0;
							})
							let waterIndex = t.obj.visibleLayers.indexOf(t.wetlandsSel);
							if (waterIndex > -1) {
								t.obj.visibleLayers.splice(waterIndex,1);
							}
							break;
						case 'fish':
							// remove the fish passage layers if checkboxes is unchecked
							t.obj.visibleLayers = t.obj.visibleLayers.filter(function(x){
								return fishPassage.indexOf(x) < 0;
							})
							// remove the selected layer if its there
							let index = t.obj.visibleLayers.indexOf(t.surveyRankSel);
							if (index > -1) {
								t.obj.visibleLayers.splice(index,1);
							}
							break;
						default:
							console.log('none of the cases matched');
					}
				}
				// set the visible layers
				t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
			},
			makeVariables: function(t){
				t.aoc = 3;
				t.lowerFoxBound = 4;
				t.countyBounds = 5;
				t.surveyRank = 6;
				t.otherSurvey = 7;
				t.habitatSites = 8;
				t.wetlands = 9;
				t.prwWetlands = 10;
				t.wetlandsBord = 11;
				t.prwWetlandsBord = 12;
				t.kepBound = 13;

				t.surveyRankSel = 2;
				t.wetlandsSel= 1;
				t.habitatSel = 0;
			},
			commaSeparateNumber: function(val){
				while (/(\d+)(\d{3})/.test(val.toString())){
					val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
				}
				return val;
			},
			abbreviateNumber: function(num) {
			    if (num >= 1000000000) {
			        return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
			     }
			     if (num >= 1000000) {
			        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
			     }
			     if (num >= 1000) {
			        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
			     }
			     return num;
			}
        });
    }
);
