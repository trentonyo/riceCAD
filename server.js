const http = require("http")
const filesystem = require("fs")
const pc = require("playcanvas")

const DEFAULT_PORT = 8080
let port = process.env.PORT ? process.env.PORT : DEFAULT_PORT

const express = require("express")
let app = express()

let serveHomepage = function (req, res, next)
{
    console.log("SERVER: GET Request received (HOME PAGE)")
    console.log("--  URL", req.url)

    res.status(200).sendFile(__dirname+"/public/index.html")
}

app.get("/", serveHomepage)
app.get("/home", serveHomepage)
app.get("/index", serveHomepage)

app.get("/lib/*", function (req, res, next)
{
    console.log("SERVER: GET Request received (lib/)")
    console.log("--  URL", req.url)

    res.status(200).sendFile(__dirname+req.url)
})

app.get("/main.css", function (req, res, next)
{
    console.log("SERVER: GET Request received (main.css)")
    console.log("--  URL", req.url)

    res.status(200).sendFile(__dirname+"/public/main.css")
})

app.get("/playcanvas.js", function (req, res, next)
{
    console.log("SERVER: GET Request received (playcanvas.js)")
    console.log("--  URL", req.url)

    res.status(200).sendFile(__dirname+"/node_modules/playcanvas/build/playcanvas.js")
})

app.get("/project/*", function (req, res, next)
{
    console.log("SERVER: GET Request received (PROJECT)")
    console.log("--  URL", req.url)

    let content = "<html><body>"
    content += "Info about project with ID <span style='color: darkblue'>"
    content += req.url.split("/").reverse()[0]
    content += "</span></body></html>"

    res.status(200).send(content)
})

app.get("*", function (req, res, next) //Star is wildcard
{
    console.log("SERVER: GET Request received (UNROUTED)")
    console.log("--  URL", req.url)

    res.status(404).sendFile(__dirname+"/public/404.html")
})

app.listen(port, undefined,function ()
{
    console.log("SERVER: I'm listening (on port "+port+")")
})
