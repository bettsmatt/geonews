(function() {
  var SetupMap, ajaxLoader, countDown, googleMap, help, helpButton, mapCanvas, mapTip, menuUp, menuWell, mousePos, regions, relatedArticles, relatedArticlesHeader, resultsSuburb, resultsWellington, scale;

  relatedArticles = $("#relatedArticlesList");

  menuWell = $("#menuWell");

  relatedArticlesHeader = $("#relatedArticlesHeader");

  regions = {};

  resultsWellington = $("#Results_Wellington");

  resultsSuburb = $("#Results_Suburb");

  scale = $("#over_map_scale");

  help = $("#over_map_help");

  helpButton = $("#helpButton");

  helpButton.popover({
    placement: "right"
  });

  ajaxLoader = $("#ajaxLoader");

  countDown = $("#countDown");

  menuUp = true;

  mapTip = $("<div class=\"myToolTip\" rel=\"tooltip\" title=\"Map tool tip\" style = \"\"></div>");

  $("body").append(mapTip);

  mapTip.hide();

  mousePos = {
    x: -1,
    y: -1
  };

  $(document).mousemove(function(e) {
    var cssVal, popover;
    mousePos = {
      x: e.pageX,
      y: e.pageY
    };
    mapTip.css({
      top: "" + (e.pageY + 20) + "px",
      left: "" + e.pageX + "px"
    });
    popover = $(".popover");
    if (popover.length > 0) {
      cssVal = popover.css("top");
      if (cssVal[0] === '-') {
        console.log("Adjusting top to 7px");
        return popover.css({
          top: "7px"
        });
      }
    }
  });

  SetupMap = function() {
    var elem, mapCenter, mapOptions, style;
    mapCenter = new google.maps.LatLng(-41.278889, 174.737222);
    style = 
    [
	    {
		    "stylers": [
		    { "visibility": "off" }
		    ]
	    },{
		    "featureType": "water",
		    "elementType": "geometry.fill",
		    "stylers": [
		    { "visibility": "on" },
		    { "lightness": 1 },
		    { "color": "#19232F" }
		    ]
	    },{
		    "featureType": "landscape",
		    "elementType": "geometry.fill",
		    "stylers": [
		    { "visibility": "on" },
		    { "color": "#B1BDB4" }
		    ]
	    },{
		    "featureType": "poi",
		    "elementType": "geometry",
		    "stylers": [
		    { "visibility": "on" },
		    { "color": "#DCEBDD" }
		    ]		
	    }
    ];
    mapOptions = {
      styles: style,
      zoom: 12,
      center: mapCenter,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true
    };
    elem = document.getElementById('map_canvas');
    return new google.maps.Map(elem, mapOptions);
  };

  googleMap = SetupMap();

  google.maps.event.addDomListener(window, "load", googleMap);

  mapCanvas = $("#map_canvas");

  mapCanvas.css({
    height: "100%"
  });

  $("#search_term").click(function() {
    var responcesLeft, term;
    term = $("#search_text_box").val().replace(" ", "_");
    responcesLeft = 57;
    ajaxLoader.css({
      display: "block"
    });
    countDown.css({
      display: "block"
    });
    countDown.text("" + responcesLeft);
    return $.ajax({
      url: "http://localhost:8080/search/Wellington/" + term,
      dataType: "json",
      success: function(data) {
        var cleanTotal;
        cleanTotal = parseInt(data.Results.replace(/([a-zA-Z_,\.~-]+)/, ""));
        resultsWellington.text("Wellington | " + cleanTotal);
        $.each(regions, function(k, v) {
          return v.setMap(null);
        });
        return $.each(regions, function(k, v) {
          var safeName;
          console.log("searching for " + v.Suburb);
          safeName = ("" + k).split(" ").join('_');
          return $.ajax({
            url: "http://localhost:8080/search/" + safeName + "/" + term,
            dataType: "json",
            success: function(data) {
              var cleanResults, color, colorf, hex, percent;
              responcesLeft--;
              countDown.text("" + responcesLeft);
              if (responcesLeft === 0) {
                ajaxLoader.css({
                  display: "none"
                });
                countDown.css({
                  display: "none"
                });
                console.log("Hiding");
              }
              cleanResults = parseInt(data.Results.replace(/([a-zA-Z_,\.~-]+)/, ""));
              console.log("Success for " + k + " 0 " + cleanResults);
              v.setMap(googleMap);
              if (cleanResults > cleanTotal) {
                v.setOptions({
                  fillColor: "#FF0000"
                });
              } else {
                percent = cleanResults / cleanTotal;
                color = 255 * percent;
                colorf = color.toFixed(0);
                hex = colorf.toString(16);
                console.log("Found " + cleanResults + " of " + cleanTotal + " this is " + percent + "% - color " + color + " hex - " + hex);
                if (colorf < 1) {
                  v.setOptions({
                    fillColor: "#000000"
                  });
                } else if (colorf < 2) {
                  v.setOptions({
                    fillColor: "#200000"
                  });
                } else if (colorf < 3) {
                  v.setOptions({
                    fillColor: "#400000"
                  });
                } else if (colorf < 4) {
                  v.setOptions({
                    fillColor: "#600000"
                  });
                } else if (colorf < 6) {
                  v.setOptions({
                    fillColor: "#800000"
                  });
                } else if (colorf < 8) {
                  v.setOptions({
                    fillColor: "#100000"
                  });
                } else if (colorf < 16) {
                  v.setOptions({
                    fillColor: "#B00000"
                  });
                } else if (colorf < 32) {
                  v.setOptions({
                    fillColor: "#D00000"
                  });
                } else {
                  v.setOptions({
                    fillColor: "#FF0000"
                  });
                }
              }
              google.maps.event.addListener(v, "mouseover", function() {
                mapTip.show();
                mapTip.text("" + k + " - " + data.Results + " Articles");
                return v.setOptions({
                  strokeWeight: 4
                });
              });
              google.maps.event.addListener(v, "mouseout", function() {
                v.setOptions({
                  strokeWeight: 1
                });
                return mapTip.hide();
              });
              return google.maps.event.addListener(v, "click", function() {
                return relatedArticles.slideUp("slow", function() {
                  var a, articleElem, articleElemWrapper, num, _i, _len, _ref;
                  relatedArticles.children("li").remove();
                  relatedArticles.children("a").remove();
                  relatedArticles.append("                                    <li class=\"nav-header\" id=\"relatedArticlesHeader\">                                        Showing " + data.Articles.length + " of " + data.Results + " for <b>" + k + "</b>                                    </li>");
                  num = 1;
                  _ref = data.Articles;
                  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    a = _ref[_i];
                    articleElem = $("<a rel=\"popover\" data-content=\"" + a.Body + "\" data-original-title=\"" + a.Title + "\" href=\"" + a.Link + "\">                                    " + (num++) + ") " + a.Title + "...</a>");
                    articleElem.popover({
                      placement: "right"
                    });
                    articleElemWrapper = $("<li> </li>");
                    articleElemWrapper.append(articleElem);
                    relatedArticles.append(articleElemWrapper);
                    relatedArticles.append("<li class=\"divider\" style=\"margin-top:1px;margin-bottom:1px;\"></li>");
                  }
                  relatedArticles.append("                                    <a id=\"CloseButton\" href=\"\">                                        <i class=\"icon-chevron-up icon-black\"></i>                                        Close                                    </a>                                    <a class=\"pull-right\" href=\"\">                                        Next                                        <i class=\"icon-chevron-right icon-black\"></i>                                    </a>                                    <a href=\"\" class=\"noHover pull-right\">                                        <i class=\"icon-chevron-left disabled icon-black\"></i>                                        <del>Previous</del>                                    </a>                                ");
                  relatedArticles.find("#CloseButton").click(function() {
                    relatedArticles.slideUp("slow");
                    return false;
                  });
                  return relatedArticles.slideDown("slow");
                });
              });
            },
            error: function(data) {
              return console.log("fail");
            }
          });
        });
      },
      error: function(data) {
        return console.log("fail");
      }
    });
  });

  console.log("Populating regions");

  $.ajax({
    url: "http://localhost:8080/regions",
    dataType: "json",
    success: function(data) {
      return $.each(data, function(k, v) {
        var c, latLng, outline, overlay, suburb, _i, _len, _ref;
        console.log("k:" + k + " - v:" + v.Suburb);
        outline = [];
        _ref = v.Coords;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          latLng = new google.maps.LatLng(c.Lat, c.Lng);
          outline.push(latLng);
        }
        overlay = new google.maps.Polygon({
          paths: outline,
          strokeColor: "#FFFFFF",
          strokeOpacity: 1,
          strokeWeight: 1,
          fillColor: "#222222",
          fillOpacity: 1
        });
        overlay.setMap(googleMap);
        regions["" + v.Suburb] = overlay;
        suburb = data.Sub;
        google.maps.event.addListener(overlay, "mouseover", function() {
          mapTip.show();
          mapTip.text("" + v.Suburb);
          return overlay.setOptions({
            strokeWeight: 4
          });
        });
        return google.maps.event.addListener(overlay, "mouseout", function() {
          overlay.setOptions({
            strokeWeight: 1
          });
          return mapTip.hide();
        });
      });
    },
    error: function(data) {
      return console.log("fail to fetch regions");
    }
  });

}).call(this);
