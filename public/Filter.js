
function filterPosts(){

    var posts = document.getElementsByClassName("post")
    console.log(posts.length)

    var filtertag1 = document.getElementById("filter_tag_prototype").checked
    var filtertag2 = document.getElementById("filter_tag_nordic").checked
    var filtertag3 = document.getElementById("filter_tag_futuristic").checked
    
    var filterName = document.getElementById("fname").value
    var filterMin = document.getElementById("fdownloads_min").value
    var filterMax = document.getElementById("fdownloads_max").value


    if (checkEmpty(filtertag1, filtertag2, filtertag3, filterMin,filterMax,filterName) == false) {logfilterValues(filtertag1, filtertag2, filtertag3,filterMin,filterMax,filterName)}
    
}

function checkEmpty (tag1, tag2, tag3, min, max, name, author){
    if (tag1 ==false && tag2 ==false && tag3 ==false && name =='' && min=='' && max==''){console.log ("All Empty"); return true}
    else return false;

}

function logfilterValues(tag1, tag2, tag3, min, max, name){
console.log("filtertag ==", tag1)
console.log("filtertag ==", tag2)
console.log("filtertag ==", tag3)

console.log ("filterName ==", name)
console.log ("filterMin ==", min)
console.log ("filterMax ==", max)
}

//Open Input Menu
var filterButton = document.getElementById("filterbutton")
filterButton.addEventListener("click", filterPosts)