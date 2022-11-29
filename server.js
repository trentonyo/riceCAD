const express = require("express")
const handlebars = require('handlebars')
const express_handlebars = require('express-handlebars')
const bodyParser = require("body-parser")
const axios = require("axios")
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
 * Middleware to parse POST body
 */
app.use(express.json())

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
app.use(express.static("project/"))
app.use(express.static("public/"))
app.use(express.static("lib/"))

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
 * Serve axios source without giving out internal path
 */
app.get("/axios.js", function (req, res, next)
{
    res.status(200).sendFile(__dirname+"/node_modules/axios/dist/axios.js")
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

let appendProjectMetaData = function (req, res, next)
{
    try
    {
        if(req.body)
        {
            let newID = req.body.projectID
            let newMetaData = req.body.metaData

            if (projectMetaDataJSON[newID])
            {
                console.log("OVERWRITE FAILED")
            }
            else
            {
                projectMetaDataJSON[newID] = newMetaData
                projectMetaData = JSON.stringify(projectMetaDataJSON)

                fs.writeFile("/projectMetaData.json", projectMetaData, function (err)
                {
                    if(err)
                    {
                        console.log(err)
                    }
                })

                console.log(`----SERVER: Appended project with ID ${newID} and metadata:\n`,newMetaData) //TODO debugging
            }
        }
        else
        {
            console.log("----SERVER: POST request has no body")
        }
    }
    catch (err)
    {
        console.log(err, "----SERVER: Request body below:\n", req.body)
    }
}

app.post("/projectMetaData.json", appendProjectMetaData)

//START In class

app.post("/projects/:projectID/addProject", function (req, res, next) {

    let projectID = req.params.projectID

    if(req.body && req.body["title"] && req.body["description"])
    {
        console.log("!**!--CLASS", req.body)
        next()
    }
    else
    {
        res.status(400).send("Missing/invalid POST request, need a title and description")
    }
})

//END In class

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

    console.log("----SERVER: Serving project page", projectID)

    if(projectMetaDataJSON)
    {
        if(projectMetaDataJSON[projectID])
        {
            res.status(200).render("projectPage", {
                "projectID" : projectID,
                "title" : projectMetaDataJSON[projectID].title,
                "description" : projectMetaDataJSON[projectID].description,
                "downloads" : projectMetaDataJSON[projectID].downloads,
                "tags" : projectMetaDataJSON[projectID].tags,
                "toolVersion" : packageJSON.version
            })
        }
        else
        {
            console.log(`----SERVER: Project ID ${projectID} not found`)
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
