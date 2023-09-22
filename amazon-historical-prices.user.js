// ==UserScript==
// @name            Amazon Historical Prices
// @version         1.0.1
// @description     Add a price history chart to Amazon product pages, powered by Keepa.
// @author          xu-minghao317
// @namespace       https://github/xu-minghao317
// @homepage        https://github.com/xu-minghao317/amazon-historical-prices
// @include         https://www.amazon.*/*
// @grant           none
// @license         MIT
// ==/UserScript==

// User Settings: Modify these variables to customize the Amazon Historical Prices chart
const userSettings = {
    showAmazonPrice: 1, // Amazon price graph: 1 (draw), 0 (do not draw)
    showNewPrice: 1, // New price graph: 1 (draw), 0 (do not draw)
    showUsedPrice: 0, // Used price graph: 1 (draw), 0 (do not draw)
    chartRange: 90, // The range of the chart in days: Suggested values are 1, 2, 7, 31, 90, 365
};

(function () {
    "use strict";

    // Apply CSS styles to the chart container
    const style = document.createElement("style");
    style.innerHTML = `
      .historicalPriceContainer {
        margin-top: 20px;
        margin-bottom: 20px;
        text-align: center;
      }
      .historicalPriceChart {
        width: 100%;
        max-width: 500px;
        border-radius: 0!important;
      }
    `;
    document.head.appendChild(style);

    function getASIN() {
        const asinElement =
            document.getElementById("ASIN") ||
            document.querySelector("[data-asin]") ||
            document.evaluate(
                "//@data-asin",
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            ).singleNodeValue;

        if (!asinElement) {
            showError("Unable to find ASIN!");
            return null;
        }
        return asinElement.value || asinElement.getAttribute("data-asin");
    }

    function generateHistoricalPriceChart(asin, tld) {
        const historicalPriceContainer = document.createElement("div");
        historicalPriceContainer.className = "historicalPriceContainer";

        const historicalPriceLink = document.createElement("a");
        const historicalPriceChart = new Image();
        historicalPriceChart.className = "historicalPriceChart";

        const keepaCountryCode = {
            com: "1",
            uk: "2",
            de: "3",
            fr: "4",
            jp: "5",
            ca: "6",
            it: "8",
            es: "9",
            in: "10",
            mx: "11",
            br: "12",
        };

        const countryCode = keepaCountryCode[tld] || "unsupported";

        if (countryCode === "unsupported") {
            showError("This country is not supported by Keepa.");
            return;
        }

        historicalPriceLink.target = "_blank";
        historicalPriceLink.href = `https://keepa.com/#!product/${countryCode}-${asin}`;
        historicalPriceChart.src = `https://graph.keepa.com/pricehistory.png?used=${userSettings.showUsedPrice}&asin=${asin}&domain=${tld}&amazon=${userSettings.showAmazonPrice}&new=${userSettings.showNewPrice}&range=${userSettings.chartRange}`;

        historicalPriceLink.appendChild(historicalPriceChart);
        historicalPriceContainer.appendChild(historicalPriceLink);

        const parentElement =
            document.getElementById("unifiedPrice_feature_div") ||
            document.getElementById("MediaMatrix") ||
            document.querySelector(".some-other-class");

        if (parentElement) {
            parentElement.appendChild(historicalPriceContainer);
        } else {
            showError("Unable to find parent element to append chart!");
        }
    }

    function showError(message) {
        console.error(`Amazon Historical Prices: ${message}`);
    }

    document.addEventListener("DOMContentLoaded", () => {
        const hostname = location.hostname;
        const tld = hostname.split(".").pop();
        const country = tld === "com" ? "com" : tld;
        const asin = getASIN();

        if (asin) {
            generateHistoricalPriceChart(asin, country);
        }
    });
})();
