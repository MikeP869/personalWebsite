// Michael Parr, P2, CIS 425, 4:30 PM
let http = require("http");
let mysql = require("mysql");
let events = require("events");
let sqlQuery = "";
let output = "";
let res = "";

let eventEmitter = new events.EventEmitter();
eventEmitter.on("processingFinished", processingFinishedHandler); 

let httpServer = http.createServer(processServerRequest);
httpServer.listen(8080);
console.log("Welcome to Movies and About Me Server. Listening on port 8080.")

function processServerRequest(request, response) {
    let hostName = "http://" + request.headers["host"];
    let url = new URL(request.url, hostName);
    let searchMovieTitle = url.searchParams.get("movies");
    res = response;
    response.writeHead(200, "Content-Type: text/html");
    response.write("<head>  <link rel='icon' href='data:;base64,iVBORw0KGgo='> </head>");
    if (searchMovieTitle > 0) {
        sqlQuery = "select title, description, release_year, length, rating from film where film_id = " + searchMovieTitle;
    }
    else {
        sqlQuery = "select title, description, release_year, length, rating from film where film_id = " + Math.floor((Math.random() * 1000) + 1);
    }
    initializeDB();
}

function initializeDB() {
    let connectionString = {
        host: "cis425.cviulu01l3xf.us-west-2.rds.amazonaws.com",
        database: "sakila",
        port: "3306",
        user: "reader",
        password: "Go+Sun+Devils!"
    };
    let con = mysql.createConnection(connectionString);
    console.log("Connecting to database.");
    con.connect(
        function (err) {
            if (err) {
                console.log("Database error");
                throw err;
            }
            else {
                con.query(sqlQuery, processResult);
                con.end();
            }
        }
    );
}

function processResult(err, result) {
    if (err) {
        console.log("Database processing error");
        throw err;
    }
    else {
        result.forEach(printRecord);
        eventEmitter.emit("processingFinished");
    }
}

function printRecord(record) {
    output = `<p><h1 style="text-align: center;">MOVIE INFORMATION</h1><h2>${record.title}</h2><div style="font-size: 20px;">Description: <strong>${record.description}</strong><br>Release Year: <strong>${record.release_year}</strong><br>Length: <strong>${record.length} minutes</strong><br>Rating: <strong>${record.rating}</strong></div></p>`;
}

function processingFinishedHandler() {
    res.write(output);
    console.log("Returned selected movie information to user.")
    res.end();
}