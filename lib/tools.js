let DEBUG = true
let consoleDebug = function (msg)
{
    if(DEBUG)
    {
        console.log(msg)
    }
}

// Export it for use in our application
module.exports.DEBUG = DEBUG;
module.exports.consoleDebug = consoleDebug;