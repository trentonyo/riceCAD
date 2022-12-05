const fileSelector = document.getElementById('file-selector')
const content = document.getElementById('text_editor_textarea')

// import axios from 'axios'

let DEFAULT_PROJECTID = "DEFAULT"

fileSelector.addEventListener('change', (event) =>
{
    const fileList = event.target.files

    const [file] = fileList
    const reader = new FileReader()

    reader.addEventListener("load", () =>
    {
        content.value = reader.result.replace(/\r/g, "\n")
        loadFromTextArea()
        unsavedChanges = false

    }, false)

    if (file) {
        reader.readAsText(file)
        projectNameField.innerHTML = file.name.split(".")[0]
        unsavedChanges = false
    }

})

function downloadChanges()
{
    let planName = projectNameField.innerHTML + ".plan"
    let file = new File([content.value], planName, {type: "text/plain;charset=utf-8"})
    saveAs(file) //TODO Can be done without a dependency

    unsavedChanges = false
}

let projectNameField = document.getElementById("projectTitle") //TODO need to make this an object instead of "storing the data" in the DOM item

function renameProject()
{
    projectNameField.innerText = prompt("Rename project", "newName") //TODO make a fun name generator
    unsavedChanges = true
}

let unsavedChanges = false
let canvas = document.getElementById("application-canvas")
let app = new pc.Application(canvas)
app.start()
// document.getElementById("versionNumber").innerText = "v0.3.0"

app.setCanvasFillMode(pc.FILLMODE_NONE)
app.setCanvasResolution(pc.RESOLUTION_AUTO)

let camera = new pc.Entity()
camera.addComponent("camera", {
    clearColor: new pc.Color(0.0, 1.0, 1.0, 1.0)
})

app.root.addChild(camera)

let CameraAngle = function(rotation_x, rotation_y, rotation_z, position_x, position_y, position_z)
{
    this.rotation_x = rotation_x
    this.rotation_y = rotation_y
    this.rotation_z = rotation_z
    this.position_x = position_x
    this.position_y = position_y
    this.position_z = position_z
}
let camerasEuler = [
    new CameraAngle(-22.0,  45.0,   0.0,  16.0,   9.0,  16.0),
    new CameraAngle(160.0, -90.0, 180.0, -24.0,  15.0,  10.0),
    new CameraAngle(160.0, -50.0, 180.0, -16.0,  16.0, -16.0),
    new CameraAngle(160.0,   0.0, 180.0,  10.0,  17.0, -26.0),
    new CameraAngle(160.0,  90.0, 180.0,  32.0,  10.0,   7.0),
    new CameraAngle(-90.0,   0.0,   0.0,  12.0,  30.0,   8.0)
]

//Used for mouse drag camera manipulation
let cameraLocalEulerX = camera.getLocalEulerAngles().x
let cameraLocalEulerY = camera.getLocalEulerAngles().y
let cameraLocalEulerZ = camera.getLocalEulerAngles().z

function setCamera(cam)
{
    camera.setLocalEulerAngles(
        camerasEuler[cam].rotation_x,
        camerasEuler[cam].rotation_y,
        camerasEuler[cam].rotation_z
    )
    camera.setEulerAngles(
        camerasEuler[cam].rotation_x,
        camerasEuler[cam].rotation_y,
        camerasEuler[cam].rotation_z
    )

    camera.setPosition(
        camerasEuler[cam].position_x,
        camerasEuler[cam].position_y,
        camerasEuler[cam].position_z
    )

    cameraLocalEulerY = camera.getLocalEulerAngles().y
    cameraLocalEulerX = camera.getLocalEulerAngles().x
    cameraLocalEulerZ = camera.getLocalEulerAngles().z
}

function setBackgroundColor(color)
{
    camera.camera.clearColor = color
}

setCamera(0)

app.scene.ambientLight = new pc.Color(0.5, 0.5, 0.5, 1.0)
let light = new pc.Entity()
light.addComponent('light')
app.root.addChild(light)
light.rotate(45, 0, 0)

let workingPlane = new pc.Entity()
workingPlane.addComponent("model", { type: "plane" })
workingPlane.rotate(0, 0, 0)
workingPlane.setPosition(5, 0, 5)
workingPlane.setLocalScale(10, 0, 10)
app.root.addChild(workingPlane)

function updateWorkingPlane(width, depth)
{
    let margin = 1
    workingPlane.setPosition((width + margin) / 2, 0, (depth + margin) / 2)
    workingPlane.setLocalScale((width + margin), 0, (depth + margin))
}

function setWorkingPlaneMaterial(planeMaterial)
{
    workingPlane.model.model.meshInstances[0].material = planeMaterial
}

const viewportSettingsForm = document.getElementById('viewport_settings_form')

const viewportBackground = document.getElementById('material-background')
const workingPlaneColor = document.getElementById('material-workingplane')

let viewport_palette = {
    "background" : {},
    "workingplane" : {}
}

let updateViewportSettings = function (enableDOMAccess) {
    const viewportLock = document.getElementById('viewportLock')
    const viewportRotateSpeed = document.getElementById('viewportRotateSpeed')
    const viewportMoveSpeed = document.getElementById('viewportMoveSpeed')
    const viewportZoomSpeed = document.getElementById('viewportZoomSpeed')

    if(enableDOMAccess)
    {
        viewportLocked = viewportLock.checked
        rotateSpeed = viewportRotateSpeed.value
        moveSpeed = viewportMoveSpeed.value
        zoomModifier = viewportZoomSpeed.value
    }

    let background = new Material("Custom", viewportBackground.value, false)
    viewport_palette["background"] = background
    setBackgroundColor(background.getPCColor())

    let plane = new Material("Custom", workingPlaneColor.value, false)
    viewport_palette["workingplane"] = plane
    setWorkingPlaneMaterial(plane.getPhongMaterial())
}
updateViewportSettings(false)

viewportSettingsForm.addEventListener('change', updateViewportSettings)

/**
 * Material Palette:
 * - Each index corresponds to a digit [1, 9] and will be applied to blocks of that digit
 */
let material_palette = [
    undefined, //Because zero indexing
    minecraftBlack,
    minecraftRed,
    minecraftGreen,
    minecraftWhite,
    minecraftOrange,
    minecraftMagenta,
    minecraftLightBlue,
    minecraftYellow,
    minecraftPink
]
/**
 * Update Material Palette:
 * - Creates a new Material from the (assumed) hex code entered into one of the .material-input boxes
 */
let updateMaterialPalette = function (event, update = true)
{
    let slot

    if (typeof event === "number")
    {
        slot = event
    }
    else
    {
        slot = event.currentTarget.id.slice(9, 10)
    }

    let associatedColor = document.getElementById("material-"+slot).value
    let associatedGlass = document.getElementById("material-"+slot+"-glass").checked

    material_palette[slot] = new Material("Custom", associatedColor, associatedGlass)

    let associatedCard = document.getElementsByClassName("card"+slot)[0]
    // associatedCard.style.backgroundColor = associatedColor

    let associatedGlassIndicator = associatedCard.getElementsByClassName("material-settings-enableGlass")[0]

    if(associatedGlass)
    {
        associatedGlassIndicator.classList.remove("disabled")
        associatedGlassIndicator.classList.add("enabled")
        associatedGlassIndicator.innerText = "Glass Enabled"
    }
    else
    {
        associatedGlassIndicator.classList.add("disabled")
        associatedGlassIndicator.classList.remove("enabled")
        associatedGlassIndicator.innerText = "Enable Glass"
    }

    if(update)
    {
        loadFromTextArea()
    }
}
for (let i = 1; i < 10; i++)
{
    document.getElementById("material-"+i).addEventListener("change", updateMaterialPalette)
    document.getElementById("material-"+i+"-glass").addEventListener("input", updateMaterialPalette)

    updateMaterialPalette(i, false)
}

//Load project plan
let projectIDHiddenElement = document.getElementById("projectID")
let projectID = projectIDHiddenElement.value

let updateProjectID = function (newID) {
    projectID = newID
    projectIDHiddenElement.value = projectID
}

const httpRequest_projectPlan = new XMLHttpRequest()
const url_projectPlan = `../project/${projectID}.plan`

httpRequest_projectPlan.open("GET", url_projectPlan)
httpRequest_projectPlan.send()

httpRequest_projectPlan.onreadystatechange = function ()
{
    if(httpRequest_projectPlan.readyState === 4 && httpRequest_projectPlan.status === 200)
    {
        console.log("Project loaded, from server")
        try
        {
            content.value = httpRequest_projectPlan.responseText
            loadFromTextArea()
        }
        catch (err)
        {
            console.log(`--Error ${err} while parsing project plan, HTTP response below`)
            console.log(httpRequest_projectPlan.responseText)
            console.log(httpRequest_projectPlan)
            console.log("--End HTTP response")
        }
    }
}

let getCurrentMetaData = function ()
{
    let currentMetaData = {
        "title" : "",
        "description" : "",
        "downloads" : 0,
        "tags" : [],
        "palette" : []
    }

    //DOM access
    currentMetaData["title"] = document.getElementById("projectTitle").innerText
    currentMetaData["description"] = document.getElementById("projectDescription").value
    currentMetaData["downloads"] = document.getElementById("projectDownloads").value

    let projectIDElement = document.getElementById("projectID")
    if (projectIDElement.value !== DEFAULT_PROJECTID) { currentMetaData["existingProjectID"] = projectIDElement.value }

    let checkedLabels = document.querySelectorAll("#projectLabelsContainer>input:checked")

    currentMetaData["tags"] = []
    for (let i = 0; i < checkedLabels.length; i++)
    {
        currentMetaData["tags"].push(checkedLabels[i].value)
    }

    currentMetaData["palette"] = {
        "1" : {},
        "2" : {},
        "3" : {},
        "4" : {},
        "5" : {},
        "6" : {},
        "7" : {},
        "8" : {},
        "9" : {},
        "background" : {
            "color" : viewport_palette["background"].getHexColor(),
            "glass" : viewport_palette["background"].isGlass,
            "viewport": true
        },
        "workingplane" : {
            "color" : viewport_palette["workingplane"].getHexColor(),
            "glass" : viewport_palette["workingplane"].isGlass,
            "viewport": true
        }
    }
    for (let i = 1; i <= 9 ; i++)
    {
        currentMetaData["palette"][i] = {
            "color" : material_palette[i].getHexColor(),
            "glass" : material_palette[i].isGlass
        }
    }

    return currentMetaData
}

let getCurrentPlan = function ()
{
    return content.value
}

let getCanvasScreenshot = function ()
{
    let dataURL = canvas.toDataURL('image/png')
    let image = new Image()
    image.src = dataURL

    return image
}

// Posting new project metadata
const url_postMetaData = "/projects/addProjectMetaData"
const url_postProjectPlan = "/projects/addProjectPlan"
const url_postProjectThumbnail = "/projects/addProjectThumbnail"

let postThumbnail = function () {
    let content = {
        "thumbnail" : getCanvasScreenshot(), //TODO function to let user choose the screengrab beforehand, save as object
        "projectID" : projectID
    }
    axios.post(url_postProjectThumbnail, content, {
        headers: {
            'Content-Type': content["thumbnail"].type
        }
    })
}

let postProject = function () {
    let content = {
        "plan" : getCurrentPlan(),
        "projectID" : projectID
    }
    axios.post(url_postProjectPlan, content).then(function (response)
    {
        let status = response.status

        switch (status) {
            case 200:
                //Project metadata posted successfully
                // alert(`Successfully posted your project! Redirect to the project page? (${projectID})`) //TODO
                location.assign(`../projects/${projectID}`)
                break
            default:
                alert("Something went wrong while posting your project, please try again later and make sure you've downloaded your changes!") //TODO add an option to download in this dialogue
        }
    })
}

let postMetaData = function () {
    axios.post(url_postMetaData, getCurrentMetaData()).then(function (response)
    {
        let status = response.status

        switch (status) {
            case 200:
                //Project metadata posted successfully
                updateProjectID(response.data)
                // postThumbnail() TODO: Posting a thumbnail needs big fixing
                postProject()
                break
            default:
                alert("Something went wrong while posting your project, please try again later and make sure you've downloaded your changes!") //TODO add an option to download in this dialogue
        }
    })
}

document.getElementById("postProject").addEventListener("click", postMetaData)

//Returns a matrix of the given size, initialized to 0 TODO check in
function generateMatrix(width, height, depth)
{
    let output = []

    for (let i = 0; i < depth; i++)
    {
        output.push([])
        for (let j = 0; j < height; j++)
        {
            output[i].push([])
            for (let k = 0; k < width; k++)
            {
                output[i][j].push(0)
            }
        }
    }

    return output
}

//Copies all values from first into second
function transferMatrices(first, fWidth, fHeight, fDepth, second)
{
    for (let i = 0; i < fWidth; i++)
    {
        for (let j = 0; j < fHeight; j++)
        {
            for (let k = 0; k < fDepth; k++)
            {
                second[i][j][k] = first[i][j][k]
            }
        }
    }
}

/*

function resize(fwidth, fheight, fdepth)
{
    console.log("Matrix BEFORE reassignment:")
    console.log(matrix)

    matrixBuffer = generateMatrix(width, height, depth)
    transferMatrices(matrix, fwidth, fheight, fdepth, matrixBuffer)

    matrix = generateMatrix(width, height, depth)
    console.log("Matrix has been reassigned:")
    console.log(matrix)
    matrix = Array.from(matrixBuffer)

    updateWorkingPlane(width, depth)
}

function clearMatrix(matrix)
{
    for(let x = 0; x < depth; x++)
    {
        for(let y = 0; y < height; y++)
        {
            for(let z = 0; z < width; z++)
            {
                matrix[x][y][z] = 0
            }
        }
    }
}

*/

//Initialize matrix
let width = 64
let height = 100
let depth = 64

let matrix = generateMatrix(width, height, depth)
let matrixBuffer = generateMatrix(width, height, depth)

function loadFromTextArea()
{
    for(let x = 0; x < depth; x++)
    {
        for(let y = 0; y < height; y++)
        {
            for(let z = 0; z < width; z++)
            {

                if(typeof(matrix[z][y][x]) !== "number")
                {
                    if(matrix[z][y][x].b !== 0)
                    {
                        try
                        {
                            matrix[z][y][x].e.destroy()
                        }
                        catch (error)
                        {
                            console.error(error)
                        }
                    }
                }
            }
        }
    }

    let lx = 0 //Width
    let ly = 0 //Height
    let lz = 0 //Depth

    let layers
    layers = content.value.split("#")

    for(const layer of layers)
    {
        let rows = []
        rows = layer.split("\n")

        for(const row of rows)
        {
            if(row !== "") //Checking for excess whitespace
            {
                let blocks = []
                blocks = row.split("")

                for(const block of blocks)
                {
                    if(block !== "") //Checking for excess whitespace
                    {
                        addBlock(lx, ly, lz, parseInt(block))

                        lx++
                    }
                }
                lx = 0
                lz++
            }

        }
        lx = 0
        ly++
        lz = 0
    }
    unsavedChanges = true
}

let legalKeys = [
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
    "Enter", "#"
]

content.addEventListener("input", loadFromTextArea)
content.addEventListener("keypress", function (event)
{
    if(legalKeys.indexOf(event.key) === -1)
    {
        event.preventDefault()
        console.log("Prevented keystroke:", event.key)
    }
})

updateWorkingPlane(width, depth)

class Block
{
    constructor(x, y, z, b)
    {
        this.x = x
        this.y = y
        this.z = z
        this.b = b

        if(b > 0)
        {
            let e = new pc.Entity()
            e.addComponent("model", { type: "box", isStatic: true })
            e.addComponent("rigidbody"); // With no options specified, this defaults to a 'static' body
            e.addComponent("collision"); // With no options specified, this defaults to a 1x1x1 box shape

            e.model.model.meshInstances[0].material = material_palette[b].getPhongMaterial()
            // e.material = material_palette[b].getPhongMaterial()

            app.root.addChild(e)
            e.setPosition(x + 0.5, y + 0.5, z + 0.5)
            e.setLocalScale(0.993, 0.993, 0.993)

            this.e = e
        }
    }
}

function addBlock(x, y, z, b)
{
    let toAdd = new Block(x, y, z, b)

    let resize = false
    // let fwidth = width
    // let fheight = height
    // let fdepth = depth

    if(x > width)
    {
        resize = true
        //width = x
    }
    if(y > height)
    {
        resize = true
        //height = y
    }
    if(z > depth)
    {
        resize = true
        //depth = z
    }

    if (resize)
    {
        //resize(fwidth, fheight, fdepth)
        console.log("Resizing is still broken. Sorry.")
    }
    else
    {
        if(typeof(matrix[z][y][x]) !== "number")
        {
            if(matrix[z][y][x].b !== 0)
            {
                matrix[z][y][x].e.destroy()
            }
        }

        matrix[z][y][x] = toAdd
    }
}

loadFromTextArea()

for (let z = 0; z < matrix.length; z++)
{
    for (let y = 0; y < matrix[z].length; y++)
    {
        for (let x = 0; x < matrix[z][y].length; x++)
        {
            //Check if there is a block in the first place
            if (matrix[z][y][x] === 0)
            {
                //There is NOT A block here
            }
            else
            {
                //There is a block here
            }
        }
    }
}

let viewportLocked = true
let rotateSpeed = 0.1
let moveSpeed = 0.05
let zoomModifier = 5

let caret = new VanillaCaret(content)
caret.setPos(2)

//Prevent scrolling the page while scrolling over the canvas
canvas.addEventListener("wheel", function (event) {  event.preventDefault() })
canvas.addEventListener("scroll", function (event) {  event.preventDefault() })
canvas.addEventListener("DOMMouseScroll", function (event) {  event.preventDefault() })

canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock
document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock

canvas.addEventListener("mousedown", function (event)
{
    if(!viewportLocked)
    {
        canvas.requestPointerLock()
        event.preventDefault()
    }
})
canvas.addEventListener("mouseup", function (event)
{
    if(!viewportLocked)
    {
        document.exitPointerLock()
        event.preventDefault()
    }
})

//Viewport Controls

const mouse = new pc.Mouse(canvas)
const keyboard = new pc.Keyboard(document.body)

mouse.on("mousemove", function (event)
{
    if (event.buttons[pc.MOUSEBUTTON_LEFT] && !viewportLocked)
    {
        cameraLocalEulerX += rotateSpeed * event.dy  //dy is added to the opposite angle because matrices I guess
        cameraLocalEulerY += rotateSpeed * event.dx  //dx is added to the opposite angle because matrices I guess

        camera.setLocalEulerAngles(
            cameraLocalEulerX,
            cameraLocalEulerY,
            cameraLocalEulerZ
        )
    }
})

mouse.on("mousewheel", function (event)
{
    if(!viewportLocked)
    {
        camera.translateLocal(0, 0, moveSpeed * event.wheelDelta * zoomModifier)
    }
})

let handleNumberedCameras = function(digit)
{
    if(0 <= digit && digit < 10 && !viewportLocked)
    {
        //Assign a camera by holding shift and hitting a numrow key
        if (keyboard.isPressed(pc.KEY_SHIFT))
        {
            camerasEuler[digit] = new CameraAngle(
                camera.getEulerAngles().x,
                camera.getEulerAngles().y,
                camera.getEulerAngles().z,
                camera.getPosition().x,
                camera.getPosition().y,
                camera.getPosition().z
            )

            console.log("TAKE MY PICTURE!",digit,":",camerasEuler[digit])
        }
        else
        {
            //Pick a camera angle
            setCamera(digit)
        }
    }
}
keyboard.on("keydown", function (event)
{
    handleNumberedCameras(event.key - pc.KEY_0)
})

app.on("update", function ()
{
    if(unsavedChanges && !projectNameField.classList.contains("unsaved"))
    {
        projectNameField.classList.remove("saved")
        projectNameField.classList.add("unsaved")
    }

    if(!unsavedChanges && projectNameField.classList.contains("unsaved"))
    {
        projectNameField.classList.remove("unsaved")
        projectNameField.classList.add("saved")
    }

    if (keyboard.isPressed(pc.KEY_SHIFT))   //Shift held
    {
        //Move camera up/down global
        if (keyboard.isPressed(pc.KEY_W) && !viewportLocked) {
            camera.translate(0, 0.05, 0) //TODO no idea why this breaks when setting by slider
        }
        if (keyboard.isPressed(pc.KEY_S) && !viewportLocked) {
            camera.translate(0, -moveSpeed, 0)
        }
    }
    else                                    //Shift up
    {
        //Move camera up/down local
        if (keyboard.isPressed(pc.KEY_W) && !viewportLocked) {
            camera.translateLocal(0, 0, -moveSpeed)
        }
        if (keyboard.isPressed(pc.KEY_S) && !viewportLocked) {
            camera.translateLocal(0, 0, moveSpeed)
        }
    }
    if (keyboard.isPressed(pc.KEY_UP) && !viewportLocked) {
        camera.rotate(rotateSpeed, 0, 0)
    }
    if (keyboard.isPressed(pc.KEY_DOWN) && !viewportLocked) {
        camera.rotate(-rotateSpeed, 0, 0)
    }
    if (keyboard.isPressed(pc.KEY_LEFT) && !viewportLocked) {
        camera.rotate(0, rotateSpeed, 0)
    }
    if (keyboard.isPressed(pc.KEY_RIGHT) && !viewportLocked) {
        camera.rotate(0, -rotateSpeed, 0)
    }
    if (keyboard.isPressed(pc.KEY_A) && !viewportLocked) {
        camera.translateLocal(-moveSpeed, 0, 0)
    }
    if (keyboard.isPressed(pc.KEY_D) && !viewportLocked) {
        camera.translateLocal(moveSpeed, 0, 0)
    }
})
