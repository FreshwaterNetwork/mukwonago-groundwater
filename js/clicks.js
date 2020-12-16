define([
	"dojo/_base/declare",
	"esri/tasks/query",
	"esri/tasks/QueryTask",
], function (declare, Query, QueryTask) {
	"use strict";

	return declare(null, {
		eventListeners: function (t) {
			// on agree checkbox click
			$("#" + t.id + "agree-option").on("click", (evt) => {
				if (evt.currentTarget.checked) {
					// enable agree button
					$(".mgw-agree-button").prop("disabled", false);
				} else {
					// disable agree button
					$(".mgw-agree-button").prop("disabled", true);
				}
			});
			// on agree button click
			$(".mgw-agree-button").on("click", (evt) => {
				// Create ESRI objects and event listeners
				t.esriapi.esriApiFunctions(t);
				// hide the agreement box
				$(".mgw-agree-wrapper").hide();
				// slide down the main app wrapper
				$(".mgw-main-app-wrapper").slideDown();
			});
		},

		// map click functionality call the map click query function //////////////////////////////////////////////////
		mapClickFunction: function (t) {
			t.map.on("click", function (c) {
				t.obj.pnt = c.mapPoint;
				t.clicks.mapClickQuery(t, t.obj.pnt); // call t.mapClickQuery function
			});
		},
		// map click query function /////////////////////////////////////////////////////////////////////
		mapClickQuery: function (t, p) {
			console.log(p);
		},

		makeVariables: function (t) {},
		commaSeparateNumber: function (val) {
			while (/(\d+)(\d{3})/.test(val.toString())) {
				val = val.toString().replace(/(\d+)(\d{3})/, "$1" + "," + "$2");
			}
			return val;
		},
		abbreviateNumber: function (num) {
			if (num >= 1000000000) {
				return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
			}
			if (num >= 1000000) {
				return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
			}
			if (num >= 1000) {
				return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
			}
			return num;
		},
	});
});
