define([
	"dojo/_base/declare", "esri/tasks/query", "esri/tasks/QueryTask","esri/geometry/Extent", "esri/SpatialReference", "esri/layers/FeatureLayer", "esri/dijit/Search", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol",
	"esri/symbols/SimpleMarkerSymbol", "esri/graphic", "dojo/_base/Color","esri/layers/GraphicsLayer","esri/renderers/SimpleRenderer",'dojo/_base/lang',"dojo/on",'dojo/domReady!'
],
function ( declare, Query, QueryTask,Extent,SpatialReference,FeatureLayer, Search, SimpleLineSymbol, SimpleFillSymbol, SimpleMarkerSymbol, Graphic, Color, GraphicsLayer, SimpleRenderer,lang,on, domReady) {
        "use strict";

        return declare(null, {
			eventListeners: function(t){
				//t.addShapefile.testFunction(t);
				// t.addShapefile.uploadShapefile(t);
				//info accord
				$( function() {
					$( "#" + t.id + "infoAccord" ).accordion({heightStyle: "fill"});
					$( '#' + t.id + 'infoAccord > div' ).addClass("accord-body");
					$( '#' + t.id + 'infoAccord > h3' ).addClass("accord-header"); 
				});
				// main accord
				$( function() {		
					$( "#" + t.id + "mainAccord" ).accordion({heightStyle: "fill"});
					$( '#' + t.id + 'mainAccord > div' ).addClass("accord-body");
					$( '#' + t.id + 'mainAccord > h3' ).addClass("accord-header");
				});
				// update accordians on window resize
				var doit;
				$(window).resize(function(){
					clearTimeout(doit);
					doit = setTimeout(function() {
						t.clicks.updateAccord(t);
					}, 100);
				});	
				// leave help button
				$('#' + t.id + 'getHelpBtn').on('click', function(c){
					$('#' + t.id + ' .wfa-wrap').show()
					$('#' + t.id + ' .wfa-help').hide()
				});

				// info icon clicks
				$('#' + t.id + ' .infoIcon').on('click',function(c){
					let helpText = $('#' + c.currentTarget.id).parent().next();
					// let helpText = $('#' + c.currentTarget.id).parent().find('.wfa-helpText');
					if(helpText.is(":visible")){
						helpText.slideUp();
					}else{
						helpText.slideDown();
					}
				});
				// suppress help on startup click
				$('#' + t.id + '-shosu').on('click',function(c){
					if (c.clicked == true){
						t.app.suppressHelpOnStartup(true);
					}else{
						t.app.suppressHelpOnStartup(false);
					}
				})
				// tab button listener
				$( "#" + t.id + "tabBtns input").on('click',function(c){
					t.obj.active = c.target.value;
					$.each($("#" + t.id + " .wfa-sections"),function(i,v){
						if (v.id != t.id + t.obj.active){
							$("#"+ v.id).slideUp();
						}else{
							$("#"+ v.id).slideDown();
						}
					});
					if(t.obj.active == 'wfa-showInfo' || t.obj.active == 'wfa-downloadData'){
						$("#"+ t.id + 'wfa-mainContentWrap').slideUp();
					}
				});
// Download HUC 12 data click //////////////////////////////////////////////////////////////////////////////////////////////
				// Data download click
				$('#' + t.id + 'dlBtn').on('click',  function(){
	
					$('#' + t.id + 'dlBtn').find('span').html(t.obj.huc12Name);
					window.open("https://nsttnc.blob.core.windows.net/freshwater-network/wi-wetland-explorer/" + t.obj.huc12Name + "_data.zip", "_parent");
				});	
// Checkboxes for radio buttons ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				// Set selected value text for button clicks
				$( '#' + t.id + 'wfa-findEvalSiteToggle input' ).click(function(c){
					if (c.currentTarget.value == 'find'){
						$( '#' + t.id + 'wfa-eval_WetlandWrap').slideUp()
						$( '#' + t.id + 'wfa-find_WetlandWrap').slideDown()

					}else{
						$( '#' + t.id + 'wfa-eval_WetlandWrap').slideDown()
						$( '#' + t.id + 'wfa-find_WetlandWrap').slideUp()
					}
				});
// Radio button clicks //////////////////////////////////////////////////////////////////////////////////////////////////////////////
				$('.wfa-radio-indent input').on('click',function(c, x){
					t.obj.funcTracker = c.target.value.split("-")[0];
					t.obj.wetTracker = c.target.value.split("-")[0];
					// change the function site services text when radio buttons are clicked.
					$( '#' + t.id + 'siteServices_span').html('(Currently selected: ' + c.target.value + ')');
					t.clicks.controlVizLayers(t, t.obj.maskWhere);
				});
// wildlife checkbox show and hide ///////////////////////////////////////////////////////////////////////////////////////////////////
				// wildlife checkboxes /////////////
				$('#' + t.id + 'wildlifeCheck input').on('click',function(c, x){
					let isChecked = c.currentTarget.checked;
					if(isChecked){
						$('#' + t.id + 'wildlifeRadioButtons').slideDown();
						t.obj.wildlifeCheck = 'wildlife'
						t.clicks.controlVizLayers(t, t.obj.maskWhere);
					}else{
						$('#' + t.id + 'wildlifeRadioButtons').slideUp();
						t.obj.wildlifeCheck = 'null'
						t.obj.visibleLayers2 = []; // empty list of rasters
						t.clicks.controlVizLayers(t, t.obj.maskWhere);
					}
				});
				// wildlife radio buttons /////////////////
				$("#" + t.id + 'wildlifeRadioButtons input').on('click',function(c, x){
					if(this.checked){
						var checkname = $(this).attr("name");
						$("input:checkbox[name='" + checkname + "']").not(this).removeAttr("checked");
					}
					if(c.currentTarget.type == 'checkbox'){
						if(c.currentTarget.checked == true){
							if(c.currentTarget.name == 'prwCheck'){
								t.obj.prwTracker = c.currentTarget.value;
							}else{
								// t.obj.prwTracker = 'null';
								t.obj.wildTracker = c.currentTarget.value;
							}
						}else{
							if(c.currentTarget.name == 'prwCheck'){
								t.obj.prwTracker = 'null';
							}else{
								t.obj.wildTracker = 'null';
							}
						}
					}
					t.clicks.controlVizLayers(t, t.obj.maskWhere);
				});
			},
// Function for clicks on map and zooming /////////////////////////////////////////////////////////////////////////////////////////////
			featureLayerListeners: function(t){
				t.clickCounter = 1;
				// set initial array vars, these will be populated later. 
				// t.obj.hucExps = ['','','',''];
				t.obj.hucExtents[0] = t.obj.dynamicLyrExt
				// t.obj.maskExps = ['OBJECTID < 0','','',''];
				//t.hucAttributesList = [];
				t.layerDefinitions = [];	
				// set the def query for the huc mask /////////////////////	
				t.layerDefinitions[0] =  "WHUC6 < 0";
				//t.maskWhere = "OBJECTID < 0";
				t.dynamicLayer.setLayerDefinitions(t.layerDefinitions);
				// t.obj.currentHuc = '' 
				
				t.open = 'yes';
				// handle map clicks
				t.map.setMapCursor("pointer")
				// call map click function ////////////////////////////////////////////////////////////////////////////////////////
				t.map.on('click',function(c){
					t.obj.search = 'no';
					if (t.open == "yes"){
						// map click point ////////////////////////////////////////
						t.obj.pnt = c.mapPoint;
						t.clicks.mapClickQuery(t,t.obj.pnt); // call t.mapClickQuery function
					}
				});
				t.clicks.hoverGraphic(t,1,t.obj.where)
				t.clicks.searchFunction(t); // call the searchbox init function ///////
				t.clicks.hucZoom(t); // call the huc zoom function
				
				// on search complete function ///////////////
				on(t.search1, 'select-result', function (e) {
					if(e.source.name == "Wetlands"){
						t.obj.wetlandClick = 'yes';
						// t.obj.funcTracker = 'Count of Services ≥ High';
					}
					t.obj.search =  'yes';
					t.obj.pnt = e.result.feature.geometry;
					t.clicks.mapClickQuery(t,t.obj.pnt); // call t.mapClickQuery function
				});
// on state set true /////////////////////////////////////////////////////////////////////////////////////////////////////////////
				if(t.obj.stateSet == "yes"){
					// loop through huc name list and populate the zoom buttons
					$.each(t.obj.hucNames,function(i,v){
						let count = i +=1
						let name = v;
						if(v.length > 0){
							let zoomBtns = $('#' + t.id + 'hucSelWrap').find('.wfa-hucSelWrap');
							$.each(zoomBtns,function(i,v){
								let idIndex = v.id.split('-')[1];
								if(idIndex == 0){
									$(v).children().slideDown();
								}
								if(count == idIndex){
									$(v).children().slideDown();
									$(v).children().children().last().html(name)
								}
							})
						}
					});
					// call functions with inputs from the obj
					t.clicks.hoverGraphic(t, t.obj.visibleLayers[1], t.obj.where);
					t.clicks.controlVizLayers(t, t.obj.maskWhere);
					t.clicks.radioAttDisplay(t);
					// t.clicks.wetlandClick(t);

					// slide and show various elements based on what huc we are in.
					$('#' + t.id + 'watershedHoverText').show()
					$('#' + t.id + 'wfa-findASite').slideUp();
					$('#' + t.id + 'mainFuncWrapper').slideDown();
					$('#' + t.id + 'hucSelWrap').slideDown();
					if(t.obj.currentHuc == 'WHUC8' || t.obj.currentHuc == 'WHUC10'||t.obj.currentHuc == 'WHUC12'){
						$('#' + t.id + 'wildlifeCheckWrap').slideDown();
					}
					
					// $('#' + t.id + 'createReportWrapper').slideDown();

					// instantiate the slider bars here ####################
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

					// set map extent and viz layers
					t.map.setExtent(t.fExt, true);
					t.dynamicLayer2.setVisibleLayers(t.obj.visibleLayers2);
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);

					t.obj.stateSet = 'no'; // reset state set back to no

				}
			},
// map click query ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
			mapClickQuery: function(t,p){
				// mask query ////////////////////////
				t.mq = new Query();
				t.maskQ = new QueryTask(t.url + "/" + 0);
				t.mq.geometry = p;
				t.mq.returnGeometry = true;
				t.mq.outFields = ["*"];
				t.mq.where = t.obj.maskWhere
			
				// execute mask function
				t.maskQ.execute(t.mq, function(evt){
					if (evt.features.length > 0){
						t.obj.maskClick = 'yes';
					}else{
						t.obj.maskClick = 'no';
					}
				});
				// query for for the hucs /////////////////////////////////////////////////////////				
// if the user is searching /////////
				if(t.obj.search == 'yes'){
					t.q1 = new Query();
					t.qt1 = new QueryTask(t.url + "/" + 4); // set qt1 let
					t.obj.visibleLayers = [0,4,6,16]
					$('#' + t.id + 'wfa-findASite').slideUp();
					$('#' + t.id + 'mainFuncWrapper').slideDown();
					$('#' + t.id + 'hucSelWrap').slideDown();
					$('#' + t.id + 'wildlifeCheckWrap').slideDown();
					$('#' + t.id + 'createReportWrapper').slideDown();
					t.obj.wildlifeOpenTracker = 'open';
					let zoomBtns = $('#' + t.id + 'hucSelWrap').find('.wfa-hucSelWrap');
					$.each(zoomBtns,function(i,v){
						$(v).children().slideDown(); // slide down all the zoom buttons on search
					});
					// loop through all the other hucs and populate data on search for the hucExtnets
					$.each([1,2,3,4],function(i,v){
						var q1 = new Query();
						var qt1 = new QueryTask(t.url + "/" + (i+1));
						q1.geometry = p;
						q1.returnGeometry = true;
						q1.outFields = ["*"];
						qt1.execute(q1, function(evt){
							t.obj.hucExtents[(i+1)] = evt.features[0].geometry.getExtent();
						});
					});

				}else{
					t.q1 = new Query();
					t.qt1 = new QueryTask(t.url + "/" + t.obj.visibleLayers[1]);
				}
// start of main query ////////////////////////////////////////////
				t.q1.geometry = p;
				t.q1.returnGeometry = true;
				t.q1.outFields = ["*"];
				// t.q1.where = t.obj.where;
				t.qt1.execute(t.q1, function(evt){
					// t.obj.maskClick = 'no';
					if (evt.features.length > 0 && t.obj.maskClick == 'no'){
						// populate the maskExps and hucExps objects after query has been triggered
						if(t.obj.search == 'yes'){
							t.huc6Val = evt.features[0].attributes.WHUC6
							t.huc8Val = evt.features[0].attributes.WHUC8;
							t.huc10Val = evt.features[0].attributes.WHUC10;
							t.huc12Val = evt.features[0].attributes.WHUC12;
							// populate the mask exp array
							t.obj.maskExps = ["OBJECTID < 0", "WHUC6 <>'" + t.huc6Val + "'", "WHUC8 <>'" + t.huc8Val + "'", "WHUC10 <>'" + t.huc10Val + "'", "WHUC12 <>'" + t.huc12Val + "'"];
							// populate the huc exp array 
							t.obj.hucExps = [ "WHUC6 ='" + t.huc6Val + "'", "WHUC6 ='" + t.huc6Val + "'", "WHUC8 ='" + t.huc8Val + "'", "WHUC10 ='" + t.huc10Val + "'"];
							// loop through three times to retreive the names for huc 6, 8, 10 and populate on zoom buttons.
							$.each([1,2,3],function(i,v){
								let count = i +=1
								var hucQT = new QueryTask(t.url + "/" + count);
								var hucQ = new Query();
								hucQ.where = t.obj.hucExps[count];
								hucQ.outFields = ["*"];
								hucQT.execute(hucQ, function(evt){
									// loop through zoom buttons and populate the name.
									let zoomBtns = $('#' + t.id + 'hucSelWrap').find('.wfa-hucSelWrap');
									$.each(zoomBtns,function(i,v){
										let idIndex = v.id.split('-')[1];
										if(count == idIndex){
											$(v).children().children().last().html(evt.features[0].attributes.name)
										}
									})
								})
							});
						}
						// retrieve huc attributes on map click to be used in the huc Attribute functions.
						t.hucAttributes = evt.features[0].attributes;
						t.obj.hucNames.push(t.hucAttributes.name);
						t.fExt = evt.features[0].geometry.getExtent().expand(1);
						if(t.obj.visibleLayers[1] == 1 ){
							t.obj.selHuc = 30;
							t.obj.currentHuc = 'WHUC6' 
							t.hucVal  = evt.features[0].attributes.WHUC6
							t.obj.visibleLayers = [0,2,t.obj.selHuc]
							$('#' + t.id + 'watershedHoverText').show();
							$('#' + t.id + 'wetlandHoverText').hide();
						}else if(t.obj.visibleLayers[2] > 4 && t.obj.visibleLayers[2] < 26){
							t.obj.currentWet = 'wetland' // this is a wetland click
							if(t.obj.search == 'yes'){
								t.obj.currentHuc = 'WHUC12';
								t.hucVal  = evt.features[0].attributes.WHUC12
							}
							$('#' + t.id + 'mainAttributeWrap').slideDown();
							// $('#' + t.id + 'createReportWrapper').slideDown(); // slide down report button
							$('#' + t.id + 'watershedHoverText').hide();
							
						}else if(t.obj.visibleLayers[1] == 2 ){
							t.obj.selHuc = 31;
							t.obj.currentHuc = 'WHUC8';
							t.hucVal  = evt.features[0].attributes.WHUC8
							t.obj.wildlifeOpenTracker = 'open';
							t.obj.visibleLayers = [0,3,t.obj.selHuc]
							// slide down wildlife checkbox
							$('#' + t.id + 'wildlifeCheckWrap').slideDown();
							//t.hucAttributesList[0] = t.hucAttributes;
						}else if(t.obj.visibleLayers[1] == 3 ){
							//t.hucAttributesList[1] = t.hucAttributes;
							t.obj.selHuc = 32;
							t.obj.currentHuc = 'WHUC10'
							t.hucVal  = evt.features[0].attributes.WHUC10
							t.obj.visibleLayers = [0,4,t.obj.selHuc]
							$('#' + t.id + 'createReportWrapper').slideUp(); // slide up report button
							$('#' + t.id + 'downloadDataWrapper').slideUp(); // slide down report button
						}else if(t.obj.visibleLayers[1] == 4 ){
							t.obj.selHuc = 33;
							t.obj.currentHuc = 'WHUC12';
							t.hucVal  = evt.features[0].attributes.WHUC12
							t.obj.huc12Name = evt.features[0].attributes.name
							t.obj.visibleLayers = [0,4,6,16]
							$('#' + t.id + 'mainAttributeWrap').slideUp();
							$('#' + t.id + 'wetlandHoverText').show();
							// $('#' + t.id + 'createReportWrapper').slideDown(); // slide down report button
							$('#' + t.id + 'downloadDataWrapper').slideDown(); // slide down report button
							$('#' + t.id + 'dlBtn').find('span').html(t.obj.huc12Name);

						}
						// set the def query for the huc mask /////////////////////	
						if(t.obj.currentHuc != 'WHUC12'){
							t.obj.where = t.obj.currentHuc + " = '" + t.hucVal + "'";
						}else{
							t.obj.where = t.obj.currentHuc + " = '" + 9999 + "'";
						}				
						t.obj.maskWhere = t.obj.currentHuc + " <> '" + t.hucVal + "'";
						// add the expression and extents in the approriate location in the huc expression tracker array. 
						var name = evt.features[0].attributes.name;
						// change the extent if current wet does not = wetland
						if(t.obj.currentWet != 'wetland'){
							t.map.setExtent(t.fExt, true); // only change the extent if the wetlands are not displayed
						}
						if(t.obj.currentHuc != 'WHUC12'){
							t.obj.hucExps[(t.obj.visibleLayers[1]-1)] = t.obj.where;
							t.obj.maskExps[(t.obj.visibleLayers[1]-1)] = t.obj.maskWhere;
							t.obj.hucExtents[(t.obj.visibleLayers[1]-1)] = t.fExt;
							if(t.obj.currentHuc == "WHUC6"){
								$('#' + t.id + t.obj.currentHuc + '-selText').parent().prev().children().slideDown();
								$('#' + t.id + 'mainFuncWrapper').slideDown();
								$('#' + t.id + 'hucSelWrap').slideDown();
								$('#' + t.id + 'wfa-findASite').slideUp();
							}else{
								// only slide down if its beyond the huc 6 level
								$('#' + t.id + 'mainAttributeWrap').slideDown();
							}
							// save state
							if(t.obj.stateSet == 'yes'){
								$('#' + t.id + 'mainFuncWrapper').slideDown();
								$('#' + t.id + 'hucSelWrap').slideDown();
								$('#' + t.id + 'wfa-findASite').slideUp();
							}
							// slide down the huc selected text area and populate
							$('#' + t.id + t.obj.currentHuc + '-selText').parent().children().slideDown();
							$('#' + t.id + t.obj.currentHuc + '-selText').parent().find('span').last().html(name);
						}else{
							// slide up the huc selected text area and populate
							$('#' + t.id + t.obj.currentHuc + '-selText').parent().prev().children().slideDown();
							$('#' + t.id + t.obj.currentHuc + '-selText').parent().find('span').last().html(name);
							$('#' + t.id + t.obj.currentHuc + '-selText').slideDown();
						}
// Call the functions at the end of map click /////////////////////////////////////////////////////////////////
						// call the hover graphic function ////////////////////////////
						t.clicks.hoverGraphic(t, t.obj.visibleLayers[1], t.obj.where)
						// call the wetland click function ////////////////////////////
						t.clicks.wetlandClick(t);
					}
				}) // end of main map click query
			},
// Radio/attribute display function //////////////////////////////////////////////////////////////////////////////////////
			radioAttDisplay: function(t){
				// if (t.obj.currentWet != 'wetland'){
				// 	t.radAttVal = 'huc' // value should be what you want to slide up
				// }else{
				// 	t.radAttVal = 'wet' // value should be what you want to slide up
				// }
				// attribute control //////////////////////////////
				var attributes = $('#' + t.id + 'wfa-fas_AttributeWrap').find('.wfa-sum-wrap');
				$.each(attributes,function(i,v){
					if(t.obj.wetlandClick == 'yes'){
						t.radAttVal = 'huc';
					}else{
						t.radAttVal = 'wet';
					}
					if($(v).data().wfaMode == t.radAttVal){
						$(v).slideUp();
					}else{
						$(v).slideDown();
					}
					if (t.radAttVal == 'wet') {
						$('#' + t.id + 'mainAttributeWrap').slideUp();
						
					}
				});
				// radio buttons controls //////////////////////////////
				var radioBtns = $('#' + t.id + 'funcWrapper').find('label');
				$.each(radioBtns,function(i,v){
					if(t.obj.currentHuc == 'WHUC12'){
						t.radAttVal = 'huc'
					}
					if($(v).data().wfaMode == t.radAttVal){
						$(v).slideUp();
					}else{
						$(v).slideDown();
					}
				});
			},
// Huc click function //////////////////////////////////////////////////////////////////////////////////////////////////////
			hucClick: function(t ,atts, mousePos){
				if(mousePos == 'over'){
					if(t.obj.currentHuc != 'WHUC4'){
						$('#' + t.id + 'mainAttributeWrap').show();
						$('#' + t.id).scrollTop(500) // force a scroll on hover so the user can see the attribute table on small screens
						$('#' + t.id + 'watershedHoverText').hide();
					}
					let attributes = $('#' + t.id + 'wfa-fas_AttributeWrap').find('.elm-title');
					let htmlVal;
					let huc8Colors  = ['rgb(0,109,44)','rgb(44,162,95)', 'rgb(102,194,164)'];
					let huc10Colors  = ['rgb(165,15,21)','rgb(222,45,38)', 'rgb(251,106,74)'];
					let huc12Colors  = ['rgb(37,52,148)','rgb(44,127,184)', 'rgb(65,182,196)'];
					$.each(attributes, function(i,v){
						let attVal;
						try {
		   				    attVal = atts[$(v).data('wfa')];
		   				} catch(err) {
						    '';
						}
						if(attVal == 1){
							htmlVal = 'Most Opportunity'
						}else if(attVal == 2){
							htmlVal = 'Moderate Opportunity'
						}else if(attVal == 3){
							htmlVal = 'Least Opportunity'
						}
						let spanElem = $(v).next().find('.s2Atts').html(htmlVal);
						if(t.obj.currentHuc == 'WHUC6'){
							$(v).parent().find('.wfa-attributePatch').css('background-color', huc8Colors[(attVal-1)])
						}else if(t.obj.currentHuc == 'WHUC8'){
							$(v).parent().find('.wfa-attributePatch').css('background-color', huc10Colors[(attVal-1)])
						}else if(t.obj.currentHuc == 'WHUC10'){
							$(v).parent().find('.wfa-attributePatch').css('background-color', huc12Colors[(attVal-1)])
						}
					});
				}else{
					if(atts ==  undefined){
						if(t.obj.currentHuc != 'WHUC4'){
							$('#' + t.id + 'watershedHoverText').show();
						}
						$('#' + t.id + 'mainAttributeWrap').hide();
					}
				}
			},
			hucZoom: function(t){
				// zoom buttons click //////////////////////////////////////////////////////////////////////////////////////////
				$('.wfa-hucZoom').unbind().on('click',function(c){
					var id = c.currentTarget.id.split('-')[1];
					t.obj.wetlandWhere = "OBJECTID < 0" // reset wetland where tracker
					// reset viz layers on zoom click 
					if(id == 0){
						t.obj.currentHuc = 'WHUC4'
						t.obj.visibleLayers = [0,1]
						$('#' + t.id +'fullExt-selText').slideUp();
						$('#' + t.id + 'mainFuncWrapper').slideUp();
						$('#' + t.id + 'hucSelWrap').slideUp('400', function(){
							t.clicks.hoverGraphic(t,1,t.obj.where)
						});
						$('#' + t.id + 'wfa-findASite').slideDown();
						// slide up attribute wrapper when any zoom button is clicked.
						// $('#' + t.id + 'mainAttributeWrap').slideUp();
						$('#' + t.id + 'wildlifeCheckWrap').slideUp();
						$('#' + t.id + 'watershedHoverText').slideUp();
						$('#' + t.id + 'wetlandHoverText').slideUp();
						t.obj.wildlifeOpenTracker = 'null'
						t.obj.wetlandClick = 'no';
						// reset opacity values.
						t.clicks.opacityReset(t);
					}else if (id == 1){
						t.obj.currentHuc = 'WHUC6'
						t.obj.visibleLayers = [0,2,30];
						// $('#' + t.id + 'mainAttributeWrap').slideUp();
						$('#' + t.id + 'wildlifeCheckWrap').slideUp();
						t.obj.wildlifeOpenTracker = 'null'
						t.obj.wetlandClick = 'no';
					}else if(id == 2){
						t.obj.currentHuc = 'WHUC8'
						t.obj.visibleLayers = [0,3,31];
						t.obj.wetlandClick = 'no';
					}else if(id == 3){
						t.obj.currentHuc = 'WHUC10'
						t.obj.visibleLayers = [0,4,32];
						t.obj.wetlandClick = 'no';
					}
					// reset maskwhere tracker
					t.obj.maskWhere = t.obj.maskExps[id]
					// set map extent on back button click
					// below code is for if the user clicks on the full extent zoom //////////////////////////
					if(id<1){
						t.obj.currentWet = 'null'; // reset this tracker
						t.map.setExtent(t.obj.dynamicLyrExt, true);
						t.obj.where = "OBJECTID > 0";
						// control viz function
						t.clicks.controlVizLayers(t,t.obj.maskWhere);
						$('#' + t.id + 'createReportWrapper').slideUp(); // slide up report button
						$('#' + t.id + 'downloadDataWrapper').slideUp(); // slide down report button
						$('#' + t.id + 'wetlandHoverText').hide();
						//t.clicks.hoverGraphic(t,1,t.obj.where)
					// below code is for if the user clicks on the huc 12 zoom //////////////////////////////
					}else if(id == 4){ // set extent back to huc 12 when the go to button is clicked
						t.obj.currentWet = 'null'; // reset this tracker
						t.map.setExtent(t.obj.hucExtents[4], true); // zoom back to huc 12
						t.obj.maskWhere = "WHUC12 <> '" + t.hucVal + "'";
					// below code is for if the user clicks on the huc 6, 8 , 10 zoom /////////////////////////
					}else{
						t.obj.currentWet = 'null'; // reset this tracker
						// rebuild the extent object so it works in save and share
						let ext = t.obj.hucExtents[id]
						let ext1 = new Extent(ext.xmin, ext.ymin, ext.xmax, ext.ymax, new SpatialReference({ wkid:3857 }) );
						t.map.setExtent(ext1, true);
						// set huc exp on back button click
						t.clicks.hoverGraphic(t,t.obj.visibleLayers[1], t.obj.hucExps[id]);
						// control viz function
						t.clicks.controlVizLayers(t,t.obj.maskWhere);
						$('#' + t.id + 'createReportWrapper').slideUp(); // slide up report button
						$('#' + t.id + 'downloadDataWrapper').slideUp(); // slide down report button
						$('#' + t.id + 'wetlandHoverText').slideUp();
					}
					// call the radio attribute controller function
					t.clicks.radioAttDisplay(t);
					// call the huc click function
					// t.clicks.hucClick(t);
					// Loop through all zoom buttons below the button clicked, slide up. //////////////////////////////
					$.each($('#' + c.currentTarget.id).nextAll().children(),function(i,v){
						$('#' + v.id).slideUp();
					});
				});
			},
// keep the code below for now if we want to revert from hover attribute populate back to click. //////////////////////////////////////////////
				// let attributes = $('#' + t.id + 'wfa-fas_AttributeWrap').find('.elm-title');
				// let htmlVal;
				// let huc8Colors  = ['rgb(112,168,0)','rgb(170,204,102)', 'rgb(240,240,240)'];
				// let huc10Colors  = ['rgb(196,10,10)','rgb(224,132,101)', 'rgb(255,235,214)'];
				// let huc12Colors  = ['rgb(0,57,148)','rgb(85,108,201)', 'rgb(214,214,255)'];
				// $.each(attributes, function(i,v){
				// 	let attTracker;
				// 	if (t.obj.currentHuc == 'WHUC8' ) {
				// 		attTracker = 0;
				// 	}else if (t.obj.currentHuc == 'WHUC10'){
				// 		attTracker = 1;
				// 	}else if (t.obj.currentHuc == 'WHUC12'){
				// 		attTracker = 2;
				// 	}
				// 	// the try catch statement below is used to remove the graphic layer. 
				// 	let attVal;
	 		// 		try {
	   // 				    attVal = t.hucAttributesList[attTracker][$(v).data('wfa')];
	   // 				} catch(err) {
				// 	    '';
				// 	}
				// 	if(attVal == 1){
				// 		htmlVal = 'Most Opportunity'
				// 	}else if(attVal == 2){
				// 		htmlVal = 'Moderate Opportunity'
				// 	}else if(attVal == 3){
				// 		htmlVal = 'Least Opportunity'
				// 	}
				// 	let spanElem = $(v).next().find('.s2Atts').html(htmlVal);
				// 	if(t.obj.currentHuc == 'WHUC8'){
				// 		$(v).parent().find('.wfa-attributePatch').css('background-color', huc8Colors[(attVal-1)])
				// 	}else if(t.obj.currentHuc == 'WHUC10'){
				// 		$(v).parent().find('.wfa-attributePatch').css('background-color', huc10Colors[(attVal-1)])
				// 	}else if(t.obj.currentHuc == 'WHUC12'){
				// 		$(v).parent().find('.wfa-attributePatch').css('background-color', huc12Colors[(attVal-1)])
				// 	}
				// });
// search box function for main search area /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			searchFunction: function(t){
				// search box init //////////////
				var s = t.id +'search1';
				t.search1 = new Search({
					enableButtonMode: false, //this enables the search widget to display as a single button
		            enableLabel: false,
		            enableInfoWindow: false,
		            showInfoWindowOnSelect: false,
		            map: t.map
		        }, s);
		        // initi sources for search 1
		        var sources = t.search1.get("sources");
				// Add the wetlands source 
				sources.push({
		            featureLayer: new FeatureLayer("http://cirrus-web-adapter-241060755.us-west-1.elb.amazonaws.com/arcgis/rest/services/FN_Wisconsin/ScoringExplore_All/MapServer/48"),
		            searchFields: ["wetlandIdString"],
		            displayField: "wetlandIdString",
		            exactMatch: false,
		            outFields: ["wetlandIdString"],
		            name: "Wetlands",
		            placeholder: "ex: 4522416546",
		            maxResults: 6,
		            maxSuggestions: 6,
		            enableSuggestions: true,
		            minCharacters: 0,
		            minScale: 250000
		         });
				// add the huc 12 source
				sources.push({
		            featureLayer: new FeatureLayer("http://cirrus-web-adapter-241060755.us-west-1.elb.amazonaws.com/arcgis/rest/services/FN_Wisconsin/ScoringExplore_All/MapServer/4"),
		            searchFields: ["name"],
		            displayField: "name",
		            exactMatch: false,
		            outFields: ["name"],
		            name: "WHUC 12",
		            placeholder: "ex: Lower Fox",
		            maxResults: 6,
		            maxSuggestions: 6,
		            enableSuggestions: true,
		            minCharacters: 0
		         });
				//Set the sources above to the search widget
         		t.search1.set("sources", sources);
		        // search startup //////////
		        t.search1.startup();
		        // call search populate function
		        //t.clicks.searchPopulate(t);
		        
			},
			
// Wetland click function /////////////////////////////////////////////////////////////////////////////////////////////////
			wetlandClick: function(t){
				// wetland query 
				var wq = new Query();
				var wetQ = new QueryTask(t.url + "/" + 48);
				wq.geometry = t.obj.pnt;
				wq.returnGeometry = true;
				wq.outFields = ["*"];
				wq.where = "OBJECTID > 0"
				wetQ.execute(wq, function(evt){
					if (evt.features.length > 0 && t.obj.currentWet == 'wetland'){
						$('#' + t.id + 'wetlandHoverText').hide();
						if(t.obj.buildReport != 'yes'){
							t.obj.wetlandClick = 'yes'
							var curColors  = ['rgb(237,248,233)', 'rgb(0,109,44)','rgb(49,163,84)', 'rgb(116,196,118)'];
							var potColors = ['rgb(254,229,217)', 'rgb(165,15,21)','rgb(222,45,38)','rgb(251,106,74)'];
							var atts = evt.features[0].attributes;
							// update the attribute colors for wetlands
							var title = $('#' + t.id + 'wfa-fas_AttributeWrap').find('.elm-title');
							var htmlVal;
							$.each(title, function(i,v){
								let attVal = atts[$(v).data('wfa')];
								if(attVal == 0){
									htmlVal = 'Not Applicable'
									t.countVal = '0';
								}else if(attVal == 1){
									htmlVal = 'Very High'
									t.countVal = '7-9'
								}else if(attVal == 2){
									htmlVal = 'High'
									t.countVal = '4-6'
								}else if(attVal == 3){
									htmlVal = 'Moderate'
									t.countVal = '1-3'
								}
								// set the wetland id 
								if($(v).data('wfa') == 'WETLAND_ID'){
									let wetlandVal;
									htmlVal = attVal;
									if(atts.WETLAND_TYPE == 'WWI'){
										wetlandVal = 'Curremt Wetland ID: '
									}else{
										wetlandVal = 'Potentially Restorable Wetland ID: '
									}
									$(v).html(wetlandVal);
								}
								let spanElem = $(v).next().find('.s2Atts').html(htmlVal);
								if(v.innerHTML == 'Count of Services ≥ High:'){
									t.countValue = $('#' + t.id + 'countOptionText').html(t.countVal);
								}
								if(atts.WETLAND_TYPE == 'WWI'){
									$(v).parent().find('.wfa-attributePatch').css('background-color', curColors[attVal])
								}else{
									$(v).parent().find('.wfa-attributePatch').css('background-color', potColors[attVal])
								}
							});
							// set the wetland where clause
							t.wetlandID = atts.OBJECTID;
							t.obj.wetlandWhere = "OBJECTID = " + t.wetlandID;
						}else{
							t.obj.wetlandClick = 'yes'
							// call the function to build the report wetland list
							t.report.populateWetlandList(t, evt);
							
						}
					}else{
						t.obj.wetlandClick = 'no'
						if(t.obj.currentWet == 'wetland'){
							$('#' + t.id + 'wetlandHoverText').show();
						}
					}
					// call the control viz layers function ////////////////////////////////////
					t.clicks.controlVizLayers(t,t.obj.maskWhere);
					// call the radio attribute controller function
					t.clicks.radioAttDisplay(t);
				});
			},
// control visible layers function /////////////////////////////////////////////////////////////////////////////
			controlVizLayers :function(t, maskWhere){
				if (t.obj.currentHuc != 'WHUC4') {
					// manipulate string to the proper format, use the same tracker as for the queries but add 2 unless it is a huc 12
					var curHucNum = t.obj.currentHuc.slice(-1);
					var curHucNum2 = t.obj.currentHuc.slice(0,-1);
					if(t.obj.currentHuc != 'WHUC12'){
						var curHucNum3 = parseInt(curHucNum)  + 2;
					}else{
						var curHucNum3 = parseInt(curHucNum)
					}
					var newHuc = curHucNum2 + curHucNum3;
					newHuc =  newHuc.substring(1);
					var lyrName  = newHuc + ' - ' + t.obj.funcTracker;
					var curWetLyrName = 'Current Wetlands - ' + t.obj.funcTracker;
					var potWetLyrName = 'Potentially Restorable Wetlands - ' + t.obj.funcTracker;
					var wetlandSelected = 'Wetlands - Selected'
					// loop through layers array and see if any layer name matches 
					$.each($(t.layersArray),function(i,v){
						if(lyrName == v.name){
							t.obj.visibleLayers.pop();
							t.obj.visibleLayers.push(v.id);
							if(t.obj.currentHuc == "WHUC12"){
								$.each($(t.layersArray),function(i,v){
									if(curWetLyrName == v.name){
										t.obj.visibleLayers.pop()
										t.obj.visibleLayers.pop()
										t.obj.visibleLayers.push(v.id)
									}
									if(potWetLyrName == v.name){
										t.obj.visibleLayers.push(v.id)
									}
								});
							}
						}
						// handle adding the wetland layers and the wetland selected layer.
						if(t.obj.currentHuc == "WHUC12"){
							// remove wetland layers and wetland selected layers before readding them
							var numArray = [5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25];
							$.each(numArray, function(i,v){
								var index = t.obj.visibleLayers.indexOf(v)
								if(index > -1){
									t.obj.visibleLayers.splice(index,1)
								}
							});
							$.each($(t.layersArray),function(i,v){
								if(curWetLyrName == v.name){
									t.obj.visibleLayers.push(v.id)
									t.obj.currentWetTrack = v.id;
								}
								if(potWetLyrName == v.name){
									t.obj.potWetTrack = v.id;
									t.obj.visibleLayers.push(v.id)
								}
								// add the wetland selected layer
								if(t.obj.wetlandWhere != "OBJECTID < 0"){
									if(wetlandSelected == v.name) {
										t.obj.visibleLayers.push(v.id)
									}
								}
							});
						}
					});
				}
				// call the radio button selector function ////////////////////
				t.clicks.radioSelector(t);
				// set layer defs and update the mask layer /////////////////////
				t.layerDefinitions = [];
				t.layerDefinitions[0] =  maskWhere
				t.layerDefinitions[5] = t.obj.wetlandWhere
				t.dynamicLayer.setLayerDefinitions(t.layerDefinitions);
				// remove the wetland selected layer if not clicked ////////////////////////
				if(t.obj.wetlandClick != 'yes'){
					var index = t.obj.visibleLayers.indexOf(5)
					if(index > -1){
						t.obj.visibleLayers.splice(index,1)
					}
				}
				// update the visible layers  ///////////////////////////
				t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
// show hide the raster wildlife layers if checkbox toggled on THIS IS IN VIZ LAYERS FUNCTION ///////////////////////////////////////////////////////////////////
				if (t.obj.wildlifeCheck == 'wildlife'){
					t.obj.visibleLayers2 = [];
					if(t.obj.wildTracker != 'null'){
						$.each($(t.layersArray),function(i,v){
							if(t.obj.wildTracker == v.name){
								t.obj.visibleLayers2.push(v.id);
							}
						});
					}
					if(t.obj.prwTracker != 'null'){
						$.each($(t.layersArray),function(i,v){
							if(t.obj.prwTracker == v.name){
								t.obj.visibleLayers2.push(v.id);
							}
						});
					}
				}
				if(t.obj.wildlifeOpenTracker != 'open'){
					t.obj.visibleLayers2 = [];
				}
				t.dynamicLayer2.setVisibleLayers(t.obj.visibleLayers2);
				// re add layers to control draw order.
				t.map.addLayer(t.dynamicLayer2);
				t.map.addLayer(t.dynamicLayer);
			},
// radio button tester function, this decides if the radio buttons exist between clicks of HUCs and wetlands	
			radioSelector: function(t){
				// radio buttons controls //////////////////////////////
				var radioBtns = $('#' + t.id + 'funcWrapper').find('input');
				$.each(radioBtns,function(i,v){
					if(v.checked){
						let data = $(v).parent().data().wfaMode
						if(data == 'both'){
							'do nothing'
						}else if(data == 'huc'){
							if(t.obj.currentHuc != 'WHUC12'){
								'do nothing'
							}else{
								$('#' + t.id + 'count-option').prop("checked", true);
								t.obj.funcTracker = 'Count of Services ≥ High'
								t.obj.visibleLayers = [0,4,5,6,16];
							}
						}else if(data == 'wet'){
							if(t.obj.currentHuc != 'WHUC12'){
								$('#' + t.id + 'combined-option').prop("checked", true);
								t.obj.funcTracker = 'Combined Services'
							}else{
								let wetVizLyrs = t.obj.visibleLayers;
								t.wetRadioTracker = v.id
							}
						}
					}
				});
			},
			
// control hover on HUCs ////////////////////////////////////////////////////////////////////////////////////////////////
			hoverGraphic: function(t, lyrNum, where){
				// the try catch statement below is used to remove the graphic layer. 
				try {
				    t.map.removeLayer(t.countiesGraphicsLayer);
				}
				catch(err) {
				    console.log('there is no layer to remove on the first iteration')
				}
// graphics layer hover code below ////////////////////////////////////////////////////////////////////////////////////////////////
				//and add it to the maps graphics layer
				var graphicQuery = new QueryTask(t.url + "/" + lyrNum);
				var gQ = new Query();
				gQ.returnGeometry = true;
				gQ.outFields = ['*'];
				gQ.where =  where;
				graphicQuery.execute(gQ, function(evt){
					t.map.graphics.clear();
		            var highlightSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
		                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
		                  new Color([0, 0, 255]), 1), new Color([125, 125, 125, 0.1]));

		            var symbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
		                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
		                  new Color([255, 255, 255, 0]), 1), new Color([125, 125, 125, 0]));
		            var features = evt.features;
		            t.countiesGraphicsLayer = new GraphicsLayer();
		            //QueryTask returns a featureSet.
		            //Loop through features in the featureSet and add them to the map.
		            var featureCount = features.length;
		            for (var i = 0; i < featureCount; i++) {
		                //Get the current feature from the featureSet.
		                var graphic = features[i]; //Feature is a graphic
		                graphic.setSymbol(symbol);
		                t.countiesGraphicsLayer.add(graphic);
		            }
		            t.map.addLayer(t.countiesGraphicsLayer);
      				t.map.graphics.enableMouseEvents();
      				t.countiesGraphicsLayer.on("mouse-over",function (event) {
		                t.map.graphics.clear();  //use the maps graphics layer as the highlight layer
		                var highlightGraphic = new Graphic(event.graphic.geometry, highlightSymbol);
                		t.map.graphics.add(highlightGraphic);
                		$('#' + t.basinId).html(event.graphic.attributes.name);
						$('#' + t.basinId).show();
						let atts = event.graphic.attributes;
						t.mousePos = 'over'
						t.clicks.hucClick(t, atts, t.mousePos); // call the huc click atts function to populate attribute box
		            });
		            //listen for when map.graphics mouse-out event is fired
		            //and then clear the highlight graphic
		            t.map.graphics.on("mouse-out", function (test) {
		            	let atts;
		            	let array = [];
		                t.map.graphics.clear();
						$('#' + t.basinId).hide()
						t.mousePos = 'out'
						array.push(t.map.graphics.graphics);
						t.clicks.hucClick(t, atts, t.mousePos); // call the huc click atts function to populate attribute box
		            });
		            // t.clicks.hucClick(t, t.atts, t.mousePos); // call the huc click atts function to populate attribute box
				});
			},
// reset opacity values /////////////////////////////////////////////////////////////////////////////////////
			opacityReset: function(t){
				if(t.obj.currentHuc == 'WHUC4'){
					// reset opacity for vector layer
					t.obj.opacityVal = 20;
					t.dynamicLayer.setOpacity(1 - t.obj.opacityVal/100); // reset init opacity
					// reset opacity for raster layer
					t.obj.opacityVal2 = 20;
					t.dynamicLayer.setOpacity(1 - t.obj.opacityVal2/100); // reset init opacity
					// reset slider bar to the approriate place //////////////////
					// $("#slider").slider('value',50);
					// $("#" + t.id +"sldr").slider('value',50)
					// $("#" + t.id +"sldr").val(50)
					// $("#" + t.id +"sldr").trigger('change')
				}
				if(t.obj.currentHuc == 'WHUC6'){
					// reset opacity for vector layer
					t.obj.opacityVal = 20;
					t.dynamicLayer.setOpacity(1 - t.obj.opacityVal/100); // reset init opacity
					// reset opacity for raster layer
					t.obj.opacityVal2 = 20;
					t.dynamicLayer.setOpacity(1 - t.obj.opacityVal2/100); // reset init opacity
					// reset slider bar to the approriate place //////////////////

				}
			},
// Make vars //////////////////////////////////////////////////////////////////////////////////////////////////
			makeVariables: function(t){
				t.wetEnd = 26;
				t.wetStart = 4;
				
			
			},
			updateAccord: function(t){
				var ia = $( "#" + t.id + "infoAccord" ).accordion( "option", "active" );
				$( "#" + t.id +  "infoAccord" ).accordion('destroy');	
				$( "#" + t.id + "infoAccord" ).accordion({heightStyle: "fill"});	
				$( "#" + t.id + "infoAccord" ).accordion( "option", "active", ia );		

				var ma = $( "#" + t.id + "mainAccord" ).accordion( "option", "active" );
				$( "#" + t.id +  "mainAccord" ).accordion('destroy');	
				$( "#" + t.id + "mainAccord" ).accordion({heightStyle: "fill"});	
				$( "#" + t.id + "mainAccord" ).accordion( "option", "active", ma );				
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
