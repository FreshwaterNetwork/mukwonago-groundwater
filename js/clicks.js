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
					let val = c.currentTarget.value;
					t.currentCheckVal = c.currentTarget;
					const sections = $(".aoc-contentBelowHeader .aoc-mainSection");
					// call the toggle function
					t.clicks.toggleFunc(t)
					
					// check to see if any radio button is checked and slide down div below header
					if($('#' + t.id + 'mainRadioBtns input').is(":checked")){
						$('#' + t.id + 'contentBelowHeader').slideDown()
					}else{ // else slide up the div
						$('#' + t.id + 'contentBelowHeader').slideUp()
					}

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
				// wetland array of ids
				t.wetlandIDArray = [];
				t.layerDefinitions = [];
				t.obj.wetWhereArray = [];
				t.obj.wetQuery = '';
				t.map.on('click',function(c){
					t.obj.pnt = c.mapPoint;
					t.clicks.mapClickQuery(t,t.obj.pnt); // call t.mapClickQuery function
				});
			},
			// map click query function /////////////////////////////////////////////////////////////////////
			mapClickQuery: function(t, p){
				// query for wetlands /////////////////////////////////////////////////////////////////////
				t.q = new Query();
				t.qt = new QueryTask(t.url + "/" + t.wetlandsSel);
				t.q.geometry = p
				t.q.returnGeometry = true;
				t.q.outFields = ["*"];
				// query the map on click
				t.qt.execute(t.q, function(evt){
					if(evt.features.length > 0){
						// slide down the wetland table and slide up the click on map text
						$('#' + t.id + 'wetlandTableWrapper').slideDown();
						$('#' + t.id + 'clickOnMapText').slideUp();
						// create a wetland data tab
						
						console.log('the table is open');

						// only do the below if the array is less than 5 items
						if(t.obj.wetWhereArray.length < 5){
							// set vars
							let id = evt.features[0].attributes.WETLAND_ID
							let atts = evt.features[0].attributes
							// add a new row to the table
							$('#' + t.id + 'wetlandTable').append('<tr><td>' + atts.WETLAND_ID + '</td><td>' + atts.WETLAND_TYPE 
								+ '</td><td>' + atts.ALL_RANK + '</td><td>' 
								+ atts.PR_RANK + '</td><td class="aoc-tableClose"' 
								+ '>' + '&#10060' + '</td></tr>');

							// check to see if the wetland selected layer has been added, only add it once
							let index = t.obj.visibleLayers.indexOf(t.wetlandsSel);
							if(index == -1){
								t.obj.visibleLayers.push(t.wetlandsSel);
								t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
							}
							// push the id into the wet where query string
							t.obj.wetWhereArray.push(id);
							// build the wet query 
							$.each(t.obj.wetWhereArray,function(i,v){
								if(i == 0){
									t.obj.wetQuery = "WETLAND_ID = " + v;
								}else{
									 t.obj.wetQuery += " OR WETLAND_ID = " + v;
								}
  							})

  							// set dynamic layer deffs
							t.layerDefinitions[t.wetlandsSel] = t.obj.wetQuery;
							t.dynamicLayer.setLayerDefinitions(t.layerDefinitions);
							// close button for tables //////////////
							$('.aoc-tableClose').on('click',function(c){
								// clear the table data row
								$(c.currentTarget).parent().remove();
								// remove the wetland id from the wet where array
								let val = parseInt($(c.currentTarget).parent().children().first().text());
								let index = t.obj.wetWhereArray.indexOf(val);
								if(index > -1){
									t.obj.wetWhereArray.splice(index, 1);
								}
								// loop through and rebuild the wet query based on the wetland where array
								$.each(t.obj.wetWhereArray,function(i,v){
									if(i == 0){
										t.obj.wetQuery = "WETLAND_ID = " + v;
									}else{
										 t.obj.wetQuery += " OR WETLAND_ID = " + v;
									}
	  							})
	  							// if the wet where array is empty, that means the last close has been clicked and 
	  							// we need to remove the wetland sel layer
	  							if(t.obj.wetWhereArray.length < 1){
	  								console.log('the table is closed')
	  								// remove the wetlands tab if nothing is selected
	  								
	  								// slide up the wetland table and slide down the click on map text
	  								$('#' + t.id + 'wetlandTableWrapper').slideUp();
									$('#' + t.id + 'clickOnMapText').slideDown();
									// remove the wetlands selected layer from viz layers
	  								let index = t.obj.visibleLayers.indexOf(t.wetlandsSel);
	  								if(index > -1){
	  									t.obj.visibleLayers.splice(index, 1);
	  								}
	  							}
	  							// update visible layers and set dynamic layer deffs
	  							t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
								t.layerDefinitions[t.wetlandsSel] = t.obj.wetQuery;
								t.dynamicLayer.setLayerDefinitions(t.layerDefinitions);

							});
							// console.log(t.obj.wetWhereArray.length);
  					// 		if(t.obj.wetWhereArray.length == 0){
  					// 			console.log('the table is closed')
  					// 		}else{
  					// 			console.log('the table is open')
  					// 		}
						}
						// console.log('')
					}
				})
			},

			tableRowClose: function(){

			},

			// main toggle button function./////////////////////////////////////////////
			toggleFunc: function(t){
				console.log('look here')
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
