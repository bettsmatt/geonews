# Set up the Google map 
relatedArticles = $ "#relatedArticlesList"

suburbs = []

class Suburb

    constructor:(@name, coordinates, @map) ->
    
        @outline = []
        @overlay
        
        for c in coordinates
            latLng = new google.maps.LatLng c.Lat, c.Lng
            @outline.push latLng
    
    drawWeighted: (average) ->
        console.log "a=#{@articles.Suburb}"
        console.log "#{@name} has #{@articles.Results} compated to #{average}"
        
    draw: (color) ->
    
        @overlay = new google.maps.Polygon
            paths: @outline
            strokeColor: color
            strokeOpacity: 0.8
            strokeWeight: 2
            fillColor: color
            fillOpacity: 0.35
            
        @overlay.setMap @map
        
        google.maps.event.addListener @overlay, 'click', =>
            console.log @name 
            relatedArticles.children("li").remove()
            relatedArticles.append "<li><a href=\"#\">#{@name}</a></li>"
            for a in @articles
                relatedArticles.append "<li><a href=\"#\">#{a.Title}</a></li>"
           
        
    remove: () ->
        overlay.setMap null
        
    getArticles: (term, average) ->
    
        nameSafe = @name.split(" ").join('_')
        s = this;
        $.ajax
            url: "http://localhost:8080/search/#{nameSafe}/#{term}"
            dataType: "json",
            success: (data) ->            
                @articles = data
                console.log "data #{data.Suburb} \ #{@articles.Suburb}"
                
                relatedArticles.children("li").remove()
        
                for a in @articles
                    relatedArticles.append "<li><a href=\"#\">#{a.Title}</a></li>"

            error: (data) -> 
                console.log "fail"
         
        
    displayArticles: ->
        relatedArticles.children("li").remove()
        
        for a in @articles
            relatedArticles.append "<li><a href=\"#\">#{a.Title}</a></li>"

SetupMap = () ->
	
	# Map set up
	mapCenter = new google.maps.LatLng -41.288889, 174.777222

	mapOptions = { 
		zoom: 9,
		center: mapCenter,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		disableDefaultUI: true
	}

	elem = document.getElementById 'map_canvas'
	
	new google.maps.Map elem, mapOptions
	
		
googleMap = SetupMap()
google.maps.event.addDomListener(window, "load", googleMap);

# Fix the height of the map, twitter bootstrap fucks it up, it probbly fucks up some other map things aswell
mapCanvas = $ "#map_canvas"
mapCanvas.css {height: "100%" }

$("#search_term").click ->

    term = $("#search_text_box").val()

    console.log "Searching for term #{term}"
    
    $.ajax
        url: "http://localhost:8080/search/Wellington/#{term}"
        dataType: "json",
        success: (data) ->            
            clean = parseInt data.Results.replace(/([a-zA-Z_,\.~-]+)/, "")
            
            
            console.log "|#{clean.toString(16)}|"
            
            relatedArticles.append "<li><a href=\"#\">Wellington total: #{clean}</a></li>"
            
            for s in suburbs
                s.getArticles(term, clean) 

                
        error: (data) -> 
            console.log "fail"
    



$("#populate_regions").click ->
    console.log "Populating regions"

    $.ajax
	    url: "http://localhost:8080/regions"
	    dataType: "json",
	    success: (data) ->
            for s in data
                suburb = new Suburb s.Suburb, s.Coords, googleMap
                suburb.draw "#ff0000"
                suburbs.push suburb

	    error: (data) -> 
            console.log "fail"
    

