const DEFAULT_PORT = 8080
const DEFAULT_PROJECT_ID = "DEFAULT"

let DEBUG = false
let consoleDebug = function (msg)
{
    if(DEBUG)
    {
        console.log(msg)
    }
}

/* https://stackoverflow.com/a/7760578 - Thanks to ffxsam and Paul d'Aoust */
function sanitize (str) {
    str = String(str)
    let sanitized = ""

    for (let i = 0; i < str.length; i++)
    {
        let char = str.substring(i, i+1)
        switch (char)
        {
            case '"':
            case "\\":
            case ";":
                sanitized +=  "\\"+char
                break
            case "'":
                sanitized += "''"
                break
            default:
                sanitized += char
        }
    }

    return sanitized
}

let hashTitle = function (title, salt)
{
    let newID = ""
    /**
     * Returns a color from a string's hash
     * based on esmiralha's StackOverflow response (https://stackoverflow.com/a/7616484)
     */
    let hash = 0
    let chr

    for(let i = 1; i <= 3; i++) // Hash the title with the current salt
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

    return newID
}


// Export it for use in our application
module.exports.consoleDebug = consoleDebug;
module.exports.sanitize = sanitize;
module.exports.hashTitle = hashTitle;

module.exports.DEFAULT_PORT = DEFAULT_PORT;
module.exports.DEFAULT_PROJECT_ID = DEFAULT_PROJECT_ID;
