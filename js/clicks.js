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
                $(".mgw-main-app-intro-wrapper").slideDown();
            });

            // on known location button click
            $(".mgw-known-location-button").on("click", (evt) => {
                console.log("known location");
                ("mgw-known-location-wrapper");
                $(".mgw-known-location-wrapper").show();
                $(".mgw-main-app-intro-wrapper").hide();
                // // Create ESRI objects and event listeners
                // t.esriapi.esriApiFunctions(t);
                // // hide the agreement box
                // $(".mgw-agree-wrapper").hide();
                // // slide down the main app wrapper
                // $(".mgw-main-app-intro-wrapper").slideDown();
            });
            // on search location button click
            $(".mgw-search-location-button").on("click", (evt) => {
                console.log("search location");
                $(".mgw-search-location-wrapper").show();
                $(".mgw-main-app-intro-wrapper").hide();
            });

            // on back to home button click
            $(".mgw-back-home-button").on("click", (evt) => {
                $(".mgw-known-location-wrapper").hide();
                $(".mgw-search-location-wrapper").hide();
                $(".mgw-main-app-intro-wrapper").show();
            });

            // on pumping rate select menu change

            $(".mgw-pumping-rate-select").on("change", (evt) => {
                $.each($(".mgw-pumping-rate-select option"), function (i, v) {
                    // console.log($(v));
                    // console.log(v.selected);
                    if (v.selected) {
                        console.log(v.value);
                        t.obj.knownGPMValue = v.value;
                    }
                });
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
