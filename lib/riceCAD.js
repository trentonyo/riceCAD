const fileSelector = document.getElementById('file-selector')
const content = document.getElementById('text_editor_textarea')

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

function renameProject()
{
    projectNameField.innerText = prompt("Rename project", "newName") //TODO make a fun name generator
    unsavedChanges = true
}

let projectNameField = document.getElementById("projectTitle")
let unsavedChanges = false
let canvas = document.getElementById("application-canvas")
let app = new pc.Application(canvas)
app.start()
document.getElementById("versionNumber").innerText = "v0.3.0"

app.setCanvasFillMode(pc.FILLMODE_NONE)
app.setCanvasResolution(pc.RESOLUTION_AUTO)

let camera = new pc.Entity()
camera.addComponent("camera", {
    clearColor: new pc.Color(0.0, 1.0, 1.0, 1.0)
})

app.root.addChild(camera)

let camerasRX = [-0.26, 0.06,-0.12,-0.77,-0.26]
let camerasRY = [ 0.37, 0.92,-0.7 , 0.0 , 0.0 ]
let camerasRZ = [ 0.10, 0.17,-0.12, 0.0 , 0.0 ]
let camerasRW = [ 0.88,-0.35, 0.7 , 0.63, 0.97]

let camerasPX = [ 45.0,-13.0,-23.0, 9.0 , 0.0 ]
let camerasPY = [ 32.0, 14.0, 17.0,35.0 ,10.0 ]
let camerasPZ = [ 45.0,-13.0, 12.0,-2.0 ,10.0 ]

let eulerAnglesSet = false

function setCamera(cam)
{
    camera.setRotation( camerasRX[cam],
        camerasRY[cam],
        camerasRZ[cam],
        camerasRW[cam],
    )

    camera.setPosition( camerasPX[cam],
        camerasPY[cam],
        camerasPZ[cam])

    eulerAnglesSet = false
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

    const viewportBackground = document.getElementById('material-background')
    const workingPlaneColor = document.getElementById('material-plane')

    let background = new Material("Custom", viewportBackground.value, false)
    setBackgroundColor(background.getPCColor())

    let backgroundCard = document.getElementsByClassName("cardBackground")[0]
    backgroundCard.style.backgroundColor = background.getPCColor()

    let plane = new Material("Custom", workingPlaneColor.value, false)
    setWorkingPlaneMaterial(plane.getPhongMaterial())

    let planeCard = document.getElementsByClassName("cardPlane")[0]
    planeCard.style.backgroundColor = plane.getPCColor()

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
    associatedCard.style.backgroundColor = associatedColor

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

            e.model.model.meshInstances[0].material = material_palette[b].getPhongMaterial()

            app.root.addChild(e)
            e.setPosition(x + 0.5, y + 0.5, z + 0.5)
            e.setLocalScale(0.99, 0.99, 0.99)

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

//Prevent scrolling the page while scrolling over the canvas
canvas.addEventListener("wheel", function (event) {  event.preventDefault() })
canvas.addEventListener("scroll", function (event) {  event.preventDefault() })
canvas.addEventListener("DOMMouseScroll", function (event) {  event.preventDefault() })

//Viewport Controls
{
    // const mouse = new pc.Mouse(document.body)
    const mouse = new pc.Mouse(canvas)
    //mouse.disableContextMenu()

    // const keyboard = new pc.Keyboard(document.body)
    const keyboard = new pc.Keyboard(canvas)

    let x = 0
    let y = 0

    mouse.on("mousemove", function (event) {
        if (event.buttons[pc.MOUSEBUTTON_LEFT] && !viewportLocked)
        {
            x += event.dx
            y += event.dy

            camera.setLocalEulerAngles(rotateSpeed * y, rotateSpeed * x, 0)

            if(!eulerAnglesSet && false) //Shelved this, was going to just spin the camera until the right angle was found
            {
                let startRotation = camera.rotation
                let margin = 10
                let steps = 0

                while   (
                    Math.abs(camera.rotation.x - startRotation.x) <= margin &&
                        steps < 20
                    )
                {
                    x += 1
                    y += 1
                    steps++
                    camera.setLocalEulerAngles(rotateSpeed * y, rotateSpeed * x, 0)

                    console.log("x is " + x + " and y is " + y)
                    console.log("after set new rotation:")
                    console.log(camera.rotation.x)

                }

                eulerAnglesSet = true
            }
        }
    })
    mouse.on("mousewheel", function (event) {

        if(!viewportLocked)
        {
            camera.translateLocal(0, 0, moveSpeed * event.wheelDelta * zoomModifier)
        }

    })

    canvas.addEventListener("mousemove", function (event) {
        event.preventDefault()
    })

    let onKeyDown = function (event)
    {
        let digit = event.key - pc.KEY_0
        if(0 <= digit && digit < 10 && !viewportLocked)
        {
            if (keyboard.isPressed(pc.KEY_SHIFT))
            {
                //Set a camera angle
                console.log("Setting camera angle " + digit + " to:")

                let rX = camera.rotation.x
                let rY = camera.rotation.y
                let rZ = camera.rotation.z
                let rW = camera.rotation.w

                console.log([rX, rY, rZ, rW])

                let pX = camera.position.x
                let pY = camera.position.y
                let pZ = camera.position.z

                console.log([pX, pY, pZ])

                camerasRX[digit] = camera.rotation.x
                camerasRY[digit] = camera.rotation.y
                camerasRZ[digit] = camera.rotation.z
                camerasRW[digit] = camera.rotation.w

                camerasPX[digit] = camera.position.x
                camerasPY[digit] = camera.position.y
                camerasPZ[digit] = camera.position.z

            }
            else
            {
                //Pick a camera angle
                setCamera(digit)

                //TODO update x and y to some euler angles?
            }
        }
    }
    keyboard.on("keydown", onKeyDown)

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
}