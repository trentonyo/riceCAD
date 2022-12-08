function filterPosts(posts){

    var posts = document.getElementsByClassName("post")

    var filtertags = document.querySelectorAll(".project_label input:checked")

    var filterName = document.getElementById("fname").value
    var filterMin = document.getElementById("fdownloads_min").value
    var filterMax = document.getElementById("fdownloads_max").value


    if (checkEmpty(filtertags, filterMin,filterMax,filterName) == false) {logfilterValues(filtertags, filterMin,filterMax,filterName) }
    //deletingPosts(posts)
    listAllPostProperties(posts);

}
function listAllPostProperties(posts){
    for (let i = 0; i<posts.length; i++){
        console.log("post", i, "title ==", posts[i].dataset.title)
        console.log("post", i, "downloads ==", posts[i].dataset.downloads)
        console.log("post", i, "tags ==", posts[i].dataset.tags)
    }
}

function checkEmpty (tags, min, max, name){

    if (tags.length == 0 && name =='' && min=='' && max==''){console.log ("All Empty"); return true}
    else return false;

}

function logfilterValues(tags, min, max, name){

    var filtertag = ''
    for (let i = tags.length; i>0; i--){
        filtertag = tags[i-1].value + ',' + filtertag
    }

    console.log ("filtertag ==", filtertag)
    console.log ("filterName ==", name)
    console.log ("filterMin ==", min)
    console.log ("filterMax ==", max)

}

function deletingPosts(posts){

    for (let i = posts.length-1; i >= 0; i--) {
        posts[i].remove()
      }
}

//Open Input Menu
var filterButton = document.getElementById("filterbutton")
filterButton.addEventListener("click", filterPosts)

//string.split USE
