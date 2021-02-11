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
        t.obj.visibleLayers = [0, 1, 2, 3, 4];
        t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);

        // clear and hide depletion table wrapper
        let waterFeatureTable = $(".mgw-depletion-table-body");
        waterFeatureTable.empty();
        $(".mgw-drawdown-table-wrapper").hide();
        // t.selectedFeatureTable.empty();
        $(".mgw-selectFeatures-table-wrapper").hide();
        t.selectedWaterFeatures = [];
        t.obj.knownSearchGPMValue = "";
        t.obj.selectedFeatureName = "";
        $(".mgw-search-help-box").hide();
        $(".mgw-known-help-box").hide();
      });

      // on search learn more click
      $(".mgw-search-learn-more span").on("click", (evt) => {
        $(".mgw-search-help-box").show();
      });
      // on search leanr more close click
      $(".mgw-search-help-header i").on("click", (evt) => {
        $(".mgw-search-help-box").hide();
      });

      // on known learn more click
      $(".mgw-known-learn-more span").on("click", (evt) => {
        $(".mgw-known-help-box").show();
      });
      // on known leanr more close click
      $(".mgw-known-help-header i").on("click", (evt) => {
        $(".mgw-known-help-box").hide();
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
      $(".mgw-search-pumping-rate-dropdown").on("change", (evt) => {
        $.each($(".mgw-search-pumping-rate-dropdown option"), function (i, v) {
          if (v.selected) {
            console.log(v.value);
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
          t.obj.selectedFeatureName = $(evt.currentTarget).data().featurename;
          let selectBtns = $(evt.currentTarget)
            .parent()
            .parent()
            .find(".mgw-table-select-button");

          $.each(selectBtns, (i, selectBtn) => {
            $(selectBtn)[0].innerHTML = "View Map";
            $(selectBtn).css("font-weight", "normal");
          });
          $(evt.currentTarget)[0].innerHTML = "Map Selected";
          $(evt.currentTarget).css("font-weight", "bold");

          t.esriapi.displayDrawdownRasterOnMap(t);
        }
      );

      // search table row click
      $(document).on("mouseover", ".mgw-search-table-row", function (evt) {
        // add hover selected class
        $(evt.currentTarget).css("background-color", "rgba(255, 255, 0, .3)");
        // add geometry to selected graphic on map
        let selectedRow = t.selectedFeatures.filter(function (waterFeature) {
          return (
            waterFeature.attributes.CommonName ==
            $(evt.currentTarget).data().name
          );
        });
        if (selectedRow.length > 0) {
          let geometry = selectedRow[0].geometry;
          t.esriapi.highlightSelectedWaterFeatures(t, geometry);
        }
      });
      $(document).on("mouseout", ".mgw-search-table-row", function (evt) {
        // remove hover selected class
        $(evt.currentTarget).css("background-color", "white");

        // remove geometry to selected graphic on map
        t.hoverGraphicsLayer.clear();
      });

      // on selected water feature table row close click
      $(document).on("click", ".mgw-selected-row-close", function (evt) {
        let currentMapStatus = $(evt.currentTarget)
          .parent()
          .find(".mgw-table-select-button")[0].innerHTML;
        if (currentMapStatus != "View Map") {
          t.obj.visibleLayers = [0, 1, 2, 3, 4];
          t.dynamicLayer.setVisibleLayers(t.obj.visibleLayers);
        } else {
          ("");
        }

        $(evt.currentTarget).parent().hide();

        t.selectedWaterFeatures = t.selectedWaterFeatures.filter(function (
          waterFeature
        ) {
          return (
            waterFeature.attributes.CommonName !=
            $(evt.currentTarget).data().name
          );
        });

        // t.clicks.buildSelectedWaterFeatureTable(t);
        t.esriapi.highlightSelectedWaterFeatures(t);

        if (t.selectedWaterFeatures.length == 0) {
          $(".mgw-selectFeatures-table-wrapper").hide();
          t.selectedWaterFeatures = [];
          $(".mgw-no-features-selected-text").show();
        }
      });
    },
    // // build the drawdown report table //////////////////////////////////////////////////
    // do this on map click and on dropdown selection
    buildDrawdownTable: function (t, waterFeatureData) {
      let fenFeats = [];
      let lakeStreamFeats = [];
      t.waterFeatureData.forEach((feat) => {
        if (feat.fenDrawdown) {
          fenFeats.push(feat);
        } else if (feat.lakeDepletion) {
          feat["depletion"] = feat.lakeDepletion;
          lakeStreamFeats.push(feat);
        } else if (feat.streamDepletion) {
          feat.depletion = feat.streamDepletion;
          lakeStreamFeats.push(feat);
        }
      });
      fenFeats.sort((a, b) => (a.fenDrawdown < b.fenDrawdown ? 1 : -1));
      lakeStreamFeats.sort((a, b) => (a.depletion < b.depletion ? 1 : -1));

      $(".mgw-drawdown-table-wrapper").show();
      let waterFeatureTable = $(".mgw-depletion-table-body");
      waterFeatureTable.empty();
      fenFeats.forEach((feat) => {
        console.log(feat, "68734786327846783264782367868");
        let data;
        if (feat.fenDrawdown) {
          if (feat.fenDrawdown >= 20) {
            data = `<tr class="mgw-search-table-row" data-name='${feat.commonName}'><td>${feat.commonName}</td><td style="color:red !important;">${feat.fenDrawdown}</td><td>--</td><td>${feat.cap}</td></tr>`;
          } else {
            data = `<tr class="mgw-search-table-row" data-name='${feat.commonName}'><td>${feat.commonName}</td><td>${feat.fenDrawdown}</td><td>--</td><td>${feat.cap}</td></tr>`;
          }
        }
        waterFeatureTable.append(data);
      });
      lakeStreamFeats.forEach((feat) => {
        let data;
        if (feat.depletion) {
          if (feat.depletion >= 5) {
            data = `<tr class="mgw-search-table-row" data-name='${feat.commonName}'><td>${feat.commonName}</td><td></td>--<td style="color:red !important;">${feat.depletion}</td><td>${feat.cap}</td></tr>`;
          } else {
            data = `<tr class="mgw-search-table-row" data-name='${feat.commonName}'><td>${feat.commonName}</td><td></td>--<td>${feat.depletion}</td><td>${feat.cap}</td></tr>`;
          }
        }
        waterFeatureTable.append(data);
      });
    },
    buildSelectedWaterFeatureTable: function (t) {
      if (t.selectedWaterFeatures.length > 0) {
        $(".mgw-selectFeatures-table-wrapper").show();
        $(".mgw-no-features-selected-text").hide();
        t.selectedFeatureTable = $(".mgw-selectFeatures-table-body");
        t.selectedFeatureTable.empty();
        t.selectedWaterFeatures.forEach((feat) => {
          let isFen = feat.attributes.Name.includes("fen");
          let isLake = feat.attributes.Name.includes("lk");
          let data;
          if (isFen) {
            data = `<tr><td>${feat.attributes.CommonName}</td><td class="mgw-table-select-button" data-featureName="${feat.attributes.CommonName}">View Map</td><td>--</td><td data-name="${feat.attributes.CommonName}" class="mgw-selected-row-close">×</td></tr>`;
          } else if (isLake) {
            data = `<tr><td>${feat.attributes.CommonName}</td><td>--</td><td class="mgw-table-select-button" data-featureName="${feat.attributes.CommonName}">View Map</td><td data-name="${feat.attributes.CommonName}" class="mgw-selected-row-close">×</td></tr>`;
          } else {
            data = `<tr><td>${feat.attributes.CommonName}</td><td>--</td><td class="mgw-table-select-button" data-featureName="${feat.attributes.CommonName}">View Map</td><td data-name="${feat.attributes.CommonName}" class="mgw-selected-row-close">×</td></tr>`;
          }
          t.selectedFeatureTable.append(data);
        });
      }
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
