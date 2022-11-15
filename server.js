/*
 * Write your server code in this file.
 *
 * name: Trenton Young
 * email: youngtre@gmail.com
 */

const http = require("http")
const filesystem = require("fs")

const CONTENT_TYPES = {
    html: "text/html",
    css: "text/css",
    js: "application/javascript",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    undefined: ""
}

let pageCache = {}

let getPage = function(url, encode)
{
    if(!pageCache[url])
    {
        console.log("  ==SERVER: Reading file", url, "from disk...")
        pageCache[url] = filesystem.readFileSync(url, encode)
    }

    return pageCache[url]
}

let pageNotFoundResponse = function (request, response)
{
    response.writeHead(404, {
        "Content-Type": "text/html"
    })

    response.write(getPage("./public/404.html", "utf8"))

    response.end()
}

let someRequestResponse = function (request, response)
{
    let filepath = request.url

    let filepathChunks = filepath.split("/")

    if(filepathChunks.length > 1)
    {
        //The URL '/' should serve the public index
        filepath = request.url === "/" ? "public/index.html" : filepath

        //URL contains a directory

    }
    else
    {
        //URL is top-level, need to prepend 'public' directory
        filepath = "public" + filepath
    }


    let filetypeChunks = filepath.split(".").reverse()

    try
    {
        response.writeHead(200, {
            "Content-Type": CONTENT_TYPES[filetypeChunks[0]]
        })

        let encoding = "utf8"
        encoding = filetypeChunks[0] === "jpg" ? undefined : encoding
        encoding = filetypeChunks[0] === "jpeg" ? undefined : encoding

        response.write(getPage(filepath, encoding))

        response.end()
    }
    catch (err)
    {
        console.log("  ==RESPONSE ERROR:", err)
        pageNotFoundResponse(request, response)
    }
}

let handleRequest = function (request, response)
{
    console.log("SERVER: Received a request!")
    console.log("--URL:", request.url)

    someRequestResponse(request, response)
}

let server = http.createServer(handleRequest)

const DEFAULT_PORT = 3000
let port = process.env.PORT ? process.env.PORT : DEFAULT_PORT

//Port number (3000): Different applications receive information from network traffic. When traffic comes into the machine, the
//  machine needs to know which application to handle requests for. The network interface is divided into ports, which
//  are claimed by processes. Only one process can use any given port.
//Callback function: called when the server actually starts listening
server.listen(port, function ()
{
    console.log("SERVER: I'm listening (on port "+port+")")
})



// let pageResponses = {
//     "404": pageNotFoundResponse,
//     "/" : homePageResponse,
//     "/index" : homePageResponse
// }

//
// let homePageResponse = function (request, response)
// {
//     // return "Home Page Response return statement"
//     let responseBody = `
//         <html lang="en">
//             <body>
//                 <h1>Hello, world!</h1>
//                 <h2>`+request.url+`</h2>
//             </body>
//         </html>`
//
//     //200 is the status code
//     //Object is the header stuff
//     response.writeHead(200, {
//         "Content-Type": "text/html" //The MIME type for html, css is "text/css" js is "application/javascript" jpg is "image/jpeg"
//     })
//
//     response.write(responseBody) //Append to the response
//     response.end() //Called when we're done building the response, will send the response back to the client. No further changes
// }
