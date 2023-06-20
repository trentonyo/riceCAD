const express = require("express")
const handlebars = require('handlebars')
const express_handlebars = require('express-handlebars')
const bodyParser = require("body-parser")
const axios = require("axios")
const fs = require("fs")

const db = require('./app/db-connector')
const tools = require('./lib/tools')

const packageJSON = require("./package.json")
const tagPropertiesJSON = require("./tagProperties.json")
const approvedAddressesJSON = require("./approvedRobotAddresses.json")

tools.consoleDebug(["Approved addresses for build:", approvedAddressesJSON])

let app = express()

const DEFAULT_PORT = 8080
let port = process.env.PORT ? process.env.PORT : DEFAULT_PORT

const DEFAULT_PROJECTID = "DEFAULT"

app.engine('handlebars', express_handlebars.engine({
    defaultLayout: "main"
}));
app.set('view engine', 'handlebars');

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

let projectMetaDataJSON

//// BACK-END

app.get('/about', function (req, res, next) {
    res.status(200).render('aboutPage');
});

app.get('/tutorial', function (req, res, next){
    res.status(200).render('tutorialPage');
});

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
            if(err)
            {
                console.log("FILESYSTEM:", err)
                next()
            }
            else
            {
                try
                {
                    projectMetaDataJSON = JSON.parse(data)

                    if(res)
                    {
                        res.status(200).send(JSON.stringify(projectMetaDataJSON))
                    }
                }
                catch (err)
                {
                    console.log("JSON:", err)
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

let incrementDownloads = function(projectID)        // TODO refactor to UPDATE the server
{
    db.pool.query(`SELECT downloads FROM public.projects WHERE project_id='${projectID}';`, function (err, results, fields)
    {
        console.log("SELECT downloads results:", results)
        let incremented_downloads = results.rows[0].downloads
        incremented_downloads++
        console.log("Which makes downloads:", incremented_downloads)

        db.pool.query(`UPDATE public.projects SET downloads = ${incremented_downloads} WHERE project_id='${projectID}';`, function (err, results, fields)
        // db.pool.query(`-- UPDATE public.projects SET downloads = 69 WHERE project_id='${projectID}';`, function (err, results, fields)
        {
            if(err)
            {
                console.log(err)
            }
        })
    })

    if (!(projectID in projectMetaDataJSON))
    {
        console.log("Attempting to increment downloads for invalid project ID.")
        return
    }

    let newDownloads = ++projectMetaDataJSON[projectID].downloads

    fs.writeFile("./projectMetaData.json", JSON.stringify(projectMetaDataJSON, null, 2), function (err) {
        if(err)
        {
            console.log(err)
        }
        else
        {
            tools.consoleDebug(["Incremented downloads for", projectID, ". New download count:", newDownloads])
        }
    })
}
let incrementBuilds = function(projectID, robotAddress) //TODO refactor to UPDATE the database
{
    if (!(projectID in projectMetaDataJSON))
    {
        console.log("Attempting to increment builds for invalid project ID.")
        return false
    }
    if (approvedAddressesJSON.indexOf(robotAddress) === -1)
    {
        console.log("Unapproved address attempted to increment approved builds")
        return false
    }

    if (!("builds" in projectMetaDataJSON[projectID]))
    {
        projectMetaDataJSON[projectID]["builds"] = 0
    }

    let newBuilds = ++projectMetaDataJSON[projectID].builds

    fs.writeFile("./projectMetaData.json", JSON.stringify(projectMetaDataJSON, null, 2), function (err) {
        if(err)
        {
            console.log(err)
        }
        else
        {
            tools.consoleDebug(["Incremented approved builds for", projectID, ". New builds count:", newBuilds])
        }
    })

    return true
}

/**
 * Serve up project plans
 */
app.get("/project/:projectID.plan", function (req, res, next)
{
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
            res.set({ 'content-type': 'image/png' }).status(200).sendFile(__dirname+`/project/${DEFAULT_PROJECTID}.png`, function (err) {
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

//START In class
/**
 * Generate new project ID
 */
let generateNewProjectID = function (title)         //TODO refactor to use database, instead of 'in' do a query (do a postcheck loop)
{
    let salt = 0
    let newID = ""

    if(title.length === 0)
    {
        title = "DEFAULT"
    }

    while(!(newID in projectMetaDataJSON))
    {
        /**
         * Returns a color from a string's hash
         * based on esmiralha's StackOverflow response (https://stackoverflow.com/a/7616484)
         */
        let hash = 0
        let chr

        for(let i = 1; i <= 3; i++)
        {
            for (let j = (title.length / 3) * (i - 1); j < (title.length / 3) * i; j++)
            {
                chr = title.charCodeAt(j)
                hash = ((hash << 5) - hash) + chr + salt
                hash |= 0 // Convert to 32bit integer
            }
            let next = "00" + Math.abs(hash % (36 * 36)).toString(36)
            next = next.slice(-2)

            newID = `${newID}${next}`
        }

        if(!(newID in projectMetaDataJSON))
        {
            projectMetaDataJSON[newID] = {
                "title" : title
            }
        }
        else
        {
            newID = ""
            salt++
        }
    }

    return newID
}

/**
 * Handle a POST for new project metadata
 */
//TODO FIRST STEP need to add the tag relationship
app.post("/projects/addProjectMetaData", function (req, res, next) {

    if(req.body && req.body["title"] && req.body["description"])
    {
        let projectID = generateNewProjectID(req.body["title"])

        tools.consoleDebug(req.body)

        let project = {
            title: req.body.title,
            description: req.body.description,
            tags: {},
            downloads: req.body.downloads,
            palette: req.body.palette
        }
        let parentID_digest = "null"
        if("existingProjectID" in req.body)
        {
            project["parentProjectID"] = req.body.existingProjectID
            parentID_digest = `'${req.body.existingProjectID}'`
        }

        tools.consoleDebug(["Tags in the POST metadata request:", req.body.tags])

        for (let i = 0; i < req.body.tags.length; i++) {
            let currentTag = req.body.tags[i]

            tools.consoleDebug(["In the tags for,", currentTag])

            project.tags[currentTag] = tagPropertiesJSON[currentTag] //TODO remove after refactor
        }

        projectMetaDataJSON[projectID] = project //TODO remove after refactor

        let pal = project.palette

        let insertProjectQuery = `INSERT INTO public.projects (project_id, title, description, downloads, builds, 
                             parent_id, palette_1_hex, palette_2_hex, palette_3_hex, palette_4_hex, palette_5_hex, 
                             palette_6_hex, palette_7_hex, palette_8_hex, palette_9_hex, palette_1_glass, palette_2_glass, 
                             palette_3_glass, palette_4_glass, palette_5_glass, palette_6_glass, palette_7_glass, 
                             palette_8_glass, palette_9_glass, viewport_background_hex, viewport_workingplane_hex)
        VALUES ('${projectID}', '${tools.sanitize(project.title)}', '${tools.sanitize(project.description)}', ${project.downloads}, null, ${parentID_digest},
                '${pal['1'].color}', '${pal['2'].color}', '${pal['3'].color}', '${pal['4'].color}', '${pal['5'].color}', '${pal['6'].color}', '${pal['7'].color}', '${pal['8'].color}', '${pal['9'].color}', 
                ${pal['1'].glass}, ${pal['2'].glass}, ${pal['3'].glass}, ${pal['4'].glass}, ${pal['5'].glass}, ${pal['6'].glass}, ${pal['7'].glass}, ${pal['8'].glass}, ${pal['9'].glass},
                '${pal['background'].color}', '${pal['workingplane'].color}');`

        db.pool.query(insertProjectQuery, function(err, results, fields)
        {
            if(err)
            {
                console.log("--- Query ---")
                console.log(insertProjectQuery)
                console.log("--- End Query ---")
                console.log("While INSERTing new project:", err)
            }
        })

        for (let i = 0; i < req.body.tags.length; i++) {
            let currentTag = req.body.tags[i]

            let query = `INSERT INTO public.projects_tags (project_id, tag_id)
                         SELECT '${projectID}', tags_id
                         FROM public.tags
                         WHERE name='${currentTag}';`

            db.pool.query(query, function(err, results, fields)
            {
                if(err)
                {
                    console.log(err)
                }
            })
        }

        fs.writeFile("./projectMetaData.json", JSON.stringify(projectMetaDataJSON, null, 2), function (err) {
            if(err)
            {
                res.status(500).send("SERVER: Something went wrong. It's not you, it's me.")
                console.log(err)
            }
            else
            {
                res.status(200).send(projectID)
            }
        })
    }
    else
    {
        console.log(`-- SERVER: Got an invalid POST request, req.body: ${req.body}`)
        res.status(400).send("Missing/invalid POST request, need a title and description")
    }
})

/**
 * Handle a POST for new project plan
 */
app.post("/projects/addProjectPlan", function (req, res, next) {

    if(req.body && req.body["plan"] && req.body["projectID"])
    {
        let projectID = req.body.projectID
        let planContent = req.body.plan

        fs.writeFile(`./project/${projectID}.plan`, planContent, function (err) {
            if(err)
            {
                res.status(500).send("SERVER: Something went wrong. It's not you, it's me.")
                console.log(err)
            }
            else
            {
                req.params.projectID = projectID
                serveProjectPage(req, res, next)
            }
        })
    }
    else
    {
        console.log(`-- SERVER: Got an invalid POST request, req.body: ${req.body}`)
        res.status(400).send("Missing/invalid POST request, need a title and description")
    }
})

/**
 * Handle a PUT for new project thumbnail
 */
app.post("/projects/addProjectThumbnail", function (req, res, next) {

    if(req.body && req.body["thumbnail"] && req.body["projectID"])
    {
        let projectID = req.body.projectID
        let thumbnail = req.body.thumbnail

        fs.writeFile(`./project/${projectID}.png`, thumbnail, undefined, function (err) {
            if(err)
            {
                res.status(500).send("SERVER: Something went wrong. It's not you, it's me.")
                console.log(err)
            }
            else
            {
                res.status(200).send(projectID)
            }
        })
    }
    else
    {
        console.log(`-- SERVER: Got an invalid POST request, req.body: ${req.body}`)
        res.status(400).send("Missing/invalid POST request, need a title and description")
    }
})

//END In class

//// FRONT-END

/**
 * Render tool page with handlebars
 */
//TODO last step probably, SELECT from the database
let serveEditor = function(req, res, next)
{
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
    if(projectID && !(projectID in projectMetaDataJSON))
    {
        console.log(`Didn't find ${projectID} in the database`)
        next() //Kick down to a 404
    }
    //If a projectID is provided, and it IS in the database
    else if(projectID && (projectID in projectMetaDataJSON))
    {
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
    }
    //If no projectID is provided
    else //Default values (new project)
    {
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
    }

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

app.get("/edit/:projectID", function (req, res, next) { serveEditor(req, res, next) })
app.get("/edit", function (req, res, next) { serveEditor(req, res, next) })

let serveHomepage = function (req, res, next)               //TODO use database SELECT
{
    db.pool.query("SELECT * FROM projects;", function(err, results, fields)
    {
        // console.log(results.rows)
    })

    res.status(200).render("homePage", {
        "projects" : projectMetaDataJSON,
        "toolVersion" : packageJSON.version,
        "tags" : tagPropertiesJSON
    })
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
let serveProjectPage = function (req, res, next)                //TODO use database SELECT
{
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

app.get("/projects/:projectID", serveProjectPage)



/**
 * 404 - final fallthrough reached
 */
app.get("*", function (req, res, next)
{
    res.status(404).render("pageNotFound", {
        "toolVersion" : packageJSON.version
    })
})

app.listen(port, undefined,function ()
{
    console.log("SERVER: I'm listening http://localhost:"+port)
})
