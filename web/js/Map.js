(function() {
  var SetupMap, googleMap, mapCanvas, regions, relatedArticles;

  relatedArticles = $("#relatedArticlesList");

  regions = {};

  SetupMap = function() {
    var elem, mapCenter, mapOptions;
    mapCenter = new google.maps.LatLng(-41.288889, 174.777222);
    mapOptions = {
      zoom: 9,
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
        relatedArticles.children("li").remove();
        relatedArticles.append("<li><a href=\"#\">Wellington total: " + cleanTotal + "</a></li>");
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
              var cleanResults;
              cleanResults = parseInt(data.Results.replace(/([a-zA-Z_,\.~-]+)/, ""));
              console.log("Success for " + k + " 0 " + cleanResults);
              v.setMap(googleMap);
              if (cleanResults < cleanTotal) {
                return v.setOptions({
                  fillColor: "#FF0000"
                });
              } else {
                return v.setOptions({
                  fillColor: "#00FF00"
                });
              }
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

  $("#populate_regions").click(function() {
    console.log("Populating regions");
    return $.ajax({
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
            strokeColor: "#222222",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#999999",
            fillOpacity: 0.35
          });
          overlay.setMap(googleMap);
          return regions["" + v.Suburb] = overlay;
        });
      },
      error: function(data) {
        return console.log("fail to fetch regions");
      }
    });
  });

  $("#clear_regions").click(function() {
    console.log("Clearing Regions");
    return $.each(regions, function(k, v) {
      return v.setMap(null);
    });
  });

}).call(this);
