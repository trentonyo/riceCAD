let labelElementsStyle = document.querySelectorAll(".project_label input") 

let updateLabelStyle = function (event, initialLoad = false)
{
    let target = this

    if(initialLoad) { target = event }

    if(target.checked)
    {
        target.parentElement.classList.add("selected")
        target.parentElement.style.backgroundColor = target.parentElement.dataset.backgroundColor
        target.parentElement.style.color = target.parentElement.dataset.textColor
    }
    else
    {
        target.parentElement.classList.remove("selected")
        target.parentElement.style.backgroundColor = "#fff"
        target.parentElement.style.color = "#000"
    }
}

for (let i = 0; i < labelElementsStyle.length; i++) {
    labelElementsStyle[i].addEventListener("click", updateLabelStyle)
    updateLabelStyle(labelElementsStyle[i], true)
}