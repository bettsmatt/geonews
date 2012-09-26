# Set up the Google map 
relatedArticles = $ "#relatedArticlesList"
menuWell = $ "#menuWell"
relatedArticlesHeader = $ "#relatedArticlesHeader"

# Collection of regions on the map
regions = {};

#Lables
resultsWellington = $ "#Results_Wellington"
resultsSuburb = $ "#Results_Suburb"

scale = $ "#over_map_scale"
help = $ "#over_map_help"

helpButton = $ "#helpButton"
helpButton.popover({placement:"right"})

# Record mouse movement, nessary to draw tool tips when clicking on overlays on the map

mapTip = $ "<div class=\"myToolTip\" rel=\"tooltip\" title=\"Map tool tip\" style = \"\"></div>"
$("body").append mapTip
mapTip.hide()
mousePos = { x: -1, y: -1 }
$(document).mousemove (e) ->
    mousePos = {x: e.pageX, y: e.pageY }
    mapTip.css {top: "#{e.pageY + 20}px"; left: "#{e.pageX}px";}
    #console.log "#{mousePos.x}, #{mousePos.y}"
    
    #Really hacky, need to do this better
    #The help popup is positioned off the screen so we need to put it back on the screen
    popover = $ ".popover"
    if popover.length > 0
        cssVal = popover.css("top")
        if cssVal[0] == '-'
            console.log("Adjusting top to 7px")
            popover.css {top:"7px"}
    
#Setup the map
SetupMap = () ->
	
	# Map set up
	mapCenter = new google.maps.LatLng -41.278889, 174.737222
	
	# Custom map styles
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
    
    # Position and Zoom
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
                        

                        
                        # Solid Color if More results then Wellington probbly an error
                        if cleanResults > cleanTotal
                            v.setOptions {fillColor:"#FF0000"}
                            
                        # Weight bases on amount found
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

                        # Highlight when moused over
                        google.maps.event.addListener v, "mouseover", ->
                            mapTip.show()
                            mapTip.text "#{k} - #{data.Results} Articles"
                            v.setOptions {strokeWeight:4}  
                            
                        google.maps.event.addListener v, "mouseout", ->
                            v.setOptions {strokeWeight:1} 
                            mapTip.hide()
                            
                        # Display Articles when a region is clicked on
                        google.maps.event.addListener v, "click", ->
                        
                            relatedArticles.slideUp "slow", ->
                                relatedArticles.children("li").remove()
                                relatedArticles.children("a").remove()
                                
                                relatedArticles.append "
                                    <li class=\"nav-header\" id=\"relatedArticlesHeader\">
                                        Showing #{data.Articles.length} of #{data.Results} for <b>#{k}</b>
                                    </li>"
                                
                                num = 1;
                                for a in data.Articles
                                    
                                    articleElem = $ "<a rel=\"popover\" data-content=\"#{a.Body}\" data-original-title=\"#{a.Title}\" href=\"#{a.Link}\">
                                    #{num++}) #{a.Title}...</a>" 
                                    articleElem.popover({placement:"right"})
                                    articleElemWrapper = $ "<li> </li>"
                                    articleElemWrapper.append articleElem
                                    
  
                                    
                                    relatedArticles.append articleElemWrapper
                                    relatedArticles.append "<li class=\"divider\" style=\"margin-top:1px;margin-bottom:1px;\"></li>"
                                    
                                    
                                # menu controls
                                relatedArticles.append "
                                    <a id=\"CloseButton\" href=\"\">
                                        <i class=\"icon-chevron-up icon-black\"></i>
                                        Close
                                    </a>
                                    <a class=\"pull-right\" href=\"\">
                                        Next
                                        <i class=\"icon-chevron-right icon-black\"></i>
                                    </a>
                                    <a href=\"\" class=\"noHover pull-right\">
                                        <i class=\"icon-chevron-left disabled icon-black\"></i>
                                        <del>Previous</del>
                                    </a>
                                "
                                
                                relatedArticles.find("#CloseButton").click ->
                                    relatedArticles.slideUp "slow"
                                    false
                                

                                relatedArticles.slideDown "slow"
                                
                                
                                
                                
                    error: (data) -> 
                        console.log "fail"

        error: (data) -> 
            console.log "fail"

#Fetch and draw all regions on the map
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
            
            suburb = data.Sub
            
            # Highlight when moused over
            google.maps.event.addListener overlay, "mouseover", ->
                mapTip.show()
                mapTip.text "#{v.Suburb}"
                overlay.setOptions {strokeWeight:4}  
                
            google.maps.event.addListener overlay, "mouseout", ->
                overlay.setOptions {strokeWeight:1} 
                mapTip.hide()
                            
            
            
    error: (data) -> 
        console.log "fail to fetch regions"

