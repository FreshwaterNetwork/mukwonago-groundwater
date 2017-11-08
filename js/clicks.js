define([
	"dojo/_base/declare", "esri/tasks/query", "esri/tasks/QueryTask"
],
function ( declare, Query, QueryTask ) {
        "use strict";

        return declare(null, {
			eventListeners: function(t){
				console.log(t.obj.visibleLayers)
				var clickCnt = 0;
				// Flood frequency, HUC, and Management Action clicks
				$('#' + t.id + 'top-controls input').on('click',function(c){
					// Update json object
					var rname = $('#' + c.target.id).attr("name")
					var val = c.target.value;
					t.obj[rname] = val;
					// Flood Frequency
					if (rname == "floodFreq"){
						t.obj.ffDef = "( FloodFrequency = '" + val + "' )";
					}
					// HUCs
					if (rname == "huc"){
						var h = val.split(" ").pop();
						$('.h10, .h12').hide();
						$('.h' + h).show();
						$.each(t.layersArray, function(i,v){
							if (v.name == val){
								t.obj.hucLayer = v.id;
								t.obj.hucLayerSel = (v.id - 1)
								t.obj.visibleLayers = [t.obj.hucLayerSel, t.obj.hucLayer];
								t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
							}
						})
					}
					// Management Action
					if (rname == "mngmtAction"){
						$('.mng-act-wrap').slideUp(500,function(){
							$('.mng-act-toggle').hide();
							$('.' + c.target.value).show()
							$('.mng-act-wrap').slideDown(500);	
						});
					}
					if (clickCnt < 2){
						clickCnt = clickCnt + 1
					}else{
						// Set definition expressions for visible and enable sliders
						$.each($('#' + t.id + 'mng-act-wrap .slider'),function(i,v){
							var idArray = v.id.split("-")
							var h = t.obj.huc.split(" ").pop();
							var ben  = v.id.split("-").pop();
							if (idArray[1] == h){
								if ( $('#' + v.id).parents('.' + t.obj.mngmtAction).length ){
									var dis = $('#' + v.id).slider("option", "disabled");
									if (dis == false){
										var values = $('#' + v.id).slider("option", "values");
										t[ben] = "(" + ben + " >= " + values[0] + " AND " + ben + " <= " + values[1] + ")";
									}else{
										t[ben] = "";
									}								
								}else{
									t[ben] = "";
								}	
							}
						})
						// Set definition expressions for visible and enabled radion buttons
						$.each( $('.umr-radio-indent input'), function(i,v){
							var ben = v.value.split("-")[0]
							var val = v.value.split("-")[1]
							// use class name to test if it's visible
							if ( $('#' + v.id).parents('.' + t.obj.mngmtAction).length ){
								if (v.disabled == true){
									t[ben] = "";
								}
								if (v.disabled == false && v.checked == true){
									t[ben] = "( " + ben + " = '" + val + "' )";
								}	
							}else{	
								t[ben] = "";
							}
						}) 
						t.clicks.layerDefs(t);
					}	
				})
				// Checkboxes for sliders
				$('#' + t.id + 'umr-wrap .-slCb').on('click',function(c){
					if (c.target.checked == true){
						$('#' + c.target.id).parent().parent().find('.umr-slider-label').css("display", "inline-block");
						var sl = $('#' + c.target.id).parent().parent().find('.slider')[0].id 
						$('#' + sl).slider( "option", "disabled", false );
						var values = $('#' + sl).slider("option", "values");
						$('#' + sl).slider('values', values);
					}
					if (c.target.checked == false){
						$('#' + c.target.id).parent().parent().find('.umr-slider-label').css("display", "none");
						var sl = $('#' + c.target.id).parent().parent().find('.slider')[0].id 
						$('#' + sl).slider( "option", "disabled", true );
						var ben  = sl.split("-").pop();
						t[ben] = "";
						t.clicks.layerDefs(t);
					}	
				})
				// Checkboxes for radio buttons
				$('#' + t.id + 'umr-wrap .rb_cb').on('click',function(c){
					if (c.target.checked == true){
						$.each($('#' + c.target.id).parent().next().find('input'),function(i,v){
							$(v).attr('disabled', false)
							if (v.checked == true){
								$(v).trigger('click')
							}
						})
					}
					if (c.target.checked == false){
						$.each($('#' + c.target.id).parent().next().find('input'),function(i,v){
							$(v).attr('disabled', true)
							if (v.checked == true){
								var ben = v.value.split("-")[0]	
								t[ben] = "";
								t.clicks.layerDefs(t);	
							}	
						})
					}	
				});	
				// Radio button clicks
				$('.umr-radio-indent input').on('click',function(c){
					var ben = c.target.value.split("-")[0]
					var val = c.target.value.split("-")[1]
					t[ben] = "( " + ben + " = '" + val + "' )";
					t.clicks.layerDefs(t);
				})
				//Natural lands not behind levess slider
				$('#' + t.id + '-10-NatNotProt').slider({range:true, min:0, max:16800, values:[0,16800], disabled:true, 
						change:function(event,ui){t.clicks.sliderChange(event,ui,t)},
						slide:function(event,ui){t.clicks.sliderSlide(event,ui,t)}
					})
				$('#' + t.id + '-12-NatNotProt').slider({range:true, min:0, max:6700, values:[0,6700], disabled:true,
						change:function(event,ui){t.clicks.sliderChange(event,ui,t)},
						slide:function(event,ui){t.clicks.sliderSlide(event,ui,t)}
					})
				//Agricultural lands not behind levess slider
				$('#' + t.id + '-10-RowAgNotProt').slider({range:true, min:0, max:33600, values:[0,33600], disabled:true, 
						change:function(event,ui){t.clicks.sliderChange(event,ui,t)},
						slide:function(event,ui){t.clicks.sliderSlide(event,ui,t)}
					})
				$('#' + t.id + '-12-RowAgNotProt').slider({range:true, min:0, max:21200, values:[0,21200], disabled:true, 
						change:function(event,ui){t.clicks.sliderChange(event,ui,t)},
						slide:function(event,ui){t.clicks.sliderSlide(event,ui,t)}
					})
				//Structural loss slider
				$('#' + t.id + '-10-FRStruct_TotLoss').slider({range:true, min:0, max:1262656000, values:[0,1262656000], disabled:true, 
						change:function(event,ui){t.clicks.sliderChange(event,ui,t)},
						slide:function(event,ui){t.clicks.sliderSlide(event,ui,t)}
					})
				$('#' + t.id + '-12-FRStruct_TotLoss').slider({range:true, min:0, max:1196649000, values:[0,1196649000], disabled:true, 
						change:function(event,ui){t.clicks.sliderChange(event,ui,t)},
						slide:function(event,ui){t.clicks.sliderSlide(event,ui,t)}
					})
				//Agricultural loss slider
				$('#' + t.id + '-10-AGLoss_7').slider({range:true, min:0, max:129913000, values:[0,129913000], disabled:true, 
						change:function(event,ui){t.clicks.sliderChange(event,ui,t)},
						slide:function(event,ui){t.clicks.sliderSlide(event,ui,t)}
					})
				$('#' + t.id + '-12-AGLoss_7').slider({range:true, min:0, max:21535000, values:[0,21535000], disabled:true, 
						change:function(event,ui){t.clicks.sliderChange(event,ui,t)},
						slide:function(event,ui){t.clicks.sliderSlide(event,ui,t)}
					})
				//Agricultural land use behind levees slider
				$('#' + t.id + '-10-RowAgProt').slider({range:true, min:0, max:47300, values:[0,47300], disabled:true, 
						change:function(event,ui){t.clicks.sliderChange(event,ui,t)},
						slide:function(event,ui){t.clicks.sliderSlide(event,ui,t)}
					})
				$('#' + t.id + '-12-RowAgProt').slider({range:true, min:0, max:22600, values:[0,22600], disabled:true, 
						change:function(event,ui){t.clicks.sliderChange(event,ui,t)},
						slide:function(event,ui){t.clicks.sliderSlide(event,ui,t)}
					})
				//Developed lands behind levess slider
				$('#' + t.id + '-10-DevProt').slider({range:true, min:0, max:29000, values:[0,29000], disabled:true, 
						change:function(event,ui){t.clicks.sliderChange(event,ui,t)},
						slide:function(event,ui){t.clicks.sliderSlide(event,ui,t)}
					})
				$('#' + t.id + '-12-DevProt').slider({range:true, min:0, max:12300, values:[0,12300], disabled:true, 
						change:function(event,ui){t.clicks.sliderChange(event,ui,t)},
						slide:function(event,ui){t.clicks.sliderSlide(event,ui,t)}
					})
			},
			sliderChange: function(e, ui, t){
				// slider change was mouse-driven
				if (e.originalEvent) {
					var ben  = e.target.id.split("-").pop()
					t[ben] = "(" + ben + " >= " + ui.values[0] + " AND " + ben + " <= " + ui.values[1] + ")";	
					t.clicks.layerDefs(t);
					console.log("mouse click");
				}
				//slider change was programmatic
				else{
					if (t.obj.stateSet == "no"){
						var ben  = e.target.id.split("-").pop()
						t[ben] = "(" + ben + " >= " + ui.values[0] + " AND " + ben + " <= " + ui.values[1] + ")";	
						t.clicks.layerDefs(t);
						t.clicks.sliderSlide(e, ui, t);
						console.log("programmatic", e.target.id);
					}else{console.log("state set = yes");}
				}	
			},
			sliderSlide: function(e, ui, t){
				var sid = e.target.id.split("-");
				$('#' + t.id + '-' + sid[1] + '-' + sid[2]).parent().prev().find('.blueFont').each(function(i,v){
					if (ui.values[i] > 100000){
						var val = t.clicks.abbreviateNumber(ui.values[i])
					}else{
						var val = t.clicks.commaSeparateNumber(ui.values[i])
					}
					$(v).html(val)
				})	
			},
			layerDefs: function(t){
				if (t.obj.stateSet == "no"){
					
					t.obj.exp = [t.NatNotProt, t.RowAgNotProt, t.RowAgProt, t.DevProt, t.FRStruct_TotLoss, t.AGLoss_7, 
								 t.NDelRet, t.Denitrification, t.Reconnection, t.BF_Existing, t.BF_Priority, t.SDM]
				}
				var exp = "";
				var cnt = 0;
				$.each(t.obj.exp, function(i, v){
					if (v.length > 0){
						cnt = cnt + 1;
					}	
				});	
				if (cnt > 0){
					t.obj.exp.unshift(t.obj.ffDef);
					$.each(t.obj.exp, function(i, v){
						if (v.length > 0){
							if (exp.length == 0){
								exp = v;
							}else{
								exp = exp + " AND " + v;
							}	
						}	
					});
					t.layerDefinitions = [];		
					t.layerDefinitions[t.obj.hucLayerSel] = exp;			
					t.dynamicLayer.setLayerDefinitions(t.layerDefinitions);
					t.obj.visibleLayers = [t.obj.hucLayerSel, t.obj.hucLayer];
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					var query = new Query();
					var queryTask = new QueryTask(t.url + '/' + t.obj.hucLayerSel);
					query.where = exp;
					queryTask.executeForCount(query,function(count){
						var countWcomma = t.clicks.commaSeparateNumber(count)
						$('#' + t.id + 'mng-act-wrap .fuCount').html(countWcomma); 
					});
				}else{
					t.obj.visibleLayers = [t.obj.hucLayer];
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
					$('#' + t.id + 'mng-act-wrap .fuCount').html("0"); 
				}	
			},
			makeVariables: function(t){
				t.NatNotProt = "";
				t.RowAgNotProt = "";
				t.RowAgProt = "";
				t.DevProt = "";
				t.FRStruct_TotLoss = "";
				t.AGLoss_7 = "";
				t.NDelRet = "";
				t.Denitrification = "";
				t.Reconnection = "";
				t.BF_Existing = "";
				t.BF_Priority = "";
				t.SDM = "";
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
