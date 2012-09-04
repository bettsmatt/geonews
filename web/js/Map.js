(function() {
  var SetupMap, Suburb, googleMap, mapCanvas, relatedArticles, suburbs,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  relatedArticles = $("#relatedArticlesList");

  suburbs = [];

  Suburb = (function() {

    function Suburb(name, coordinates, map) {
      var c, latLng, _i, _len;
      this.name = name;
      this.map = map;
      this.getArticles = __bind(this.getArticles, this);
      this.remove = __bind(this.remove, this);
      this.draw = __bind(this.draw, this);
      this.drawWeighted = __bind(this.drawWeighted, this);
      this.outline = [];
      for (_i = 0, _len = coordinates.length; _i < _len; _i++) {
        c = coordinates[_i];
        latLng = new google.maps.LatLng(c.Lat, c.Lng);
        this.outline.push(latLng);
      }
    }

    Suburb.prototype.drawWeighted = function(average) {
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
        console.log(_this.name);
        relatedArticles.children("li").remove();
        return relatedArticles.append("<li><a href=\"#\">" + _this.name + "</a></li>");
      });
    };

    Suburb.prototype.remove = function() {
      return this.overlay.setMap(null);
    };

    Suburb.prototype.getArticles = function(term, average) {
      var nameSafe;
      nameSafe = this.name.split(" ").join('_');
      return $.ajax({
        url: "http://localhost:8080/search/" + nameSafe + "/" + term,
        dataType: "json",
        success: function(data) {
          this.articles = data;
          remove();
          return drawWeighted(average);
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
        var s, _i, _len, _results;
        console.log("Wellington total: " + data.Results);
        _results = [];
        for (_i = 0, _len = suburbs.length; _i < _len; _i++) {
          s = suburbs[_i];
          _results.push(s.getArticles(term, data.Results));
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

  /*
  
  size = 0.05
  current = 0;
  range = 16;
  	
  createOverlay = (incident) ->
  
  	geo = incident.geolocation
  	
  	lat = new google.maps.LatLng geo.lat - size, geo.long - size * 2
  	lng = new google.maps.LatLng geo.lat + size, geo.long + size * 2
  
  	imageBounds = new google.maps.LatLngBounds lat, lng
  	overlay = new google.maps.GroundOverlay "#{incident.thumbnail_url}", imageBounds
  
  	google.maps.event.addListener overlay, 'click', () => 
  		Window.CreateIncidentModal incident.id
  
  	overlay.setMap googleMap
  
  onSuccess = (data) ->
  	for incident in data.incidents
  		current++
  		createOverlay incident
  		
  onFail = (data) ->
  	console.log "Rest Call failed"
  		
  Window.RWCall onSuccess, onFail, {}, "unapproved_stub", "/start=#{current}/number=#{range}", "GET"
  
  
  # Controls
  nextButton = $ "#nextBtn"
  prevButton = $ "#prevBtn"
  d16Button = $ "#d16"
  d32Button = $ "#d32"
  d64Button = $ "#d64"
  d128Button = $ "#d128"
  d256Button = $ "#d256"
  
  nextButton.click ->
  	console.log "Clicked Next"
  	Window.RWCall onSuccess, onFail, {}, "unapproved_stub", "/start=#{current}/number=#{range}", "GET"
  
  prevButton.click ->
  	console.log "Clicked Prev"
  	current = if current - range > 0 then current - range else 0;
  	Window.RWCall onSuccess, onFail, {}, "unapproved_stub", "/start=#{current}/number=#{range}", "GET"
  	
  changeRange = (newRange) ->
  	current = if current - range > 0 then current - range else 0;
  	range = newRange;
  	Window.RWCall onSuccess, onFail, {}, "unapproved_stub", "/start=#{current}/number=#{range}", "GET"
  
  d16Button.click -> changeRange 16
  d32Button.click -> changeRange 32
  d64Button.click -> changeRange 64
  d128Button.click -> changeRange 128
  d256Button.click -> changeRange 256
  
  
  
  for incident in incidentList.Incidents
  
  	newarkLat = new google.maps.LatLng incident.Lat - size, incident.Lng - size * 2
  	newarkLng = new google.maps.LatLng incident.Lat + size, incident.Lng + size * 2
  	
  	borderCoordinates = [
  		new google.maps.LatLng incident.Lat - size, incident.Lng - size * 2
  		new google.maps.LatLng incident.Lat - size, incident.Lng + size * 2
  		new google.maps.LatLng incident.Lat + size, incident.Lng + size * 2
  		new google.maps.LatLng incident.Lat + size, incident.Lng - size * 2
  		new google.maps.LatLng incident.Lat - size, incident.Lng - size * 2
  	]
  	
  	border = new google.maps.Polyline {
  			path: borderCoordinates,
  			strokeColor: "000000",
  			strokeOpacity: 1,
  			strokeWeight: 1
  	}
  
  		
  	border.setMap googleMap
  */

}).call(this);
