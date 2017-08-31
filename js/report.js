define([
	"dojo/_base/declare", "esri/tasks/query", "esri/tasks/QueryTask", "esri/layers/FeatureLayer", "esri/dijit/Search", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol",
	"esri/symbols/SimpleMarkerSymbol", "esri/graphic", "dojo/_base/Color","esri/layers/GraphicsLayer","esri/renderers/SimpleRenderer",'dojo/_base/lang',"dojo/on",
	'dojo/domReady!',"dojo/dom", "dojo/dom-style", "esri/dijit/Print","esri/tasks/PrintTemplate", "esri/config", "esri/request","dojo/parser","dojo/_base/array",
],
function ( declare, Query, QueryTask,FeatureLayer, Search, SimpleLineSymbol, SimpleFillSymbol, 
	SimpleMarkerSymbol, Graphic, Color, GraphicsLayer, 
	SimpleRenderer,lang,on, domReady, dom, domStyle, Print, PrintTemplate, esriConfig, esriRequest, parser, arrayUtils
	) {
        "use strict";

        return declare(null, {
			createReport: function(t){
				t.report.printMap(t);
				t.wetlandReportObj = {};
// Build wetland report button ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				$('#' + t.id + 'buildReport').on('click',function(c){
					$('#' + t.id + 'wfa-mainContentWrap').slideUp();
					$('#' + t.id + 'reportWrapper').slideDown();
					t.obj.buildReport = 'yes';
				});
				// back button
				$('#' + t.id + 'buildReportBack').on('click',function(c){
					$('#' + t.id + 'wfa-mainContentWrap').slideDown();
					$('#' + t.id + 'reportWrapper').slideUp();
					t.obj.buildReport = 'no';
					// t.clicks.wetlandClick(t)
				});
// popup for report creation code /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
				$('#' + t.id + 'viewReport').on('click',function(c){
					// let doc = document.getElementById(t.id + 'testModal');
					// doc.showModal();
					t.report.buildReport(t);
					TINY.box.show({
						animate: true,
						url: 'plugins/wetlands-watershed-explorer/html/report.html',
						fixed: true,
						width: 660,
						height: 570
					});
					// let test = dom.byId('testTableId');
					
				});
			},
			populateWetlandList: function(t, evt){
				if(evt.features.length > 0){
					if(t.obj.wetlandListArray.length < 5){
						let wetType = evt.features[0].attributes.WETLAND_TYPE
						let fa = evt.features[0].attributes.FA_RANK
						let ss = evt.features[0].attributes.SS_RANK
						let pr = evt.features[0].attributes.PR_RANK
						let nr = evt.features[0].attributes.NR_RANK
						let sp = evt.features[0].attributes.SP_RANK
						let fah = evt.features[0].attributes.FAH_RANK
						let cs = evt.features[0].attributes.CS_RANK
						let fq = evt.features[0].attributes.FQ_RANK
						let sbs = evt.features[0].attributes.SBS_RANK
						let all = evt.features[0].attributes.ALL_RANK
						// build wetland report object
						t.wetlandReportObj[evt.features[0].attributes.OBJECTID] = {'WETLAND_TYPE': wetType, 
						'FA Rank': fa, 'SS Rank': ss, 'PR Rank': pr, 'NR Rank': nr, 'SP Rank': sp, 'FAH Rank': fah,
						'CS Rank': cs, 'FQ Rank': fq, 'SBS Rank': sbs, 'All Rank': all}


						t.obj.wetlandListArray.push(evt.features[0].attributes.OBJECTID)
						let uniqueNames = [];
						$.each(t.obj.wetlandListArray, function(i, el){
							if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
						})
						t.obj.wetlandListArray = uniqueNames;
						$('#' + t.id + 'wetlandSelectedList').empty();
						$.each(t.obj.wetlandListArray, function(i, el){
							$('#' + t.id + 'wetlandSelectedList').append('<div class="wfa-wetlandSelected">Wetland Id: <span>' +  el + ' </span><a>Remove</a></div>');
						});
					}else{
						'we need to display a message here that too many wetlands have been selected'
					}
					t.report.populateWetlandWhere(t);
				}else{
					'dont do anything'
				}
				// on click remove wetlands from app screen and from array
				$('#' + t.id + 'wetlandSelectedList a').on('click',function(c){
					$(c.currentTarget).parent().remove();
					let index = t.obj.wetlandListArray.indexOf(parseInt($(c.currentTarget).parent().find('span').html()));
					let oid = parseInt($(c.currentTarget).parent().find('span').html());
					delete t.wetlandReportObj[oid] // remove item from object when a wetland is clicked
					if(index > -1){
						 t.obj.wetlandListArray.splice(index, 1);
					}
					t.report.populateWetlandWhere(t);
					t.clicks.controlVizLayers(t,t.obj.maskWhere);
					// update the HTML in the wetland selected counter 
					$('#' + t.id + 'wetlandSelCounter').find('span').first().html(t.obj.wetlandListArray.length);
				});
				// update the HTML in the wetland selected counter 
				$('#' + t.id + 'wetlandSelCounter').find('span').first().html(t.obj.wetlandListArray.length);
			},

			populateWetlandWhere: function(t){
				let whereClause = '';
				$.each(t.obj.wetlandListArray, function(i,v){
					if(i == 0){
						whereClause += "OBJECTID = " + v;
					}else{
						whereClause += " OR OBJECTID = " + v;
					}
				})
				if(t.obj.wetlandListArray.length == 0){
					t.obj.wetlandWhere = "OBJECTID = -1"
					$('#' + t.id + 'viewReportWrapper').slideUp();
				}else{
					t.obj.wetlandWhere = whereClause
					$('#' + t.id + 'viewReportWrapper').slideDown();
				}
			},
			buildReport: function(t){
				// console.log(t.wetlandReportObj);
				// let test = dom.byId('testTableId');
				// console.log(test);
				// // console.log($('.tinner').find('table'))
				// console.log($('.tinner').children().first().children());
				// console.log($('.tinner').html());
				// console.log($('.tbox'));
				// console.log($('.no-js dj_webkit dj_chrome dj_contentbox'));
				// // console.log($(t.report2).find('table'));
				// // console.log($(t.report2).html('<div>Hey look here</div>'));
				// let testHtml = $(t.report2).html('');
				// testHtml[2].append('<tr><td>This is a test</td></tr>')
				// console.log(testHtml[0])
				// console.log($('#lookHere'))
				// // console.log(testHtml[2].html())
				// console.log(testHtml[2])
				// // console.log($('.tinner.table'))
				// // console.log($('#lookHere').html())
				// // $.each(t.wetlandReportObj[0], function(i,v){
				// 	// console.log(v);
				// 	// add a table row here

				// // });
				// $.each(t.wetlandReportObj, function(i,v){
				// 	// console.log(v);
				// 	// add a table row here

				// });

			},
			printMap: function(t){
				// parser.parse();
				// t.printUrl = "https://cirrus-web-adapter-241060755.us-west-1.elb.amazonaws.com/arcgis/rest/services/FN_Wisconsin/ExportWebMap2/GPServer/Export%20Web%20Map"
				// esriConfig.defaults.io.proxyUrl = "/proxy/";

				// t.printInfo = esriRequest({
		  //        	"url": t.printUrl,
		  //         	"content": { "f": "json" }
		  //       });
		  //       console.log('look here 1')
		  //       t.printInfo.then(handlePrintInfo, handleError);
		  //       function handlePrintInfo(resp) {
		  //         var layoutTemplate, templateNames, mapOnlyIndex, templates;

		  //         layoutTemplate = arrayUtils.filter(resp.parameters, function(param, idx) {
		  //         	console.log(param);
		  //           return param.name === "Layout_Template";
		  //         });
		          
		  //         if ( layoutTemplate.length === 0 ) {
		  //           console.log("print service parameters name for templates must be \"Layout_Template\"");
		  //           return;
		  //         }
		  //         templateNames = layoutTemplate[0].choiceList;
		  //         console.log(templateNames)

		  //         // remove the MAP_ONLY template then add it to the end of the list of templates 
		  //         mapOnlyIndex = arrayUtils.indexOf(templateNames, "MAP_ONLY");
		  //         if ( mapOnlyIndex > -1 ) {
		  //           var mapOnly = templateNames.splice(mapOnlyIndex, mapOnlyIndex + 1)[0];
		  //           templateNames.push(mapOnly);
		  //         }
		          
		  //         // create a print template for each choice
		  //         templates = arrayUtils.map(templateNames, function(ch) {
		  //           var plate = new PrintTemplate();
		  //           plate.layout = plate.label = ch;
		  //           plate.format = "PDF";
		  //           plate.layoutOptions = { 
		  //             "authorText": "Made by:  Esri's JS API Team",
		  //             "copyrightText": "<copyright info here>",
		  //             "legendLayers": [], 
		  //             "titleText": "Pool Permits", 
		  //             "scalebarUnit": "Miles" 
		  //           };
		  //           return plate;
		  //         });

		  //         // create the print dijit
		  //         t.printer = new Print({
		  //           "map": t.map,
		  //           url: t.printUrl
		  //         }, dom.byId(t.id + "printButton"));
		  //         t.printer.startup();
		  //       }
		  //       function handleError(err) {
		  //         	console.log("Something broke: ", err);
		  //       }


				// let printUrl = 
				// var printer = new Print({
				//     map: t.map,
				//     url: 'http://cirrus-web-adapter-241060755.us-west-1.elb.amazonaws.com/arcgis/rest/services/FN_Wisconsin/ExportWebMap2/GPServer/Export%20Web%20Map'
				// }, dom.byId( t.id + "printButton"));
				// console.log('before startup')
				// console.log(printer);
				// printer.startup()
			}
		})
	}
)