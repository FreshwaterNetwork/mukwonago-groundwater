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
                    if (v.selected) {
                        // set the GPM value
                        t.obj.knownGPMValue = v.value;
                    }
                });
                // t.clicks.buildDrawdownTable(t);
                t.esriapi.searchWaterFeatures(t);
            });
        },

        // // build the drawdown report table //////////////////////////////////////////////////
        // do this on map click and on dropdown selection
        buildDrawdownTable: function (t, waterFeatureData) {
            let waterFeatureTable = $(".mgw-depletion-table-body");
            waterFeatureTable.empty();
            // console.log(waterFeatureTable);
            waterFeatureData.forEach((feat) => {
                let data;
                if (feat.fenDrawdown) {
                    data = `<tr><td>${feat.commonName}</td><td>${feat.fenDrawdown}</td><td>--</td><td>--</td></tr>`;
                } else if (feat.lakeDepletion) {
                    data = `<tr><td>${feat.commonName}</td><td>--</td><td>${feat.lakeDepletion}</td><td>--</td></tr>`;
                } else if (feat.streamDepletion) {
                    data = `<tr><td>${feat.commonName}</td><td>--</td><td>${feat.streamDepletion}</td><td>--</td></tr>`;
                }
                waterFeatureTable.append(data);
            });

            console.log(waterFeatureData);
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
