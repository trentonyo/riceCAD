
function filterPosts(){

    var posts = document.getElementsByClassName("post")
    console.log(posts.length)

    var filtertag = document.getElementById("ftag").value
    var filterName = document.getElementById("fname").value
    var filterMin = document.getElementById("fdownloads_min").value
    var filterMax = document.getElementById("fdownloads_max").value


    if (checkEmpty(filtertag,filterMin,filterMax,filterName) == false) {logfilterValues(filtertag,filterMin,filterMax,filterName)}


    
}

function checkEmpty (tag, min, max, name, author){
    if (tag =='' && name =='' && min=='' && max==''){console.log ("All Empty"); return true}
    else return false;

}

function logfilterValues(tag, min, max, name){
console.log("filtertag ==", tag)
console.log ("filterName ==", name)
console.log ("filterMin ==", min)
console.log ("filterMax ==", max)
}

//Open Input Menu
var filterButton = document.getElementById("filterbutton")
filterButton.addEventListener("click", filterPosts)