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
					// t.clicks.toggleFunc(t)
				})
				// Main header toggle button///////////////////////////////////////////
				$('#' + t.id + 'mainRadioBtns input').on('click',function(c){
					// console.log(c);
					let val = c.currentTarget.value;
					console.log(val)
					t.currentCheckVal = c.currentTarget;
					const sections = $(".aoc-contentBelowHeader .aoc-mainSection");
					t.clicks.toggleFunc(t)
				});
				// checkboxes for suplementary data
				$('#' + t.id + 'supDataWrapper input').on('click',function(c){
					let val = parseInt(c.currentTarget.value.split('-')[1]);
					console.log(val)
					if(c.currentTarget.checked){
						t.obj.visibleLayers.push(val)
						console.log(t.obj.visibleLayers)
					}else{
						// remove item from visible layer list
						let index = t.obj.visibleLayers.indexOf(val)
						t.obj.visibleLayers.splice(index,1);
					}
					// set the visible layers
					t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
				});
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
							break;
						case 'fish':
							t.obj.visibleLayers = t.obj.visibleLayers.filter(function(x){
								return fishPassage.indexOf(x) < 0;
							})
							break;
						default:
							console.log('none of the cases matched');
					}
				}
				// set the visible layers
				t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
			},
			makeVariables: function(t){
				t.aoc = 0;
				t.lowerFoxBound = 1;
				t.countyBounds = 2;
				t.surveyRank = 3;
				t.otherSurvey = 4;
				t.habitatSites = 5;
				t.wetlands = 6;
				t.prwWetlands = 7;
				t.wetlandsBord = 8;
				t.prwWetlandsBord = 9;
				t.kepBound = 10;
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
