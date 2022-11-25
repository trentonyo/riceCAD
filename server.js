const express = require("express")
const fs = require("fs")

let app = express()

const DEFAULT_PORT = 8080
let port = process.env.PORT ? process.env.PORT : DEFAULT_PORT

let serveHomepage = function (req, res, next)
{
    res.status(200).sendFile(__dirname+"/public/index.html")
}

/**
 * Log request information at the top of any request
 */
app.use(function (req, res, next)
{
    console.log(`SERVER: ${req.method} Request received`)
    console.log("--  URL", req.url)
    next()
})

/**
 * Serve static files
 */
app.use(express.static("public/"))
app.use(express.static("lib/"))

/**
 * Serve homepages from several URLs
 */
app.get("/", serveHomepage)
app.get("/home", serveHomepage)
app.get("/index", serveHomepage)

/**
 * Serve playcanvas source without giving out internal path
 */
app.get("/playcanvas.js", function (req, res, next)
{
    res.status(200).sendFile(__dirname+"/node_modules/playcanvas/build/playcanvas.js")
})

/**
 * Handle JSON metadata requests
 */
let projectMetaData

app.get("/projectMetaData.json", function (req, res, next) {
    if(!projectMetaData)
    {
        fs.readFile("./projectMetaData.json", "utf8", function (err, data) {
            console.log("FILESYSTEM: First metadata read")
            if(err)
            {
                console.log("FILESYSTEM:",err)
                next()
            }
            else
            {
                try
                {
                    // projectMetaData = JSON.parse(data)
                    projectMetaData = data

                    res.status(200).send(projectMetaData)
                }
                catch (err)
                {
                    console.log("JSON:",err)
                    next()
                }
            }
        })
    }
    else
    {
        res.status(200).send(projectMetaData)
    }
})

/**
 * Handle project pages
 */
app.get("/project/:projectID", function (req, res, next)
{
    let content = "<html><body>"
    content += "<h1>Info about project with ID <span style='color: darkblue'>"
    content += req.params.projectID
    content += "</span></h1></body></html>"

    res.status(200).send(content)
})

/**
 * 404 - final fallthrough reached
 */
app.get("*", function (req, res, next)
{
    res.status(404).sendFile(__dirname+"/public/404.html")
})

app.listen(port, undefined,function ()
{
    console.log("SERVER: I'm listening (on port "+port+")")
})
