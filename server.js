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

app.listen(port)


/**
 * HTTP manual routing method
 */
// const CONTENT_TYPES = {
//     html: "text/html",
//     css: "text/css",
//     js: "application/javascript",
//     jpg: "image/jpeg",
//     jpeg: "image/jpeg",
//     undefined: ""
// }
//
// let pageCache = {}
//
// let getPage = function(url, encode)
// {
//     if(!pageCache[url])
//     {
//         console.log("  ==SERVER: Reading file", url, "from disk...")
//         pageCache[url] = filesystem.readFileSync(url, encode)
//     }
//
//     return pageCache[url]
// }
//
// let pageNotFoundResponse = function (request, response)
// {
//     response.writeHead(404, {
//         "Content-Type": "text/html"
//     })
//
//     response.write(getPage("./public/404.html", "utf8"))
//
//     response.end()
// }
//
// let someRequestResponse = function (request, response)
// {
//     let filepath = request.url
//
//     //The URL '/' should serve the public index
//     filepath = request.url === "/" ? "/index.html" : filepath
//
//     let filepathChunks = filepath.split("/")
//
//     if(filepathChunks.length > 2)
//     {
//         //URL contains a directory
//         filepath = "." + filepath
//     }
//     else
//     {
//         //URL is top-level, need to prepend 'public' directory
//         filepath = "./public" + filepath
//     }
//
//     console.log("----PARSED URL:",filepath)
//
//     let filetypeChunks = filepath.split(".").reverse()
//
//     try
//     {
//         response.writeHead(200, {
//             "Content-Type": CONTENT_TYPES[filetypeChunks[0]]
//         })
//
//         let encoding = "utf8"
//         encoding = filetypeChunks[0] === "jpg" ? undefined : encoding
//         encoding = filetypeChunks[0] === "jpeg" ? undefined : encoding
//
//         response.write(getPage(filepath, encoding))
//
//         response.end()
//     }
//     catch (err)
//     {
//         console.log("----RESPONSE ERROR:", err)
//         pageNotFoundResponse(request, response)
//     }
// }
//
// let handleRequest = function (request, response)
// {
//     console.log("SERVER: Received a request!")
//     console.log("--URL:", request.url)
//
//     someRequestResponse(request, response)
// }
//
// let server = http.createServer(handleRequest)

//Port number (3000): Different applications receive information from network traffic. When traffic comes into the machine, the
//  machine needs to know which application to handle requests for. The network interface is divided into ports, which
//  are claimed by processes. Only one process can use any given port.
//Callback function: called when the server actually starts listening
// server.listen(port, function ()
// {
//     console.log("SERVER: I'm listening (on port "+port+")")
// })
