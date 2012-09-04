(function() {

  $.ajax({
    url: "http://localhost:8080/regions",
    dataType: "json",
    success: function(data) {
      console.log("work");
      return console.log("Suburb = " + data.data[0].Suburb);
    },
    error: function(data) {
      return console.log("fail");
    }
  });

}).call(this);
