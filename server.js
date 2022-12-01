const express = require("express")
const handlebars = require('handlebars')
const express_handlebars = require('express-handlebars')
const bodyParser = require("body-parser")
const axios = require("axios")
const fs = require("fs")

const packageJSON = require("./package.json")
const labelsJSON = require("./labels.json")

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
    if(!projectMetaDataJSON)
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
                        res.status(200).send(JSON.stringify(projectMetaDataJSON))
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
            res.status(200).send(JSON.stringify(projectMetaDataJSON))
        }
    }
}

getProjectMetaData() //Initial load
app.get("/projectMetaData.json", getProjectMetaData)

// let appendProjectMetaData = function (req, res, next)
// {
//     try
//     {
//         if(req.body)
//         {
//             let newID = req.body.projectID
//             let newMetaData = req.body.metaData
//
//             if (projectMetaDataJSON[newID])
//             {
//                 console.log("OVERWRITE FAILED")
//             }
//             else
//             {
//                 projectMetaDataJSON[newID] = newMetaData
//
//                 fs.writeFile("/projectMetaData.json", JSON.stringify(projectMetaDataJSON), function (err)
//                 {
//                     if(err)
//                     {
//                         console.log(err)
//                     }
//                 })
//
//                 console.log(`----SERVER: Appended project with ID ${newID} and metadata:\n`,newMetaData) //TODO debugging
//             }
//         }
//         else
//         {
//             console.log("----SERVER: POST request has no body")
//         }
//     }
//     catch (err)
//     {
//         console.log(err, "----SERVER: Request body below:\n", req.body)
//     }
// }
//
// app.post("/projectMetaData.json", appendProjectMetaData)

/**
 * Serve up project plans
 */
app.get("/project/:projectID.plan", function (req, res, next)
{
    res.set({ 'content-type': 'text/plain; charset=utf-8' }).status(200).sendFile(__dirname+`/project/${req.params.projectID}.plan`) //TODO need to detect if the file exists and 404 if not
})

//START In class

app.post("/projects/:projectID/addProject", function (req, res, next) {

    let projectID = req.params.projectID

    if(req.body && req.body["title"] && req.body["description"])
    {
        let project = {
            title: req.body.title,
            description: req.body.description,
            tags: req.body.tags,
            downloads: req.body.downloads,
            palette: req.body.palette
        }

        projectMetaDataJSON[projectID] = project

        fs.writeFile("./projectMetaData.json", JSON.stringify(projectMetaDataJSON, null, 2), function (err) {
            if(err)
            {
                res.status(500).send("Something went wrong, sry")
                console.log(err)
            }
            else
            {
                res.status(200).send("Added a new project")
            }
        })
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
let serveEditor = function(req, res, next)
{
    let projectID = req.params.projectID
    let title
    let description
    let tags
    let downloads
    let palette_materials = {
        "1" : {},
        "2" : {},
        "3" : {},
        "4" : {},
        "5" : {},
        "6" : {},
        "7" : {},
        "8" : {},
        "9" : {}
    }
    let palette_viewport = {
        "background" : {},
        "workingplane" : {}
    }

    //If a projectID is provided, but it is not in the database
    if(projectID && !(projectID in projectMetaDataJSON))
    {
        console.log(`Didn't find ${projectID} in the database`)
        next() //Kick down to a 404
    }
    //If a projectID is provided, and it IS in the database
    else if(projectID && (projectID in projectMetaDataJSON))
    {
        console.log("Trying to open an existing project")
        title = projectMetaDataJSON[projectID].title
        description = projectMetaDataJSON[projectID].description
        tags = projectMetaDataJSON[projectID].tags
        downloads = projectMetaDataJSON[projectID].downloads

        for (let i = 1; i <= 9; i++)
        {
            palette_materials[i.toString()] = projectMetaDataJSON[projectID].palette[i]
        }
        palette_viewport["background"] = projectMetaDataJSON[projectID].palette["background"]
        palette_viewport["workingplane"] = projectMetaDataJSON[projectID].palette["workingplane"]
    }
    //If no projectID is provided
    else //Default values (new project)
    {
        projectID = "DEFAULT"
        title = "Untitled Project"
        description = "Enter a nice description"
        tags = []
        downloads = 0
        palette_materials = {
            "1": {
                "color": "#1c1c21",
                "glass": false
            },
            "2": {
                "color": "#af2d26",
                "glass": false
            },
            "3": {
                "color": "#5e7c16",
                "glass": false
            },
            "4": {
                "color": "#825433",
                "glass": false
            },
            "5": {
                "color": "#8933b7",
                "glass": false
            },
            "6": {
                "color": "#169b9b",
                "glass": false
            },
            "7": {
                "color": "#9e9e96",
                "glass": false
            },
            "8": {
                "color": "#474f51",
                "glass": false
            },
            "9": {
                "color": "#f28caa",
                "glass": false
            }
        }
        palette_viewport = {
            "background": {
                "color": "#92eff5",
                "glass": false,
                "viewport": true
            },
            "workingplane": {
                "color": "#eeffee",
                "glass": false,
                "viewport": true
            }
        }
    }

    res.status(200).render("riceCADEditor", {
        "projectID" : projectID,
        "title" : title,
        "palette_materials" : palette_materials,
        "palette_viewport" : palette_viewport,
        "newLabels" : labelsJSON,
        "projectMetaData" : JSON.stringify(projectMetaDataJSON),
        "toolVersion" : packageJSON.version
    })
}

app.get("/edit/:projectID", function (req, res, next) { serveEditor(req, res, next) })
app.get("/edit", function (req, res, next) { serveEditor(req, res, next) })

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
