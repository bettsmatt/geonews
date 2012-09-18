# Set up the Google map 
relatedArticles = $ "#relatedArticlesList"

# Collection of regions on the map
regions = {};

#Setup the map
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
mapCanvas.css {height: "100%"}

$("#search_term").click ->

    term = $("#search_text_box").val()

    console.log "Searching for term #{term}"
    
    $.ajax
        url: "http://localhost:8080/search/Wellington/#{term}"
        dataType: "json",
        success: (data) ->
        
            cleanTotal = parseInt data.Results.replace(/([a-zA-Z_,\.~-]+)/, "")
                        
            relatedArticles.children("li").remove()
            relatedArticles.append "<li><a href=\"#\">Wellington total: #{cleanTotal}</a></li>"

                        
            $.each regions, (k,v) ->
                v.setMap null
            
            $.each regions, (k, v) ->
                console.log "searching for #{v.Suburb}"
                
                safeName = "#{k}".split(" ").join('_')
                
                $.ajax
                    url: "http://localhost:8080/search/#{safeName}/#{term}"
                    dataType: "json",
                    success: (data) ->         
                        cleanResults = parseInt data.Results.replace(/([a-zA-Z_,\.~-]+)/, "")
                        console.log "Success for #{k} 0 #{cleanResults}"
                        v.setMap googleMap
                        if cleanResults < cleanTotal
                            v.setOptions {fillColor:"#FF0000"}
                        else
                            v.setOptions {fillColor:"#00FF00"}
                        
                    error: (data) -> 
                        console.log "fail"

        error: (data) -> 
            console.log "fail"

#Fetch and draw all regions on the map
$("#populate_regions").click ->
    console.log "Populating regions"

    $.ajax
	    url: "http://localhost:8080/regions"
	    dataType: "json",
	    success: (data) ->
	    
            $.each data, (k, v) ->
                console.log "k:#{k} - v:#{v.Suburb}"
                
                outline = []
                
                for c in v.Coords
                    latLng = new google.maps.LatLng c.Lat, c.Lng
                    outline.push latLng
                
                overlay = new google.maps.Polygon
                    paths: outline
                    strokeColor: "#222222"
                    strokeOpacity: 0.8
                    strokeWeight: 2
                    fillColor: "#999999"
                    fillOpacity: 0.35
            
                overlay.setMap googleMap    
                
                regions["#{v.Suburb}"] = overlay 
                
	    error: (data) -> 
            console.log "fail to fetch regions"

#Clear all regions from the map
$("#clear_regions").click ->
    console.log "Clearing Regions"
    
    $.each regions, (k,v) ->
        v.setMap null

