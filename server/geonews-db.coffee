mysql = require 'mysql'

tblSearch = "search"
tblArticle = "article"

schemaSearch = "(
    Query varchar(255),
    Suburb varchar(255),
    Hits varchar(255)
)"

schemaArticle = "(
    Query varchar(255),
    Suburb varchar(255),
    Title varchar(255),
    Body varchar(255),
    Link varchar(255) 
)"

db = "geonews"

connection = mysql.createConnection
    host: 'localhost'
    user: 'user'
    password: 'pass'
    
connection.connect()

console.log "Connected"



connection.query "DROP DATABASE #{db}"
connection.query "CREATE DATABASE #{db}"
connection.query "CREATE TABLE #{db}.#{tblSearch}#{schemaSearch}"
connection.query "CREATE TABLE #{db}.#{tblArticle}#{schemaArticle}"

###
connection.query "SELECT * FROM  #{db}.#{tblSearch} 
        WHERE Suburb = 'wellington' AND Query = 'crime' ", (err, results) ->
    if err
        throw err
    
    # Found a cached match
    console.log "Found #{results.length} matchs in database, Loading"

###
###
connection.query "SELECT * FROM  #{db}.#{tblSearch} 
        WHERE Suburb = 'wellington' AND Query = 'crime' ", (err, results) ->
    if err 
        throw err

    console.log "Fetched #{results.length} Articles"


###
###
connection.query "SELECT * FROM  #{db}.#{tblArticle} 
        WHERE Suburb = 'crime' AND Query = 'wellington' ", (err, results) ->
            if err 
                throw err
    
            console.log "Fetched #{results.length} Articles"
###
console.log "Completed"

connection.end()
