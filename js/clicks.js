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
					// select a tab button for map selection dynamically on 
					// first cb click and when there is only one cb selected ///////////////////////////
					// on any change of the cb's run the below
					// get a count of checked cb's using is:checked code
					let cbCount = $('#' + t.id + 'mainRadioBtns .aoc-mainCB input:checkbox:checked').length
					// cbCount if less than one 
					if(cbCount === 1){
						let checkedCB = $('#' + t.id + 'mainRadioBtns .aoc-mainCB input:checkbox:checked');
						// get the id of the cb thats checked
						let id  = checkedCB[0].id;
						//  use the id to find the approp tab button and check it
						if(id == t.id + 'fish-option'){
							// force click on tab button
							$('#dijit_layout_ContentPane_0num-8').trigger('click');
						}else if(id == t.id + 'watershed-option'){
							$('#dijit_layout_ContentPane_0num-2').trigger('click');
						}else{
							$('#dijit_layout_ContentPane_0num-0').trigger('click');
						}
					}

					// if state set = yes //////////////////////////////////////////////////////////////
					if(t.obj.stateSet != 'yes'){
						// create an array that has the values of each checkbox that is checked for save and share
						t.obj.mainCheckArray = [];
						$.each($('#' + t.id + 'mainRadioBtns .aoc-mainCB input'),function(i,v){
							// call the map click function at the start to load it
							if(v.checked == true){
								if(v.value == 'wetland'){
									t.obj.mainCheckArray.push(v.value);
									t.obj.mainCheckArray.push('sites');

								}else{
									t.obj.mainCheckArray.push(v.value);
								}
							}else{
								if(v.value == 'wetland'){
									var index = t.obj.mainCheckArray.indexOf(v.value)
									if(index > -1){
										t.obj.mainCheckArray.splice(index, 1);
									}
									var index = t.obj.mainCheckArray.indexOf('sites')
									if(index > -1){
										t.obj.mainCheckArray.splice(index, 1);
									}
								}else{
									var index = t.obj.mainCheckArray.indexOf(v.value)
									if(index > -1){
										t.obj.mainCheckArray.splice(index, 1);
									}
								}
							}
						})
					}
					//loop through the toggle buttons and only show based on what main cb's are checked
					$.each($('#' + t.id + 'mapQueryToggleWrapper input'),function(i,y){
						console.log(y.value)
						let index =  t.obj.mainCheckArray.indexOf(y.value)
						if(index > -1){
							$(y).next().removeClass("aoc-opacity")
							$(y).prop('disabled', false);
						}else{
							$(y).next().addClass("aoc-opacity")
							$(y).prop('disabled', true);
						}
					})
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
					// if not state set ////////////////////////////////////////////////////////////
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
				// map query toggle button function ////////////////////////////
				$('#' + t.id + 'mapQueryToggleWrapper input').on('click',function(c){
					$.each($('#' + t.id + 'mainAttWrapper .aoc-attributeWrapper'),function(c,v){
						$(v).hide();
					})
					console.log('click', c);
					$('#' + t.id + c.currentTarget.value + 'Wrapper').show();
					t.obj.queryTracker = c.currentTarget.id.split("-")[1];
					t.obj.toggleTracker =  c.currentTarget.value;
				})

				// // table row click function////////////////////////////
				// $('#' + t.id + ' .aoc-tableRow').on('click',function(c){
				// 	console.log('look here', c);
				// })
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
				// t.attsArray = ['','',''];

				// if trying to click on a point change the click tolerance
				if(t.obj.queryTracker == 10 || t.obj.queryTracker == 8){
					var centerPoint = new esri.geometry.Point(t.obj.pnt.x,t.obj.pnt.y,t.obj.pnt.spatialReference);
					var mapWidth = t.map.extent.getWidth();
					var mapWidthPixels = t.map.width;
					var pixelWidth = mapWidth/mapWidthPixels;
					var tolerance = 10 * pixelWidth;
					var pnt = t.obj.pnt;
					var ext = new esri.geometry.Extent(1,1, tolerance, tolerance, t.obj.pnt.spatialReference);
					p = ext.centerAt(centerPoint);
				}
				
				// start of query ///////////////////////////////////////////////////////////////////////
				t.q = new Query();
				// use query tracker to create the correct url 
				t.qt = new QueryTask(t.url + "/" + t.obj.queryTracker);
				t.q.geometry = p;
				// t.q.returnGeometry = true;
				t.q.outFields = ["*"];
				// execute query ///////////////////
				if(t.obj.queryTracker){
					t.qt.execute(t.q);
				}	
				t.qt.on('complete', function(evt){
					// attributes vars
					let mapclickText = $('#' + t.id + t.obj.toggleTracker + "Wrapper").find('.aoc-mapClickText');
					let attsSection = $('#' + t.id + t.obj.toggleTracker + "Wrapper").find('.aoc-attributeSections');
					// create a number to base selection layers off of to add and remove selected layers
					if(t.obj.queryTracker == 8){
						t.n = 3
					}else if(t.obj.queryTracker == 10){
						t.n = 4
					}else{
						t.n = t.obj.queryTracker
					}
					if(evt.featureSet.features.length > 0){
						console.log('made it')
						// slide up map click text
						mapclickText.slideUp()
						// slide down attribute section
						attsSection.slideDown()
						// populate attribute section
						// call the attribute populate function
						t.clicks.attributePopulate(t, 'y', t.obj.toggleTracker, evt.featureSet.features[0].attributes);
						// create selection where clause
						switch(t.obj.toggleTracker){
   							case 'habitat':
	   							t.obj.query = "OBJECTID_1 = " + evt.featureSet.features[0].attributes.OBJECTID_1;
	   							break;
	   						case 'wetland':
	   							t.obj.query = "WETLAND_ID = " + evt.featureSet.features[0].attributes.WETLAND_ID;
	   							break;
	   						case 'sites':
	   							t.obj.query = "OBJECTID_1 = " + evt.featureSet.features[0].attributes.OBJECTID_1;
	   							break;
	   						case 'fish':
	   							t.obj.query = "OBJECTID = " + evt.featureSet.features[0].attributes.OBJECTID;
	   							break;
   						}
						// set layer deffs
						t.n = parseInt(t.n); // convert to int
						t.obj.layerDefinitions[t.n] = t.obj.query;
						t.dynamicLayer.setLayerDefinitions(t.obj.layerDefinitions);
						// add layer selection to the map'
						let index = t.obj.visibleLayers.indexOf(t.n)
						if(index < 0){
							t.obj.visibleLayers.push(t.n);
						}
						t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					}else{
						// call the attribute populate function
						t.clicks.attributePopulate(t, 'n', t.obj.toggleTracker);
						// slide up the attributes section
						attsSection.slideUp();
						// slide down click text
						mapclickText.slideDown();
						// remove the layer selection from the map
						let index = t.obj.visibleLayers.indexOf(t.n);
						if (index > -1) {
							t.obj.visibleLayers.splice(index,1);
						}
						t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
						// reset the layer where query
						t.obj.query = '';
					}
				})
			},

			attributePopulate: function(t, suc, track, atts){
				console.log('attributePopulate call', suc, track, atts);
				// figure out which atts need to be created
				switch(track){
					case 'wetland':
						// do somthing for wetland
						console.log('populate attributes for wetlands')
						break;
					case 'sites':

						break;
					case 'habitat':

						break;
					case 'fish':

						break;
					default:
						console.log('none matched')
				}
			},

			// tableRowClose: function(t){
				
			// },

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
								$(v).prop('checked', true)
							})
							break;
						case 'wetland':
							t.obj.visibleLayers = t.obj.visibleLayers.concat(t.watershedContr)
							$.each($('#' + t.id + t.currentCheckVal.value + 'SelectLayersWrapper input'),function(i,v){
								$(v).prop('disabled', false)
								$(v).prop('checked', true)
							})
							break;
						case 'fish':
							t.obj.visibleLayers = t.obj.visibleLayers.concat(fishPassage)
							$.each($('#' + t.id + t.currentCheckVal.value + 'SelectLayersWrapper input'),function(i,v){
								$(v).prop('disabled', false)
								$(v).prop('checked', true)
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
								$(v).prop('checked', false)
							})
							break;
						case 'wetland':
							t.obj.visibleLayers = t.obj.visibleLayers.filter(function(x){
								console.log(t.obj.visibleLayers)
								return t.watershedContr.indexOf(x) < 0;
							})
							let waterIndex = t.obj.visibleLayers.indexOf(t.wetlandsSel);
							console.log(waterIndex);
							if (waterIndex > -1) {
								t.obj.visibleLayers.splice(waterIndex,1);
							}
							let siteIndex = t.obj.visibleLayers.indexOf(t.siteVisitSel);
							console.log(siteIndex);
							if (siteIndex > -1) {
								t.obj.visibleLayers.splice(siteIndex,1);
							}
							$.each($('#' + t.id + t.currentCheckVal.value + 'SelectLayersWrapper input'),function(i,v){
								$(v).prop('disabled', true)
								$(v).prop('checked', false)
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
								$(v).prop('checked', false)
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
				t.aoc = 5;
				t.lowerFoxBound = 6;
				t.countyBounds = 7;
				t.surveyRank = 8;
				t.habitatSites = 9;
				t.siteVisits = 10;
				t.wetlands = 11;
				t.prwWetlands = 12;
				t.wetlandsBord = 13;
				t.prwWetlandsBord = 14;
				t.wetlandsFAH = 15;
				t.prwFAH = 16;
				// sup data
				t.AOCPriorityAreas = 17;
				t.huc12Bounds = 18;
				t.oneidaBound = 19;
				t.kepBound = 20;
				// sel data
				t.siteVisitSel = 4;
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



/// table creation code //////////////////////
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


// table row close code /////////////////
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