/*
Author: Trenton Young
Date: 4 January 2024
 */

/********************************************
*   ##DEPENDENCIES##
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

let projectID_cache = []

/********************************************
 *   ##SERVER SETTINGS##
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
 *   ##EXPRESS MIDDLEWARE##
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
 *   ##DATA HELPERS##
 ********************************************/

let generateNewProjectID = function(title) {
    let salt = 0
    let newID = tools.hashTitle(title, salt)

    while (projectID_cache.includes(newID))
    {
        newID = tools.hashTitle(title, ++salt)
    }

    projectID_cache.push(newID)
    return newID
}

/********************************************
 *   ##ROUTING HELPERS##
 ********************************************/

let incrementDownloads = function(projectID) {
    db_pool.query(`SELECT downloads FROM public.projects WHERE project_id='${projectID}';`, function (err, results, fields) {
        let incremented_downloads = results.rows[0].downloads
        incremented_downloads++

        db_pool.query(`UPDATE public.projects SET downloads = ${incremented_downloads} WHERE project_id='${projectID}';`, function (err, results, fields) {
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

    db_pool.query(`SELECT builds FROM public.projects WHERE project_id='${projectID}';`, function (err, results, fields) {
        let newBuilds = 0
        let firstResult = results.rows[0]

        if (firstResult.prototype.hasOwnProperty("builds")) {
            //Increment builds
            newBuilds = firstResult.rows[0].builds
        }

        db_pool.query(`UPDATE public.projects SET builds = ${newBuilds} WHERE project_id='${projectID}';`, function (err, results, fields) {
            if (err) {
                console.log(err)
            }
        })
    })
}

/**
 * Render tool page with handlebars
 */
let serveSingleProject = async function(req, res, next) {
    let projectID = req.params.projectID

    let allTagsNeeded = `SELECT 1 WHERE false;`
    if (req._ricecad_singleproject_serveAllTags)
    {
        allTagsNeeded = `SELECT * FROM public.tags`
    }

    db_pool.query(`SELECT * FROM public.projects WHERE project_id='${projectID}';`, function (err, results, fields) {
        db_pool.query(`SELECT * FROM public.tags INNER JOIN public.projects_tags pt ON tags.tags_id = pt.tag_id WHERE pt.project_id = '${projectID}';`, function (tag_err, tag_results, tag_fields) {
            db_pool.query(allTagsNeeded, function (all_tags_err, all_tags_results, all_tags_fields) {
                let output = tools.DEFAULT_PROJECT_DETAILS
                output.projectID = projectID
                output.toolVersion = packageJSON.version

                if (results.rows.length > 0) {

                    let tags = {}

                    if (tag_results.rows.length > 0) {
                        for (const tag in tag_results.rows) {
                            tags[tag_results.rows[tag]["name"]] = {
                                "background-color": tag_results.rows[tag]["background-color"],
                                "text-color": tag_results.rows[tag]["text-color"],
                                "checked": true
                            }
                        }
                    }

                    for (const tag in all_tags_results.rows) {
                        let curr_tagName = all_tags_results.rows[tag]["name"]

                        if (!tags.hasOwnProperty(curr_tagName)) {
                            tags[curr_tagName] = {
                                "background-color": all_tags_results.rows[tag]["background-color"],
                                "text-color": all_tags_results.rows[tag]["text-color"]
                            }
                        }
                    }

                    let palette_materials = {}
                    let palette_viewport = {
                        background: {
                            color: results.rows[0].viewport_background_hex,
                            glass: false,
                            viewport: true
                        },
                        workingplane: {
                            color: results.rows[0].viewport_workingplane_hex,
                            glass: false,
                            viewport: true
                        }
                    }

                    for (let i = 1; i <= 9; i++) {
                        palette_materials[i] = {
                            color: results.rows[0][`palette_${i}_hex`],
                            glass: results.rows[0][`palette_${i}_glass`]
                        }
                    }

                    output = {
                        "projectID": projectID,
                        "title": results.rows[0].title,
                        "description": results.rows[0].description,
                        "downloads": results.rows[0].downloads,
                        "palette_materials": palette_materials,
                        "palette_viewport": palette_viewport,
                        "tags": tags,
                        "toolVersion": packageJSON.version
                    }

                    if (results.rows[0].parent_id)
                    {
                        output["parentProjectID"] = results.rows[0].parent_id
                    }
                }

                res.status(200).render(req._ricecad_singleproject_target, output)
            })
        })
    })
}

let serveHomepage = function (req, res, next) {
    db_pool.query("SELECT * FROM projects;", function(err, results, fields) {
        db_pool.query("SELECT * FROM public.tags;", function(tags_err, tags_results, tags_fields) {
            db_pool.query("SELECT * FROM public.projects_tags;", function(relation_err, relation_results, relation_fields) {

                let relations = relation_results.rows

                let tags = {}

                if (tags_results.rows.length > 0) {
                    for (const tag in tags_results.rows) {
                        // Tags for use in the filter
                        tags[tags_results.rows[tag]["name"]] = {
                            "background-color": tags_results.rows[tag]["background-color"],
                            "text-color": tags_results.rows[tag]["text-color"]
                        }
                    }
                }

                let projects = {}

                for (const row in results.rows) {
                    let curr_project_id = results.rows[row].project_id
                    projects[curr_project_id] = results.rows[row]

                    // Update cache of project IDs
                    if (!(curr_project_id in projectID_cache)) projectID_cache.push(curr_project_id)

                    let project_tags = relations.filter((rel) => rel.project_id === curr_project_id)

                    if (project_tags.length > 0) {
                        projects[curr_project_id]["tags"] = {}
                        for (const tag in project_tags) {
                            let tag_reference = tags_results.rows.filter((t) => t.tags_id == project_tags[tag].tag_id)[0]
                            projects[curr_project_id]["tags"][tag_reference.name] = {
                                "background-color": tag_reference["background-color"],
                                "text-color": tag_reference["text-color"]
                            }
                        }
                    }
                }

                res.status(200).render("homePage", {
                    "projects" : projects,
                    "toolVersion" : packageJSON.version,
                    "tags" : tags
                })
            })
        })
    })
}

/********************************************
 *   ##REQUEST ROUTING##
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

app.get("/edit/:projectID", function (req, res, next) {
    req._ricecad_singleproject_target = "riceCADEditor"
    req._ricecad_singleproject_serveAllTags = true
    serveSingleProject(req, res, next)
})

app.get("/edit", function (req, res, next) {
    req.params.projectID = "DEFAULT"
    req._ricecad_singleproject_target = "riceCADEditor"
    req._ricecad_singleproject_serveAllTags = true

    serveSingleProject(req, res, next)
})

/**
 * Handle a POST for new project metadata
 */
app.post("/projects/addProjectMetaData", function (req, res, next) {

    if(req.body && req.body["title"] && req.body["description"])
    {
        let projectID = generateNewProjectID(req.body["title"])

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

        db_pool.query(insertProjectQuery, function(err, results, fields)
        {
            for (let i = 0; i < req.body.tags.length; i++)
            {
                let currentTag = req.body.tags[i]
                let query = `INSERT INTO public.projects_tags (project_id, tag_id)
                     SELECT '${projectID}', tags_id
                     FROM public.tags
                     WHERE name='${currentTag}';`

                if (i === req.body.tags.length - 1) {
                    db_pool.query(query, function (err, results, fields) {
                        res.status(200).send(projectID)
                    })
                }
                else
                {
                    db_pool.query(query, function (err, results, fields) {})
                }
            }
        })
    }
    else
    {
        next()
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
                req._ricecad_singleproject_target = "projectPage"
                serveSingleProject(req, res, next)
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


/**
 * Serve homepages from several URLs
 */
app.get("/", serveHomepage)
app.get("/home", serveHomepage)
app.get("/projects", serveHomepage)

app.get("/projects/:projectID", function (req, res, next) {
    req._ricecad_singleproject_target = "projectPage"
    serveSingleProject(req, res, next)
})

/**
 * 404 - final fallthrough reached
 */
app.get("*", function (req, res, next)  {
    res.status(404).render("pageNotFound", {
        "toolVersion" : packageJSON.version
    })
})

/********************************************
 *   ##SERVER INITIALIZATION##
 ********************************************/

app.listen(port, undefined,function () {
    console.log("SERVER: I'm listening http://localhost:"+port)
})
