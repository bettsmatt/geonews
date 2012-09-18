(function() {
  var SetupMap, Suburb, googleMap, mapCanvas, relatedArticles, suburbs;

  relatedArticles = $("#relatedArticlesList");

  suburbs = [];

  Suburb = (function() {

    function Suburb(name, coordinates, map) {
      var c, latLng, _i, _len;
      this.name = name;
      this.map = map;
      this.outline = [];
      this.overlay;
      for (_i = 0, _len = coordinates.length; _i < _len; _i++) {
        c = coordinates[_i];
        latLng = new google.maps.LatLng(c.Lat, c.Lng);
        this.outline.push(latLng);
      }
    }

    Suburb.prototype.drawWeighted = function(average) {
      console.log("a=" + this.articles.Suburb);
      return console.log("" + this.name + " has " + this.articles.Results + " compated to " + average);
    };

    Suburb.prototype.draw = function(color) {
      var _this = this;
      this.overlay = new google.maps.Polygon({
        paths: this.outline,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.35
      });
      this.overlay.setMap(this.map);
      return google.maps.event.addListener(this.overlay, 'click', function() {
        var a, _i, _len, _ref, _results;
        console.log(_this.name);
        relatedArticles.children("li").remove();
        relatedArticles.append("<li><a href=\"#\">" + _this.name + "</a></li>");
        _ref = _this.articles;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          a = _ref[_i];
          _results.push(relatedArticles.append("<li><a href=\"#\">" + a.Title + "</a></li>"));
        }
        return _results;
      });
    };

    Suburb.prototype.remove = function() {
      return overlay.setMap(null);
    };

    Suburb.prototype.getArticles = function(term, average) {
      var nameSafe, s;
      nameSafe = this.name.split(" ").join('_');
      s = this;
      return $.ajax({
        url: "http://localhost:8080/search/" + nameSafe + "/" + term,
        dataType: "json",
        success: function(data) {
          var a, _i, _len, _ref, _results;
          this.articles = data;
          console.log("data " + data.Suburb + " \ " + this.articles.Suburb);
          relatedArticles.children("li").remove();
          _ref = this.articles;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            a = _ref[_i];
            _results.push(relatedArticles.append("<li><a href=\"#\">" + a.Title + "</a></li>"));
          }
          return _results;
        },
        error: function(data) {
          return console.log("fail");
        }
      });
    };

    Suburb.prototype.displayArticles = function() {
      var a, _i, _len, _ref, _results;
      relatedArticles.children("li").remove();
      _ref = this.articles;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        a = _ref[_i];
        _results.push(relatedArticles.append("<li><a href=\"#\">" + a.Title + "</a></li>"));
      }
      return _results;
    };

    return Suburb;

  })();

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
        var clean, s, _i, _len, _results;
        clean = parseInt(data.Results.replace(/([a-zA-Z_,\.~-]+)/, ""));
        console.log("|" + (clean.toString(16)) + "|");
        relatedArticles.append("<li><a href=\"#\">Wellington total: " + clean + "</a></li>");
        _results = [];
        for (_i = 0, _len = suburbs.length; _i < _len; _i++) {
          s = suburbs[_i];
          _results.push(s.getArticles(term, clean));
        }
        return _results;
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
        var s, suburb, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          s = data[_i];
          suburb = new Suburb(s.Suburb, s.Coords, googleMap);
          suburb.draw("#ff0000");
          _results.push(suburbs.push(suburb));
        }
        return _results;
      },
      error: function(data) {
        return console.log("fail");
      }
    });
  });

}).call(this);
