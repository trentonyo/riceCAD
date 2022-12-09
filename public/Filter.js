function filterPosts(posts){

    var posts = document.getElementsByClassName("post")

    var filtertags = document.querySelectorAll(".project_label input:checked")

    var filterName = document.getElementById("fname").value
    var filterMin = document.getElementById("fdownloads_min").value
    var filterMax = document.getElementById("fdownloads_max").value




    if (checkEmpty(filtertags, filterMin,filterMax,filterName) == false) {

        //listAllPostProperties(posts);

        deletingPosts(posts);


        for (let i = 0; i<Allposts.length; i++){
        var numTags = (filtertags.length-1)

        Addpost( Allposts[i].tags, Allposts[i].downloads, Allposts[i].title, "https://placekitten.com/200/300")

        }

    }

}

function Addpost(filtertags, filterDownloads, filterName, posturl){

//Create Post / attributes
var NewPost = document.createElement("div")
NewPost.classList.add("post")
NewPost.setAttribute("data-title", filterName)
NewPost.setAttribute("data-downloads", filterDownloads)
NewPost.setAttribute("data-tags", filtertags)

//Create content
var contents = document.createElement("div")
contents.classList.add("post-contents")
NewPost.appendChild(contents)

//Create title container
var titleContainer = document.createElement("div")
titleContainer.classList.add("post-title-position")
contents.appendChild(titleContainer)

//New title
var newTitle = document.createElement("a")
newTitle.href = "#"
newTitle.classList.add("post-title")
newTitle.textContent = filterName
titleContainer.appendChild(newTitle)

//Create image
var imgContainer = document.createElement("div")
imgContainer.classList.add("post-image-container")
contents.appendChild(imgContainer)

var newimage = document.createElement("img")
newimage.src = posturl
imgContainer.appendChild(newimage)

//tag container
var tagsContainer = document.createElement("div")
tagsContainer.classList.add("post-tags-container")
contents.appendChild(tagsContainer)

 var tagLabels = document.createElement("span")
tagsContainer.appendChild(tagLabels)

 var tagValues = document.createElement("span")
 tagValues.classList.add("project_label")
 tagValues.style = "background-color: red; color: white"
 tagValues.textContent = filtertags

 tagLabels.appendChild(tagValues)

//info container
var infoContainer = document.createElement("div")
infoContainer.classList.add("post-info-container")
contents.appendChild(infoContainer)

var newdownloads = document.createElement("span")
newdownloads.classList.add("build-num")
infoContainer.appendChild(newdownloads)

//Push everything to posts
var PostContainer = document.getElementById("posts")
PostContainer.appendChild(NewPost)

}

function StoreStartingItems(posts){

    var posts = document.getElementsByClassName("post")
    var images = document.getElementsByTagName("img")

    for (let i = posts.length; i>0; i--){
    
    var postData= {
        url:'',
        title:"",
        downloads:"",
        tags:"",
    }

    //FIX HERE!!!!!!!!!!!!!!!
    var tempImage = "placekitten.com/200/300"
    postData.url = tempImage
    postData.title = posts[i-1].dataset.title
    postData.downloads = posts[i-1].dataset.downloads
    postData.tags = posts[i-1].dataset.tags
    console.log(i-1)
    Allposts[i-1] = postData

    console.log(Allposts[i-1].tags)

    }

    for (let i = Allposts.length-1; i>0; i--){
        console.log(Allposts[i])
    }

}

function listAllPostProperties(posts){
    for (let i = posts.length; i>0; i--){
        console.log("post", i, "title ==", posts[i-1].dataset.title)
        console.log("post", i, "downloads ==", posts[i-1].dataset.downloads)
        console.log("post", i, "tags ==", posts[i-1].dataset.tags.split(','))
    }
}

function checkEmpty (tags, min, max, name){

    if (tags.length == 0 && name =='' && min=='' && max==''){console.log ("All Empty"); return true}
    else return false;

}

function logfilterValues(tags, min, max, name){

    var filtertag = ''
    for (let i = 0; i<tags.length; i++){
        filtertag = tags[i].value + ',' + filtertag
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


//On start 
var Allposts = []
StoreStartingItems(posts)

var filterButton = document.getElementById("filterbutton")
filterButton.addEventListener("click", filterPosts)

//string.split USE
