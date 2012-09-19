# Set up the Google map 
relatedArticles = $ "#relatedArticlesList"

# Collection of regions on the map
regions = {};

#Lables
resultsWellington = $ "#Results_Wellington"
resultsSuburb = $ "#Results_Suburb"

#Setup the map
SetupMap = () ->
	
	# Map set up
	mapCenter = new google.maps.LatLng -41.288889, 174.777222
	
	style = `
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
    ]`

	mapOptions = {
		styles: style,
		zoom: 12,
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
             
             
            resultsWellington.text "Wellington | #{cleanTotal}"
            #relatedArticles.children("li").remove()
            #relatedArticles.append "<li><a href=\"#\">Wellington total: #{cleanTotal}</a></li>"

                        
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
                        

                        
                        #Solid Color if More results then Wellington probbly an error
                        if cleanResults > cleanTotal
                            v.setOptions {fillColor:"#FF0000"}
                            
                        #Weight bases on amount found
                        else
                            percent = cleanResults / cleanTotal
                            color = 255 * percent;
                            colorf = color.toFixed 0
                            hex = colorf.toString 16
                            console.log "Found #{cleanResults} of #{cleanTotal} this is #{percent}% - color #{color} hex - #{hex}"
                            
                            if colorf < 1
                                v.setOptions {fillColor:"#000000"}
                            else if colorf < 2
                                v.setOptions {fillColor:"#200000"}  
                            else if colorf < 3
                                v.setOptions {fillColor:"#400000"}  
                            else if colorf < 4
                                v.setOptions {fillColor:"#600000"}  
                            else if colorf < 6
                                v.setOptions {fillColor:"#800000"}  
                            else if colorf < 8
                                v.setOptions {fillColor:"#100000"}  
                            else if colorf < 16
                                v.setOptions {fillColor:"#B00000"} 
                            else if colorf < 32
                                v.setOptions {fillColor:"#D00000"}   
                             else
                                v.setOptions {fillColor:"#FF0000"}      

                        google.maps.event.addListener v, "mouseover", ->
                            resultsSuburb.text "#{k} | #{cleanResults}"
                            
                        google.maps.event.addListener v, "click", ->
                            relatedArticles.children("li").remove()
                            for a in data.Articles
                                relatedArticles.append "<li><a href=\"#\">#{a.Title}</a></li>"
                        
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
                    strokeColor: "#FFFFFF"
                    strokeOpacity: 1
                    strokeWeight: 1
                    fillColor: "#222222"
                    fillOpacity: 1
            
                overlay.setMap googleMap
                
                regions["#{v.Suburb}"] = overlay 
                
	    error: (data) -> 
            console.log "fail to fetch regions"

#Clear all regions from the map
$("#clear_regions").click ->
    console.log "Clearing Regions"
    
    $.each regions, (k,v) ->
        v.setMap null

