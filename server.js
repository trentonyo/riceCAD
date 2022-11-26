const express = require("express")
const handlebars = require('handlebars');
const express_handlebars = require('express-handlebars');
const fs = require("fs")

const packageJSON = require('./package.json')

let app = express()

const DEFAULT_PORT = 8080
let port = process.env.PORT ? process.env.PORT : DEFAULT_PORT

app.engine('handlebars', express_handlebars.engine({
    defaultLayout: "main"
}));
app.set('view engine', 'handlebars');

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
app.use(express.static("project/"))

let projectMetaData
let projectMetaDataJSON

//// BACK-END

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
let getProjectMetaData = function(req, res, next)
{
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
                    projectMetaData = data
                    projectMetaDataJSON = JSON.parse(data)

                    if(res)
                    {
                        res.status(200).send(projectMetaData)
                    }
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
        if(res)
        {
            res.status(200).send(projectMetaData)
        }
    }
}

getProjectMetaData() //Initial load
app.get("/projectMetaData.json", getProjectMetaData)

//// FRONT-END

/**
 * Render tool page with handlebars
 */
app.get("/edit", function (req, res, next) {
    res.status(200).render("riceCADEditor", {
        "projectMetaData" : projectMetaData,
        "toolVersion" : packageJSON.version
    })
})

let serveHomepage = function (req, res, next)
{
    res.status(200).sendFile(__dirname+"/public/projectPage.html")
}

/**
 * Serve homepages from several URLs
 */
app.get("/", serveHomepage)
app.get("/home", serveHomepage)
app.get("/projects", serveHomepage)

/**
 * Handle project pages
 */
app.get("/projects/:projectID", function (req, res, next)
{
    let projectID = req.params.projectID

    if(projectMetaData)
    {
        if(projectMetaDataJSON[projectID])
        {
            console.log(projectMetaDataJSON[projectID])

            res.status(200).render("projectPage", {
                "projectID" : projectID,
                "projectMetaData" : projectMetaDataJSON[projectID],
                "toolVersion" : packageJSON.version
            })
        }
        else
        {
            next()
        }
    }
    else
    {
        console.log("There's no project meta data loaded")
    }
})

/**
 * 404 - final fallthrough reached
 */
app.get("*", function (req, res, next)
{
    res.status(404).render("pageNotFound", {})
})

app.listen(port, undefined,function ()
{
    console.log("SERVER: I'm listening (on port "+port+")")
})
