
function filterPosts(){

    var posts = document.getElementsByClassName("post")
    console.log(posts.length)

    var filtertag = document.getElementById("ftag").value
    var filterName = document.getElementById("fname").value
    var filterAuthor = document.getElementById("fauthor").value


    if (checkEmpty(filtertag,filterAuthor,filterName) == false) {logfilterValues(filtertag,filterAuthor,filterName)}


    
}

function checkEmpty (tag, name, author){
    if (tag =='' && name =='' && author==''){console.log ("All Empty"); return true}
    else return false;

}

function logfilterValues(tag, name, author){
console.log("filtertag ==", tag)
console.log ("filterName ==", name)
console.log ("filterAuthor ==", author)
}

//Open Input Menu
var filterButton = document.getElementById("filterbutton")
filterButton.addEventListener("click", filterPosts)