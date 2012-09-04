$.ajax
	# type: callType,
	url: "http://localhost:8080/regions"
	# data: json,
	dataType: "json",
	# jsonp: "jsonp"
	# processData: false ,
	# contentType: "application/json;charset=UTF-8",
	# timeout: TIMEOUT,
	success: (data) ->
        console.log "work"
        console.log "Suburb = #{data.data[0].Suburb}"
	error: (data) -> 
        console.log "fail"
