jsdom  = require "jsdom"
fs     = require "fs"
csv = require('csv');
restify = require "restify"
mysql = require 'mysql'

jqueryfile = fs.readFileSync "./jquery-1.8.0.min.js"
jquery = jqueryfile.toString()

server = restify.createServer()

tblSearch = "search"
tblArticle = "article"
db = "geonews"

###
Read in region data
###

regionList = []
regionsCsv = csv().fromPath __dirname + '/data/wellington-city-suburbs.csv', { columns: true }
regionsCsv.transform (data) ->

	multiploygon = data.WKT
	gpsString = multiploygon.substr 16, multiploygon.length - 19
	gpsCoords = gpsString.split "," 
	
	#console.log " data.suburb : #{data.suburb}"
	
	region =
		Suburb: data.suburb
	
	coords = []
	
	for i in [0..gpsCoords.length - 1]
		
		latLng = gpsCoords[i].split " "
		
		coord = 
			Lat:latLng[1]
			Lng:latLng[0]
		
		coords.push coord
			
	region.Coords = coords	
	
	regionList.push region

###
Set up database connection
###

connection = mysql.createConnection
    host: 'localhost'
    user: 'user'
    password: 'pass'
    
connection.connect()

connection.query "INSERT INTO #{db}.#{tblSearch}(Query, Suburb, Hits) VALUES ( \"term1\" , \"suburb1\", \"result1\" )"

###
Search for a term on google, get resuts for each regions
###
search = (req, res, next) ->
    suburb = req.params[1]
    term = req.params[2]

    console.log "Received Request for #{req.params[1]} & #{req.params[2]}, Checking database"
        
    # Check the database for a cached search
    connection.query "SELECT * FROM  #{db}.#{tblSearch} WHERE Suburb = '#{suburb}' AND Query = '#{term}'", (err, results) ->
        if err 
            throw err
        
        if results > 0
            console.log "Found match in database"
    
    
    
    jsdom.env
        html: "https://www.google.co.nz/search?q=#{suburb}%20#{term}&as_sitesearch=stuff.co.nz"
        src: [ jquery ]
        done: (errors, window) ->

            $ = window.$
            results = $('#resultStats').text().split(" ")[1]
            articles = []	

            # Find each article
            $(".g").each ->
				
                blurb = $(this).find(".st").text().split " ... " 
                article =
                    Title: $(this).find("h3").text().split(" | ")[0]
                    Body: blurb[1]
                    Date: blurb[0]
                    Link: "http://www.google.co.nz" + $(this).find("a").attr("href")
				
                console.log $(this).find("h3").text().split(" | ")[0]
                articles.push article
                
            # console.log "Completed Search for: #{req.params[1]} & #{req.params[2]}"    
            
            connection.query "INSERT INTO #{db}.#{tblSearch}(Query, Suburb, Hits) VALUES ( \"#{term}\" , \"#{suburb}\", \"#{results}\" )"
            
            res.send
                Results: results
                Suburb: suburb
                Term: term
                Articles: articles
  
regions = (req, res, next) ->
	res.send regionList	
  
###
REST CALLS
###
server.get "/regions", regions
server.get /^\/(search)\/([a-zA-Z0-9_\.~-]+)\/([a-zA-Z0-9_\.~-]+)/, search

###
Start Server
###
server.listen 8080, ->
  console.log "#{server.name} listening at #{server.url}"



