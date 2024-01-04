/*
Author: Trenton Young
Date: 4 January 2024
 */

/********************************************
*   DEPENDENCIES
********************************************/

/// Node Modules
const express = require("express")
const express_handlebars = require('express-handlebars')
const fs = require("fs")
const postgres = require('pg');

/// Local Modules
const db = require('./app/db-connectors')
const tools = require('./lib/tools')

/// Flat Files
const packageJSON = require("./package.json")
const tagPropertiesJSON = require("./tagProperties.json")
const approvedAddressesJSON = require("./approvedRobotAddresses.json")

/********************************************
 *   SERVER SETTINGS
 ********************************************/

let app = express()
const db_pool = new postgres.Pool({
    connectionString: db.remote_url,
    ssl: {
        rejectUnauthorized: false,
    }
})

let port = process.env.PORT ? process.env.PORT : tools.DEFAULT_PORT

app.engine('handlebars', express_handlebars.engine({
    defaultLayout: "main"
}));
app.set('view engine', 'handlebars');

/********************************************
 *   EXPRESS MIDDLEWARE
 ********************************************/

/**
 * Middleware to parse POST body
 */
app.use(express.json())

/**
 * Serve static files
 */
app.use(express.static("project/"))
app.use(express.static("public/"))
app.use(express.static("lib/"))

/**
 * Serve playcanvas source without giving out internal path
 */
app.get("/playcanvas.js", function (req, res, next) {
    res.status(200).sendFile(__dirname+"/node_modules/playcanvas/build/playcanvas.js")
})

/**
 * Serve axios source without giving out internal path
 */
app.get("/axios.js", function (req, res, next) {
    res.status(200).sendFile(__dirname+"/node_modules/axios/dist/axios.js")
})

/********************************************
 *   DATA HELPERS
 ********************************************/

let generateNewProjectID = function (title) { /*TODO*/ }

/********************************************
 *   ROUTING HELPERS
 ********************************************/

let incrementDownloads = function(projectID) {
    db.pool.query(`SELECT downloads FROM public.projects WHERE project_id='${projectID}';`, function (err, results, fields) {
        let incremented_downloads = results.rows[0].downloads
        incremented_downloads++

        db.pool.query(`UPDATE public.projects SET downloads = ${incremented_downloads} WHERE project_id='${projectID}';`, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
        })
    })
}

let incrementBuilds = function(projectID, robotAddress) {
    if (approvedAddressesJSON.indexOf(robotAddress) === -1) {
        console.log("Unapproved address attempted to increment approved builds")
        return false
    }

    db.pool.query(`SELECT builds FROM public.projects WHERE project_id='${projectID}';`, function (err, results, fields) {
        let newBuilds = 0
        let firstResult = results.rows[0]

        if (firstResult.prototype.hasOwnProperty("builds")) {
            //Increment builds
            newBuilds = firstResult.rows[0].builds
        }

        db.pool.query(`UPDATE public.projects SET builds = ${newBuilds} WHERE project_id='${projectID}';`, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
        })
    })
}

/**
 * Render tool page with handlebars
 */
let serveEditor = async function(req, res, next) {
    let projectID = req.params.projectID
    let title
    let description

    //Adds ALL tags
    let tags = {}
    for (let tag in tagPropertiesJSON)
    {
        tags[tag] = JSON.parse(JSON.stringify(tagPropertiesJSON[tag])) //Dirty clone, sorry
    }

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
    let output = {}

    //If a projectID is provided, but it is not in the database
    //
    // if(projectID && !(projectID in projectMetaDataJSON))
    //     {
    //         console.log(`Didn't find ${projectID} in the database`)
    //         next() //Kick down to a 404
    //     }

    // TODO use checkID
    let response = await checkProjectID(projectID).then(function (validID) {
        // Project ID is validated

        tools.consoleDebug("Trying to open an existing project")
        title = projectMetaDataJSON[projectID].title
        description = projectMetaDataJSON[projectID].description
        downloads = projectMetaDataJSON[projectID].downloads

        let projectTags = projectMetaDataJSON[projectID].tags
        tools.consoleDebug(["In serving the editor, project tags:", projectTags])

        for (let currentTag in projectTags)
        {
            tags[currentTag]["checked"] = true
        }

        for (let i = 1; i <= 9; i++)
        {
            palette_materials[i.toString()] = projectMetaDataJSON[projectID].palette[i]
        }
        palette_viewport["background"] = projectMetaDataJSON[projectID].palette["background"]
        palette_viewport["workingplane"] = projectMetaDataJSON[projectID].palette["workingplane"]

        if("parentProjectID" in projectMetaDataJSON[projectID])
        {
            output["parentProjectID"] = projectMetaDataJSON[projectID].parentProjectID
        }
    }).catch(function () {
        // No valid project ID, serve default

        projectID = "DEFAULT"
        title = "Untitled Project"
        description = "Enter a nice description"
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
                "color": "#73A3A8",
                "glass": false,
                "viewport": true
            },
            "workingplane": {
                "color": "#eeffee",
                "glass": false,
                "viewport": true
            }
        }
    })

    output = {
        "projectID" : projectID,
        "title" : title,
        "description" : description,
        "downloads" : downloads,
        "palette_materials" : palette_materials,
        "palette_viewport" : palette_viewport,
        "tags" : tags,
        "projectMetaData" : JSON.stringify(projectMetaDataJSON),
        "toolVersion" : packageJSON.version
    }

    res.status(200).render("riceCADEditor", output)
}

/**
 * Handle project pages
 */
let serveProjectPage = function (req, res, next) {
    let projectID = req.params.projectID

    tools.consoleDebug(["----SERVER: Serving project page", projectID])

    if(projectMetaDataJSON)
    {
        if(projectMetaDataJSON[projectID])
        {
            let output = {
                "projectID" : projectID,
                "title" : projectMetaDataJSON[projectID].title,
                "description" : projectMetaDataJSON[projectID].description,
                "downloads" : projectMetaDataJSON[projectID].downloads,
                "builds" : projectMetaDataJSON[projectID].builds,
                "palette_materials" : projectMetaDataJSON[projectID].palette_materials,
                "palette_viewport" : projectMetaDataJSON[projectID].palette_viewport,
                "tags" : projectMetaDataJSON[projectID].tags,
                "toolVersion" : packageJSON.version
            }

            if("parentProjectID" in projectMetaDataJSON[projectID])
            {
                output["parentProjectID"] = projectMetaDataJSON[projectID].parentProjectID
            }

            res.status(200).render("projectPage", output)
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
}

let serveHomepage = function (req, res, next) {
    // db.pool.query("SELECT * FROM projects;", function(err, results, fields)
    db_pool.query("SELECT * FROM projects;", function(err, results, fields)
    {
        res.status(200).render("homePage", {
            "projects" : results,
            "toolVersion" : packageJSON.version,
            "tags" : tagPropertiesJSON
        })
    })
}

/********************************************
 *   REQUEST ROUTING
 ********************************************/

app.get('/about', function (req, res, next) {
    res.status(200).render('aboutPage', {
        "toolVersion" : packageJSON.version
    });
});

app.get('/tutorial', function (req, res, next){
    res.status(200).render('tutorialPage', {
        "toolVersion" : packageJSON.version
    });
});

/**
 * Serve up project plans
 */
app.get("/project/:projectID.plan", function (req, res, next)  {
    let path = `${__dirname}/project/${req.params.projectID}.plan`

    try
    {
        fs.accessSync(path)

        tools.consoleDebug(["Query:", req.query])

        let built = false

        if("addr" in req.query && req.query.addr)
        {
            built = incrementBuilds(req.params.projectID, req.query.addr)
        }

        if(!built && "download" in req.query && req.query.download)
        {
            incrementDownloads(req.params.projectID)
        }

        res.set({ 'content-type': 'text/plain; charset=utf-8' }).status(200).sendFile(path)
    }
    catch (err)
    {
        next()
    }
})

/**
 * Serve up project thumbnails
 */
app.get("/project/:projectID.png", function (req, res, next) {

    res.set({ 'content-type': 'image/png' }).status(200).sendFile(__dirname+`/project/${req.params.projectID}.png`, function (err) {
        if(err && err.code === "ENOENT")
        {
            res.set({ 'content-type': 'image/png' }).status(200).sendFile(__dirname+`/project/${tools.DEFAULT_PROJECT_ID}.png`, function (err) {
                if(err)
                {
                    console.log("---- SERVER: Unable to read default thumbnail!", err)
                    next()
                }
            })
        }
        else if(err)
        {
            console.log("---- SERVER: Something strange went wrong while serving a thumbnail", err)
            next()
        }
    })
})

app.get("/edit/:projectID", function (req, res, next) { serveEditor(req, res, next) })

app.get("/edit", function (req, res, next) { serveEditor(req, res, next) })

/**
 * Serve homepages from several URLs
 */
app.get("/", serveHomepage)
app.get("/home", serveHomepage)
app.get("/projects", serveHomepage)

app.get("/projects/:projectID", serveProjectPage)

/**
 * 404 - final fallthrough reached
 */
app.get("*", function (req, res, next)  {
    res.status(404).render("pageNotFound", {
        "toolVersion" : packageJSON.version
    })
})

/********************************************
 *   SERVER INITIALIZATION
 ********************************************/

app.listen(port, undefined,function () {
    console.log("SERVER: I'm listening http://localhost:"+port)
})
