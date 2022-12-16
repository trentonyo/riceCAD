let clipboardButton = document.getElementById("clipboard_button")
let clipboardValue = document.getElementById("clipboard_value")

let projectIDCopied = function (result)
{
    clipboardButton.innerText = "ID Copied!"
    clipboardButton.classList.remove("hovered")
    clipboardButton.classList.add("success")
}
let copyFailed = function (err)
{
    clipboardButton.innerText = "Oops! Try again"
    clipboardButton.classList.remove("hovered")
    clipboardButton.classList.add("failure")
}
let resetButton = function (button)
{
    button.innerText = button.value
    button.classList.remove("hovered")
    button.classList.remove("success")
    button.classList.remove("failure")
}
let highlightButton = function (button)
{
    clipboardButton.classList.add("hovered")
}

resetButton(clipboardButton)

clipboardButton.addEventListener("click", function (event) {
    let copiedID = clipboardValue.innerText
    if(window.isSecureContext)
    {
        navigator.clipboard.writeText(copiedID).then(projectIDCopied, copyFailed)
    }
    else
    {
        copyFailed()
        if(confirm("Can't copy to your clipboard unless you access the site with HTTPS, would you like try redirecting? (You can also just select and copy the ID manually)"))
        {
            let url = window.location.href
            url = url.slice(4)
            url = "https" + url

            location.assign(url)
        }
    }
})
clipboardButton.addEventListener("mouseleave", function (event) {
    resetButton(clipboardButton)
})

clipboardButton.addEventListener("mouseenter", function (event) {
    highlightButton(clipboardButton)
})
