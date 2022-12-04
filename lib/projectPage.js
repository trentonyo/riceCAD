let clipboardButton = document.getElementById("clipboard_button")
let clipboardValue = document.getElementById("clipboard_value")

let projectIDCopied = function (result)
{
    clipboardButton.innerText = "ID Copied!"
    clipboardButton.classList.add("success")
}
let copyFailed = function (err)
{
    clipboardButton.innerText = "Oops! Try again"
    clipboardButton.classList.add("failure")
}
let resetButton = function (button)
{
    button.innerText = button.value
    button.classList.remove("success")
    button.classList.remove("failure")
}

resetButton(clipboardButton)

clipboardButton.addEventListener("click", function (event) {
    let copiedID = clipboardValue.innerText

    navigator.clipboard.writeText(copiedID).then(projectIDCopied, copyFailed)
})
clipboardButton.addEventListener("mouseleave", function (event) {
    resetButton(clipboardButton)
})