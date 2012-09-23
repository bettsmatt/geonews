(function() {
  var SetupMap, googleMap, mapCanvas, mapTip, menuWell, mousePos, regions, relatedArticles, relatedArticlesHeader, resultsSuburb, resultsWellington;

  relatedArticles = $("#relatedArticlesList");

  menuWell = $("#menuWell");

  relatedArticlesHeader = $("#relatedArticlesHeader");

  regions = {};

  resultsWellington = $("#Results_Wellington");

  resultsSuburb = $("#Results_Suburb");

  mapTip = $("<div class=\"myToolTip\" rel=\"tooltip\" title=\"Test tool top\" style = \"\">Hello</div>");

  $("body").append(mapTip);

  mapTip.hide();

  mousePos = {
    x: -1,
    y: -1
  };

  $(document).mousemove(function(e) {
    mousePos = {
      x: e.pageX,
      y: e.pageY
    };
    mapTip.css({
      top: "" + (e.pageY + 20) + "px",
      left: "" + e.pageX + "px"
    });
    return console.log("" + mousePos.x + ", " + mousePos.y);
  });

  SetupMap = function() {
    var elem, mapCenter, mapOptions, style;
    mapCenter = new google.maps.LatLng(-41.288889, 174.777222);
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
    var term;
    term = $("#search_text_box").val();
    console.log("Searching for term " + term);
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
                resultsSuburb.text("" + k + " | " + cleanResults);
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
                  var a, articleElem, num, _i, _len, _ref;
                  relatedArticles.children("li").remove();
                  relatedArticles.children("a").remove();
                  relatedArticles.append("                                    <li class=\"nav-header\" id=\"relatedArticlesHeader\">                                        Showing " + data.Articles.length + " of " + data.Results + " for " + k + "                                    </li>");
                  num = 1;
                  _ref = data.Articles;
                  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    a = _ref[_i];
                    articleElem = $("<li><a rel=\"tooltip\" title=\"" + a.Body + "\" href=\"" + a.Link + "\">" + (num++) + " - " + a.Title + "</a></li>");
                    relatedArticles.append(articleElem);
                    relatedArticles.append("<li class=\"divider\"></li>");
                    articleElem.hover(function() {
                      console.log("Hovered on " + a.Title);
                      return articleElem.tooltip({});
                    });
                  }
                  relatedArticles.append("                                    <a href=\"\" class=\"noHover\">                                        <i class=\"icon-chevron-left disabled icon-black\"></i>                                        <del>Previous</del>                                                                            <a class=\"center\" href=\"\">                                        Close                                        <i class=\"icon-chevron-up icon-black\"></i>                                    </a>                                                                        <a class=\"pull-right\" href=\"\">                                        Next                                        <i class=\"icon-chevron-right icon-black\"></i>                                    </a>");
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
        var c, latLng, outline, overlay, _i, _len, _ref;
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
        return regions["" + v.Suburb] = overlay;
      });
    },
    error: function(data) {
      return console.log("fail to fetch regions");
    }
  });

  /*
  $("#clear_regions").click ->
      console.log "Clearing Regions"
      
      $.each regions, (k,v) ->
          v.setMap null
  */

}).call(this);
