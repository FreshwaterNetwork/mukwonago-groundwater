define([
	"dojo/_base/declare", "esri/tasks/query", "esri/tasks/QueryTask"
],
function ( declare, Query, QueryTask ) {
        "use strict";

        return declare(null, {
			eventListeners: function(t){
				// on zoom end turn on layer with and without borders depending on a zoom level scale of 75000 ///////////////
				t.map.on("zoom-end", function(){
					if(t.map.getScale() < 75001){
						t.obj.scale = 'in'
					}else{
						t.obj.scale = 'out'
					}
					t.clicks.toggleFunc(t)
				})
				// Main header toggle button///////////////////////////////////////////
				$('#' + t.id + 'headerToggle input').on('click',function(c){
					let val = c.currentTarget.value
					const sections = $(".aoc-contentBelowHeader .aoc-mainSection")
					$.each(sections, function(i,v){
						if (val == $(v).data().value) {
							$(v).slideDown();
							t.obj.toggleSel = val
							t.clicks.toggleFunc(t)
						}else{
							$(v).slideUp();
						}
					})
				});
			},
			// main toggle button function./////////////////////////////////////////////
			toggleFunc: function(t){
				if (t.obj.toggleSel == 'waterQuality') {
					// see if zoomed in or out and 
					if (t.obj.scale == 'in') {
						t.obj.visibleLayers = [0,1,8,9]
					}else{
						t.obj.visibleLayers = [0,1,6,7]
					}
				}else if(t.obj.toggleSel == 'wildlife'){
					t.obj.visibleLayers = [0,1,5]
				}else{
					''
				}
				t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
			},


			sliderChange: function(e, ui, t){
				// // slider change was mouse-driven
				// if (e.originalEvent) {
				// 	var ben  = e.target.id.split("-").pop()
				// 	t[ben] = "(" + ben + " >= " + ui.values[0] + " AND " + ben + " <= " + ui.values[1] + ")";	
				// 	t.clicks.layerDefs(t);
				// 	console.log("mouse click");
				// }
				// //slider change was programmatic
				// else{
				// 	if (t.obj.stateSet == "no"){
				// 		var ben  = e.target.id.split("-").pop()
				// 		t[ben] = "(" + ben + " >= " + ui.values[0] + " AND " + ben + " <= " + ui.values[1] + ")";	
				// 		t.clicks.layerDefs(t);
				// 		t.clicks.sliderSlide(e, ui, t);
				// 		console.log("programmatic", e.target.id);
				// 	}else{console.log("state set = yes");}
				// }	
			},
			sliderSlide: function(e, ui, t){
				// var sid = e.target.id.split("-");
				// $('#' + t.id + '-' + sid[1] + '-' + sid[2]).parent().prev().find('.blueFont').each(function(i,v){
				// 	if (ui.values[i] > 100000){
				// 		var val = t.clicks.abbreviateNumber(ui.values[i])
				// 	}else{
				// 		var val = t.clicks.commaSeparateNumber(ui.values[i])
				// 	}
				// 	$(v).html(val)
				// })	
			},
			layerDefs: function(t){
				// if (t.obj.stateSet == "no"){
					
				// 	t.obj.exp = [t.NatNotProt, t.RowAgNotProt, t.RowAgProt, t.DevProt, t.FRStruct_TotLoss, t.AGLoss_7, 
				// 				 t.NDelRet, t.Denitrification, t.Reconnection, t.BF_Existing, t.BF_Priority, t.SDM]
				// }
				// var exp = "";
				// var cnt = 0;
				// $.each(t.obj.exp, function(i, v){
				// 	if (v.length > 0){
				// 		cnt = cnt + 1;
				// 	}	
				// });	
				// if (cnt > 0){
				// 	t.obj.exp.unshift(t.obj.ffDef);
				// 	$.each(t.obj.exp, function(i, v){
				// 		if (v.length > 0){
				// 			if (exp.length == 0){
				// 				exp = v;
				// 			}else{
				// 				exp = exp + " AND " + v;
				// 			}	
				// 		}	
				// 	});
				// 	t.layerDefinitions = [];		
				// 	t.layerDefinitions[t.obj.hucLayerSel] = exp;			
				// 	t.dynamicLayer.setLayerDefinitions(t.layerDefinitions);
				// 	t.obj.visibleLayers = [t.obj.hucLayerSel, t.obj.hucLayer];
				// 	t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				// 	var query = new Query();
				// 	var queryTask = new QueryTask(t.url + '/' + t.obj.hucLayerSel);
				// 	query.where = exp;
				// 	queryTask.executeForCount(query,function(count){
				// 		var countWcomma = t.clicks.commaSeparateNumber(count)
				// 		$('#' + t.id + 'mng-act-wrap .fuCount').html(countWcomma); 
				// 	});
				// }else{
				// 	t.obj.visibleLayers = [t.obj.hucLayer];
				// 	t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				// 	$('#' + t.id + 'mng-act-wrap .fuCount').html("0"); 
				// }	
			},
			makeVariables: function(t){
				// t.NatNotProt = "";
				// t.RowAgNotProt = "";
				// t.RowAgProt = "";
				// t.DevProt = "";
				// t.FRStruct_TotLoss = "";
				// t.AGLoss_7 = "";
				// t.NDelRet = "";
				// t.Denitrification = "";
				// t.Reconnection = "";
				// t.BF_Existing = "";
				// t.BF_Priority = "";
				// t.SDM = "";
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
