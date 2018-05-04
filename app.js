var express = require('express');
var app = express();
var path = require('path');

app.set("view engine", "ejs");
// app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static('public'))

app.get('/', function (req, res) {
    res.render("graph")
});

var port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log('AizuHealthCareApp V1 Solo listening on port ' + port + '!');
});
