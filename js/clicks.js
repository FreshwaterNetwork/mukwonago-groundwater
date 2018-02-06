define([
	"dojo/_base/declare", "esri/tasks/query", "esri/tasks/QueryTask"
],
function ( declare, Query, QueryTask ) {
        "use strict";

        return declare(null, {
			eventListeners: function(t){
				$( function() {
				    $("#" + t.id + "tabs" ).tabs();
				  } );
				// call the map click function at the start to load it
				if(t.obj.stateSet != 'yes'){
					t.obj.layerDefinitions = [];
					t.obj.mainCheckArray = [];
					t.obj.supCheckArray = [];
					t.obj.wetlandTableObject = [];
				}
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
				$('#' + t.id + 'mainRadioBtns .aoc-mainCB input').on('click',function(c){
					let val = c.currentTarget.value;
					t.currentCheckVal = c.currentTarget;
					const sections = $(".aoc-contentBelowHeader .aoc-mainSection");
					// call the toggle function
					t.clicks.toggleFunc(t)
					// check to see if any radio button is checked and slide down div below header
					if($('#' + t.id + 'mainRadioBtns .aoc-mainCB input').is(":checked")){
						$('#' + t.id + 'contentBelowHeader').slideDown()
					}else{ // else slide up the div
						$('#' + t.id + 'contentBelowHeader').slideUp()
					}
					// if state set = yes
					if(t.obj.stateSet != 'yes'){
						// create an array that has the values of each checkbox that is checked for save and share
						t.obj.mainCheckArray = [];
						$.each($('#' + t.id + 'mainRadioBtns .aoc-mainCB input'),function(i,v){
							// call the map click function at the start to load it
							if(v.checked == true){
								t.obj.mainCheckArray.push(v.value);
							}else{
								var index = t.obj.mainCheckArray.indexOf(v.value)
								if(index > -1){
									t.obj.mainCheckArray.splice(index, 1);
								}
							}
						})
					}
				});
				// checkboxes for selectable layers ////////////////////////////////////////////////////
				$('#' + t.id + 'selectableLayersWrapper input').on('click',function(c){
					let val = parseInt(c.currentTarget.value.split('-')[1]);
					if(c.currentTarget.checked){
						t.obj.visibleLayers.push(val)
					}else{
						let index = t.obj.visibleLayers.indexOf(val)
						t.obj.visibleLayers.splice(index,1);
					}
					// set the visible layers
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				})
				// checkboxes for suplementary data ///////////////////////////////////////////////////
				$('#' + t.id + 'supData input').on('click',function(c){
					console.log(c,'c');
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
					// if not state set
					if(t.obj.stateSet != 'yes'){
						// create an array that has the values of each checkbox that is checked for save and share
						t.obj.supCheckArray = [];
						$.each($('#' + t.id + 'supData input'),function(i,v){
							// call the map click function at the start to load it
							if(v.checked == true){
								t.obj.supCheckArray.push(v.value);
							}else{
								var index = t.obj.supCheckArray.indexOf(v.value)
								if(index > -1){
									t.obj.supCheckArray.splice(index, 1);
								}
							}
						})
					}
				});
				// table row click function
				$('#' + t.id + ' .aoc-tableRow').on('click',function(c){
					console.log('look here', c);
				})
				$('.aoc-tableRow').on('click',function(c){
					console.log('look here', c);
				})
			}, 

			// map click functionality call the map click query function //////////////////////////////////////////////////
			mapClickFunction: function(t){
				// wetland array of ids
				t.wetlandIDArray = [];
				t.obj.wetQuery = '';
				t.map.on('click',function(c){
					t.obj.pnt = c.mapPoint;
					t.clicks.mapClickQuery(t,t.obj.pnt); // call t.mapClickQuery function
				});
			},
			// map click query function /////////////////////////////////////////////////////////////////////
			mapClickQuery: function(t, p){
				t.attsArray = [];
				// console.log(t.obj.visibleLayers);
				// function firstFunction(){
				// 	console.log('start of first')
				// 	t.barriorsAtts = '';
				// 	t.habitatAtts = '';

				// 	var centerPoint = new esri.geometry.Point(t.obj.pnt.x,t.obj.pnt.y,t.obj.pnt.spatialReference);
				// 	var mapWidth = t.map.extent.getWidth();
				// 	var mapWidthPixels = t.map.width;
				// 	var pixelWidth = mapWidth/mapWidthPixels;
				// 	// change the tolerence below to adjust how many pixels will be grabbed when clicking on a point or line
				// 	var tolerance = 10 * pixelWidth;
				// 	var pnt = t.obj.pnt;
				// 	var ext = new esri.geometry.Extent(1,1, tolerance, tolerance, t.obj.pnt.spatialReference);

				// 	// 
				// 	t.q = new Query();
				// 	t.qt = new QueryTask(t.url + "/" + 3);
				// 	t.q.geometry = ext.centerAt(centerPoint);
				// 	// t.q.returnGeometry = true;
				// 	t.q.outFields = ["*"];
				// 	let index = t.obj.visibleLayers.indexOf(7);
				// 	if (index > -1) {
				// 		console.time('testTimer');
				// 		t.qt.execute(t.q);
				// 	}
					
				// 	t.qt.on('complete', function(evt){
				// 		console.timeEnd('testTimer');
				// 		if(evt.featureSet.features.length > 0){
				// 			// console.log('fish')
				// 			t.barriorsAtts = evt;
				// 		}
						
				// 	})
					
				// }


				function barriorQuery(){
					var centerPoint = new esri.geometry.Point(t.obj.pnt.x,t.obj.pnt.y,t.obj.pnt.spatialReference);
					var mapWidth = t.map.extent.getWidth();
					var mapWidthPixels = t.map.width;
					var pixelWidth = mapWidth/mapWidthPixels;
					// change the tolerence below to adjust how many pixels will be grabbed when clicking on a point or line
					var tolerance = 10 * pixelWidth;
					var pnt = t.obj.pnt;
					var ext = new esri.geometry.Extent(1,1, tolerance, tolerance, t.obj.pnt.spatialReference);

					// 
					t.q = new Query();
					t.qt = new QueryTask(t.url + "/" + 3);
					t.q.geometry = ext.centerAt(centerPoint);
					// t.q.returnGeometry = true;
					t.q.outFields = ["*"];
					let index = t.obj.visibleLayers.indexOf(7);
					if (index > -1) {
						// console.time('testTimer');
						t.qt.execute(t.q);
					}
					
					t.qt.on('complete', function(evt){
						// console.timeEnd('testTimer');
						if(evt.featureSet.features.length > 0){
							// console.log('fish')
							t.attsArray[0] = evt;
						}else{
							t.attsArray[0] = '';
						}
						
					})
				}
				function habitatQuery(){
					// habitat query
					t.q = new Query();
					t.qt = new QueryTask(t.url + "/" + 0);
					t.q.geometry = p;
					// t.q.returnGeometry = true;
					t.q.outFields = ["*"];
					let index2 = t.obj.visibleLayers.indexOf(8);
					if (index2 > -1) {
						console.time('testTimer 2');
						t.qt.execute(t.q);
					}
					
					t.qt.on('complete', function(evt){
						console.timeEnd('testTimer 2');
						// console.log(evt)
						if(evt.featureSet.features.length > 0){
							console.log('look ttt')
							t.attsArray[1] = evt;
							console.log(t.habitatAtts);
							wetlandQuery();
						}else{
							t.attsArray[1] = '';
							wetlandQuery();
						}
						
					})
				}

				function wetlandQuery(){
					// habitat query
					t.q = new Query();
					t.qt = new QueryTask(t.url + "/" + 2);
					t.q.geometry = p;
					// t.q.returnGeometry = true;
					t.q.outFields = ["*"];
					let index2 = t.obj.visibleLayers.indexOf(8);
					if (index2 > -1) {
						// console.time('testTimer 2');
						t.qt.execute(t.q);
					}
					
					t.qt.on('complete', function(evt){
						// console.timeEnd('testTimer 2');
						// console.log(evt)
						if(evt.featureSet.features.length > 0){
							// console.log('look ttt')
							t.attsArray[2] = evt;
							// console.log(t.habitatAtts);
							endofQuery();
						}else{
							t.attsArray[2] = '';
							endofQuery();
						}
						
					})
				}

				function endofQuery(){
					console.log('end of query called');
					console.log(t.wetlandAtts, t.habitatAtts)
				}
				habitatQuery();
				// function test1(callback){
				// 	console.log('start')
				// 	// habitat query
				// 		t.q = new Query();
				// 		t.qt = new QueryTask(t.url + "/" + 0);
				// 		t.q.geometry = p;
				// 		// t.q.returnGeometry = true;
				// 		t.q.outFields = ["*"];
				// 		let index2 = t.obj.visibleLayers.indexOf(8);
				// 		if (index2 > -1) {
				// 			console.time('testTimer 2');
				// 			t.qt.execute(t.q);
				// 		}
						
				// 		t.qt.on('complete', function(evt){
				// 			console.timeEnd('testTimer 2');
				// 			// console.log(evt)
				// 			if(evt.featureSet.features.length > 0){
				// 				console.log('look ttt')
				// 				t.habitatAtts = evt;
				// 				console.log(t.habitatAtts);
				// 			}
							
				// 		}, function(){console.log('test')})
				// 	callback();
				// }
				// test1(function(){
				// 	console.log('finished');
				// 	console.log(t.habitatAtts);
				// })



				// function test1(){
				// 	var deff = $.Deferred();
				// 	console.log('inside')
				// 	// habitat query
				// 	t.q = new Query();
				// 	t.qt = new QueryTask(t.url + "/" + 0);
				// 	t.q.geometry = p;
				// 	// t.q.returnGeometry = true;
				// 	t.q.outFields = ["*"];
				// 	let index2 = t.obj.visibleLayers.indexOf(8);
				// 	if (index2 > -1) {
				// 		console.time('testTimer 2');
				// 		t.qt.execute(t.q);
				// 	}
					
				// 	t.qt.on('complete', function(evt){
				// 		console.timeEnd('testTimer 2');
				// 		// console.log(evt)
				// 		if(evt.featureSet.features.length > 0){
				// 			console.log('look ttt')
				// 			t.habitatAtts = evt;
				// 			console.log(t.habitatAtts);
				// 		}
						
				// 	})
				// 	// _callback();
				// 	return deff.promise();
				// }

				// function test2(){
				// 	var promise = test1();
				// 	console.log('inside 2');
				// 	promise.then(function(result){
				// 		console.log(result);
				// 	})
				// 	console.log(t.habitatAtts);
				// 	// console.log('test 2')
				// 	// test1(function(){
				// 	// 	console.log('inside test 1 ')
				// 	// })
				// }
				// test2();

				// setTimeout(function secondFunction(){
				// 	console.log('start of second')
				// 	// console.log('look here')
				// 	// firstFunction();
				// 	// console.log('after first');
				// 	console.log(t.habitatAtts, t.barriorsAtts);
				// },2000)
				// secondFunction();
				// console.log(t.habitatAtts, t.barriorsAtts);
				// $.when(firstFunction()).then(secondFunction())
				// // the array controls which layers get queried 
				// let array = [3,0,2];
				// t.featLength = false;
				// console.log(t.featLength);
				
				// // console.log('in if')
				// // loop through the array
				// $.each(array,function(i,v){
				// 	// console.log('at the top')
				// 	t.q = new Query();
				// 	t.qt = new QueryTask(t.url + "/" + v);
				// 	t.q.geometry = p
				// 	// t.q.returnGeometry = true;
				// 	t.q.outFields = ["*"];
					
				// 	console.log(t.featLength);
				// 	if(!t.featLength){
				// 		t.qt.execute(t.q);
				// 		console.log('look here')
				// 		// on query complete
				// 		t.qt.on('complete', function(evt){
				// 			if(evt.featureSet.features.length > 0){
				// 				console.log('break')
				// 				t.featLength = true;
				// 			}
				// 		})
				// 	}
					
				// })
				
				// // loop through the array
				// $.each(array,function(i,v){
				// 	console.log('at the top')
				// 	t.q = new Query();
				// 	t.qt = new QueryTask(t.url + "/" + v);
				// 	t.q.geometry = p
				// 	// t.q.returnGeometry = true;
				// 	t.q.outFields = ["*"];
				// 	t.qt.execute(t.q);
				// 	// on query complete
				// 	t.qt.on('complete', function(evt){
				// 		if(evt.featureSet.features.length > 0){
				// 			console.log('break')
				// 			t.featLength = 1;

				// 			// return(evt.featureSet.features.length !== 1);
				// 		}
				// 	})
				// })
				
				
				// // run the wetland query if watershed checkbox is checked
				// if($('#' + t.id + 'watershed-option')[0].checked){
				// 	// query for wetlands /////////////////////////////////////////////////////////////////////
				// 	t.q = new Query();
				// 	t.qt = new QueryTask(t.url + "/" + t.wetlandsSel);
				// 	t.q.geometry = p
				// 	t.q.returnGeometry = true;
				// 	t.q.outFields = ["*"];
				// 	// query the map on click
				// 	t.qt.execute(t.q, function(evt){
				// 		if(evt.features.length > 0){
				// 			// slide down the wetland table and slide up the click on map text
				// 			$('#' + t.id + 'wetlandTableWrapper').slideDown();
				// 			$('#' + t.id + 'toggleButtons').slideDown();
				// 			$('#' + t.id + 'clickOnMapText').slideUp();
				// 			// check the appropriate tab based on what was clicked on map

				// 			// only do the below if the array is less than 5 items
				// 			if(t.obj.wetWhereArray.length < 5){
				// 				// set vars
				// 				let id = evt.features[0].attributes.WETLAND_ID
				// 				let atts = evt.features[0].attributes
				// 				var obj  = {WETLAND_TYPE: atts.WETLAND_TYPE, ALL_RANK: atts.ALL_RANK, PR_RANK: atts.PR_RANK, SS_RANK: atts.SS_RANK, FLDP_RANK: atts.FLDP_RANK, TILE_RANK: atts.TILE_RANK, WETLAND_ID: atts.WETLAND_ID}
				// 				t.obj.wetlandTableObject.push(obj);
				// 				// add a new row to the table
				// 				$('#' + t.id + 'wetlandTable').append('<tr class="aoc-tableRow"><td>' + atts.WETLAND_ID + '</td><td>' + atts.WETLAND_TYPE 
				// 					+ '</td><td>' + atts.ALL_RANK + '</td><td>' + atts.SS_RANK + '</td><td>'
				// 					+ atts.PR_RANK +  '</td><td>' + atts.FLDP_RANK + '</td><td>' + atts.TILE_RANK + '</td>' 
				// 					+ '<td class="aoc-tableClose"' + '>' + '&#215;' + '</td></tr>');

				// 				// check to see if the wetland selected layer has been added, only add it once
				// 				let index = t.obj.visibleLayers.indexOf(t.wetlandsSel);
				// 				if(index == -1){
				// 					t.obj.visibleLayers.push(t.wetlandsSel);
				// 					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				// 				}
				// 				// push the id into the wet where query string
				// 				t.obj.wetWhereArray.push(id);
				// 				// build the wet query 
				// 				$.each(t.obj.wetWhereArray,function(i,v){
				// 					if(i == 0){
				// 						t.obj.wetQuery = "WETLAND_ID = " + v;
				// 					}else{
				// 						 t.obj.wetQuery += " OR WETLAND_ID = " + v;
				// 					}
	  	// 						})

	  	// 						// set dynamic layer deffs
				// 				t.obj.layerDefinitions[t.wetlandsSel] = t.obj.wetQuery;
				// 				t.dynamicLayer.setLayerDefinitions(t.obj.layerDefinitions);
				// 				// // close button for tables //////////////
				// 				t.clicks.tableRowClose(t);
				// 				// calculate the number of selected items based on data array
				// 				$(".aoc-selCounter").first().html(t.obj.wetWhereArray.length);
				// 			}
				// 		}
				// 	})
				// }
				
			},

			tableRowClose: function(t){
				// console.log('hey')
				// // close button for tables //////////////
				// $('.aoc-tableClose').on('click',function(c){
				// 	console.log('hey 2')
				// 	// clear the table data row
				// 	$(c.currentTarget).parent().remove();
				// 	// remove the wetland id from the wet where array
				// 	let val = parseInt($(c.currentTarget).parent().children().first().text());
				// 	let index = t.obj.wetWhereArray.indexOf(val);
				// 	if(index > -1){
				// 		t.obj.wetWhereArray.splice(index, 1);
				// 	}
				// 	// loop through and rebuild the wet query based on the wetland where array
				// 	$.each(t.obj.wetWhereArray,function(i,v){
				// 		if(i == 0){
				// 			t.obj.wetQuery = "WETLAND_ID = " + v;
				// 		}else{
				// 			 t.obj.wetQuery += " OR WETLAND_ID = " + v;
				// 		}
				// 	})
				// 	// if the wet where array is empty, that means the last close has been clicked and 
				// 	// we need to remove the wetland sel layer
				// 	if(t.obj.wetWhereArray.length < 1){
				// 		// remove the wetlands tab if nothing is selected
				// 		// slide up the wetland table and slide down the click on map text
				// 		$('#' + t.id + 'wetlandTableWrapper').slideUp();
				// 		$('#' + t.id + 'toggleButtons').slideUp();
				// 		$('#' + t.id + 'clickOnMapText').slideDown();
				// 		// remove the wetlands selected layer from viz layers
				// 		let index = t.obj.visibleLayers.indexOf(t.wetlandsSel);
				// 		if(index > -1){
				// 			t.obj.visibleLayers.splice(index, 1);
				// 		}
				// 	}
				// 	// calculate the number of selected items based on data array
				// 	$(".aoc-selCounter").first().html(t.obj.wetWhereArray.length);
				// 	// update visible layers and set dynamic layer deffs
				// 	t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				// 	t.obj.layerDefinitions[t.wetlandsSel] = t.obj.wetQuery;
				// 	t.dynamicLayer.setLayerDefinitions(t.obj.layerDefinitions);

				// });
				// // close button for tables //////////////
				// $('.aoc-allClose').on('click',function(c){
				// 	// remove wetland selecetd layer from viz layers
				// 	let index = t.obj.visibleLayers.indexOf(t.wetlandsSel);
				// 	if(index > -1){
				// 		t.obj.visibleLayers.splice(index, 1);
				// 	}
				// 	t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				// 	// empty table rows
				// 	$('#' + t.id + 'wetlandTable').find('td').parent().empty();
				// 	// slide up table and toggle buttons
				// 	$('#' + t.id + 'wetlandTableWrapper').slideUp();
				// 	$('#' + t.id + 'toggleButtons').slideUp();
				// 	$('#' + t.id + 'clickOnMapText').slideDown();
				// 	// reset the wetland arrays
				// 	t.obj.wetWhereArray = [];
				// 	t.obj.wetlandTableObject = [];

				// })
			},

			// main toggle button function./////////////////////////////////////////////
			toggleFunc: function(t){
				// declare layers for each section
				const aocHabitat = [t.habitatSites];
				const fishPassage = [t.surveyRank,t.wetlandsFAH , t.prwFAH];
				// show the wetalnd selected layer based on array length
				if(t.obj.wetWhereArray.length > 0){
					t.watershedContr = [t.wetlands, t.prwWetlands, t.siteVisits, t.wetlandsSel];
				}else{
					t.watershedContr = [t.wetlands, t.prwWetlands, t.siteVisits];
				}
				// check to see if the checkbox is checked
				if(t.currentCheckVal.checked){
					switch(t.currentCheckVal.value){
						case 'habitat':
							t.obj.visibleLayers = t.obj.visibleLayers.concat(aocHabitat)
							$.each($('#' + t.id + t.currentCheckVal.value + 'SelectLayersWrapper input'),function(i,v){
								$(v).prop('disabled', false)
							})
							break;
						case 'wetland':
							t.obj.visibleLayers = t.obj.visibleLayers.concat(t.watershedContr)
							$.each($('#' + t.id + t.currentCheckVal.value + 'SelectLayersWrapper input'),function(i,v){
								$(v).prop('disabled', false)
							})
							break;
						case 'fish':
							t.obj.visibleLayers = t.obj.visibleLayers.concat(fishPassage)
							$.each($('#' + t.id + t.currentCheckVal.value + 'SelectLayersWrapper input'),function(i,v){
								$(v).prop('disabled', false)
							})
							break;
						default:
							console.log('none of the cases matched');
					}
				}else{
					switch(t.currentCheckVal.value){
						case 'habitat':
							t.obj.visibleLayers = t.obj.visibleLayers.filter(function(x){
								return aocHabitat.indexOf(x) < 0;
							})
							$.each($('#' + t.id + t.currentCheckVal.value + 'SelectLayersWrapper input'),function(i,v){
								$(v).prop('disabled', true)
							})
							break;
						case 'wetland':
							t.obj.visibleLayers = t.obj.visibleLayers.filter(function(x){
								return t.watershedContr.indexOf(x) < 0;
							})
							let waterIndex = t.obj.visibleLayers.indexOf(t.wetlandsSel);
							if (waterIndex > -1) {
								t.obj.visibleLayers.splice(waterIndex,1);
							}
							$.each($('#' + t.id + t.currentCheckVal.value + 'SelectLayersWrapper input'),function(i,v){
								$(v).prop('disabled', true)
							})
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
							$.each($('#' + t.id + t.currentCheckVal.value + 'SelectLayersWrapper input'),function(i,v){
								$(v).prop('disabled', true)
							})
							break;
						default:
							console.log('none of the cases matched');
					}
				}
				// slide down the correct 
				// set the visible layers
				t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
			},
			makeVariables: function(t){
				t.aoc = 4;
				t.lowerFoxBound = 5;
				t.countyBounds = 6;
				t.surveyRank = 7;
				t.habitatSites = 8;
				t.siteVisits = 9;
				t.wetlands = 10;
				t.prwWetlands = 11;
				t.wetlandsBord = 12;
				t.prwWetlandsBord = 13;
				t.wetlandsFAH = 14;
				t.prwFAH = 15;
				// sup data
				t.AOCPriorityAreas = 16;
				t.huc12Bounds = 17;
				t.oneidaBound = 18;
				t.kepBound = 19;
				// sel data
				t.surveyRankSel = 3;
				t.wetlandsSel= 2;
				t.wetlandsSubSel = 1;
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
