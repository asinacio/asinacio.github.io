/* ==========================================================================
   Various functions that we want to use within the template
   ========================================================================== */

/*jslint es6 */
'use strict';

// Constants for CDNs
const PLOTLY_URL = "https://cdn.jsdelivr.net/npm/plotly.js@3.6.0/dist/plotly.min.js";
const MERMAID_URL = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";

/* ==========================================================================
   Theme (Dark mode only)
   ========================================================================== */

// Always use dark theme
function determineComputedTheme() {
  return "dark";
}

function setTheme() {
  $("html").attr("data-theme", "dark");
}

// Defer the loading of Mermaid to only if there is a field on the page to be rendered
let mermaidElements = document.querySelectorAll("pre>code.language-mermaid");
if (mermaidElements.length > 0) {
  document.addEventListener("readystatechange", function() {
    const moduleScript = document.createElement('script');
    moduleScript.type = 'module';
    moduleScript.textContent = `
      import mermaid from '${MERMAID_URL}';
      mermaid.initialize({startOnLoad:true, theme:'dark'});
      await mermaid.run({querySelector:'code.language-mermaid'});
    `;
    document.body.appendChild(moduleScript);
  });
}

/* ==========================================================================
   Plotly integration script
   ========================================================================== */

let plotlyElements = document.querySelectorAll("pre>code.language-plotly");
if (plotlyElements.length > 0) {
  document.addEventListener("readystatechange", function() {

    if (document.readyState !== "complete") {
      return;
    }

    const script = document.createElement('script');
    script.src = PLOTLY_URL;
    script.async = true;

    script.onload = function() {

      plotlyElements.forEach(function(elem) {

        let jsonData = JSON.parse(elem.textContent);
        elem.parentElement.classList.add("hidden");

        let chartElement = document.createElement("div");
        elem.parentElement.after(chartElement);

        const theme = plotlyDarkLayout;

        if (jsonData.layout) {
          jsonData.layout.template = jsonData.layout.template ?
            { ...theme, ...jsonData.layout.template } :
            theme;
        } else {
          jsonData.layout = { template: theme };
        }

        Plotly.react(chartElement, jsonData.data, jsonData.layout);
      });
    };

    document.head.appendChild(script);
  });
}

function redrawPlotly() {

  plotlyElements.forEach(function(elem) {

    let jsonData = JSON.parse(elem.textContent);
    let chartElement = $(elem).parent().next().get(0);

    const theme = plotlyDarkLayout;

    if (jsonData.layout) {
      jsonData.layout.template = jsonData.layout.template ?
        { ...theme, ...jsonData.layout.template } :
        theme;
    } else {
      jsonData.layout = { template: theme };
    }

    Plotly.react(chartElement, jsonData.data, jsonData.layout);
  });
}

/* ==========================================================================
   Actions that should occur when the page has been fully loaded
   ========================================================================== */

$(document).ready(function () {

  // SCSS SETTINGS - These should be the same as the settings in the relevant files
  const scssLarge = 925;          // pixels, from /_sass/_themes.scss
  const scssMastheadHeight = 70;  // pixels, from the current theme

  // Force dark theme
  setTheme();

  // Enable the sticky footer
  var bumpIt = function () {
    $("body").css("padding-bottom", "0");
    $("body").css("margin-bottom", $(".page__footer").outerHeight(true));
  };

  $(window).resize(function () {
    didResize = true;
  });

  setInterval(function () {
    if (didResize) {
      didResize = false;
      bumpIt();
    }
  }, 250);

  var didResize = false;
  bumpIt();

  // Follow menu drop down
  $(".author__urls-wrapper button").on("click", function () {
    $(".author__urls").fadeToggle("fast");
    $(".author__urls-wrapper button").toggleClass("open");
  });

  // Restore the follow menu if toggled on a window resize
  jQuery(window).on('resize', function () {
    if (
      $('.author__urls.social-icons').css('display') == 'none' &&
      $(window).width() >= scssLarge
    ) {
      $(".author__urls").css('display', 'block');
    }
  });

});
