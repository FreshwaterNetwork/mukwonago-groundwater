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
        t.obj.inEvaluate = true;
        ("mgw-known-location-wrapper");
        $(".mgw-known-location-wrapper").show();
        $(".mgw-main-app-intro-wrapper").hide();
      });
      // on search location button click
      $(".mgw-search-location-button").on("click", (evt) => {
        t.obj.inSearch = true;
        $(".mgw-search-location-wrapper").show();
        $(".mgw-main-app-intro-wrapper").hide();
      });

      // on back to home button click
      $(".mgw-back-home-button").on("click", (evt) => {
        t.map.graphics.clear();
        t.obj.inSearch = false;
        t.obj.inEvaluate = false;
        $(".mgw-known-location-wrapper").hide();
        $(".mgw-search-location-wrapper").hide();
        $(".mgw-main-app-intro-wrapper").show();
        t.obj.visibleLayers = [0, 1, 2, 3];
        t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
      });
      console.log("test");

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
      $(".mgw-search-pumping-rate-dropdown").on("change", (evt) => {
        $.each($(".mgw-search-pumping-rate-dropdown option"), function (i, v) {
          if (v.selected) {
            // set the GPM value
            t.obj.knownSearchGPMValue = v.value;
            t.esriapi.displayDrawdownRasterOnMap(t);
          }
        });
      });

      // on search water features tbale,  view map button click
      $(".mgw-selectFeatures-table-wrapper").on(
        "click",
        ".mgw-table-select-button",
        function (evt) {
          t.obj.selectedFeatureName = evt.currentTarget.dataset.featurename;
          t.esriapi.displayDrawdownRasterOnMap(t);
        }
      );
    },
    // // build the drawdown report table //////////////////////////////////////////////////
    // do this on map click and on dropdown selection
    buildDrawdownTable: function (t, waterFeatureData) {
      console.log(waterFeatureData);

      //   waterFeatureData.sort((a, b) => (a.fenDrawdown < b.fenDrawdown ? 1 : -1));
      let fenFeats = [];
      //   let lakeFeats = [];
      //   let streamFeats = [];
      let lakeStreamFeats = [];
      waterFeatureData.forEach((feat) => {
        if (feat.fenDrawdown) {
          fenFeats.push(feat);
        } else if (feat.lakeDepletion) {
          feat["depletion"] = feat.lakeDepletion;
          console.log(feat);
          lakeStreamFeats.push(feat);
        } else if (feat.streamDepletion) {
          feat.depletion = feat.streamDepletion;
          console.log(feat);
          lakeStreamFeats.push(feat);
        }
      });
      fenFeats.sort((a, b) => (a.fenDrawdown < b.fenDrawdown ? 1 : -1));
      lakeStreamFeats.sort((a, b) => (a.depletion < b.depletion ? 1 : -1));
      //   streamFeats.sort((a, b) =>
      //     a.streamDepletion < b.streamDepletion ? 1 : -1
      //   );
      console.log(fenFeats, lakeStreamFeats);
      $(".mgw-drawdown-table-wrapper").show();
      let waterFeatureTable = $(".mgw-depletion-table-body");
      waterFeatureTable.empty();
      fenFeats.forEach((feat) => {
        let data;
        if (feat.fenDrawdown) {
          data = `<tr><td>${feat.commonName}</td><td>${feat.fenDrawdown}</td><td>--</td><td>--</td></tr>`;
        }
        waterFeatureTable.append(data);
      });
      lakeStreamFeats.forEach((feat) => {
        let data;
        if (feat.depletion) {
          data = `<tr><td>${feat.commonName}</td><td></td>--<td>${feat.depletion}</td><td>--</td></tr>`;
        }
        waterFeatureTable.append(data);
      });
      //   streamFeats.forEach((feat) => {
      //     let data;
      //     if (feat.streamDepletion) {
      //       data = `<tr><td>${feat.commonName}</td><td>--</td><td>${feat.streamDepletion}</td><td>--</td></tr>`;
      //     }
      //     waterFeatureTable.append(data);
      //   });
      // console.log(waterFeatureTable);
      //   waterFeatureData.forEach((feat) => {
      //     let data;
      //     if (feat.fenDrawdown) {
      //       data = `<tr><td>${feat.commonName}</td><td>${feat.fenDrawdown}</td><td>--</td><td>--</td></tr>`;
      //     } else if (feat.lakeDepletion) {
      //       data = `<tr><td>${feat.commonName}</td><td>-</td><td>${feat.lakeDepletion}</td><td>-</td></tr>`;
      //     } else if (feat.streamDepletion) {
      //       data = `<tr><td>${feat.commonName}</td><td>--</td><td>${feat.streamDepletion}</td><td>--</td></tr>`;
      //     }
      //     waterFeatureTable.append(data);
      //   });
    },
    buildSelectedWaterFeatureTable: function (t) {
      $(".mgw-selectFeatures-table-wrapper").show();
      $(".mgw-no-features-selected-text").hide();

      let selectedFeatureTable = $(".mgw-selectFeatures-table-body");
      selectedFeatureTable.empty();
      console.log("build water feature table", t.selectedWaterFeatures);
      t.selectedWaterFeatures.forEach((feat) => {
        console.log(feat.attributes);
        let isFen = feat.attributes.Name.includes("fen");
        let isLake = feat.attributes.Name.includes("lk");
        let data;
        if (isFen) {
          data = `<tr><td>${feat.attributes.CommonName}</td><td class="mgw-table-select-button" data-featureName="${feat.attributes.Name}">View Map</td><td>--</td><td class="mgw-table-close">×</td></tr>`;
        } else if (isLake) {
          data = `<tr><td>${feat.attributes.CommonName}</td><td>--</td><td class="mgw-table-select-button" data-featureName="${feat.attributes.Name}">View Map</td><td class="mgw-table-close">×</td></tr>`;
        } else {
          data = `<tr><td>${feat.attributes.ID}</td><td>--</td><td class="mgw-table-select-button" data-featureName="${feat.attributes.Name}">View Map</td><td class="mgw-table-close">×</td></tr>`;
        }
        selectedFeatureTable.append(data);
      });
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
