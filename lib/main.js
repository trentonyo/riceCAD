/**
 *
 * @type {HTMLElement}
 */

const fileSelector = document.getElementById('file-selector')
fileSelector.addEventListener('change', (event) =>
{
    const fileList = event.target.files;

    const content = document.getElementById('editor_text')
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
    const content = document.getElementById('editor_text')

    let planName = projectNameField.innerHTML + ".plan"
    let file = new File([content.value], planName, {type: "text/plain;charset=utf-8"})
    saveAs(file) //TODO install with node when ready

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
document.getElementById("versionNumber").innerHTML = "v0.1.0"

app.setCanvasFillMode(pc.FILLMODE_NONE)
app.setCanvasResolution(pc.RESOLUTION_AUTO)

let camera = new pc.Entity();
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

function setWorkingPlaneColor(planeMaterial)
{
    workingPlane.model.model.meshInstances[0].material = planeMaterial
}

const viewportSettingsForm = document.getElementById('viewportSettings')
viewportSettingsForm.addEventListener('change', function (event)
{
    const viewportLock              = document.getElementById('viewportLock')
    const viewportRotateSpeed       = document.getElementById('viewportRotateSpeed')
    const viewportMoveSpeed         = document.getElementById('viewportMoveSpeed')
    const viewportZoomSpeed         = document.getElementById('viewportZoomSpeed')

    viewportLocked = viewportLock.checked
    rotateSpeed    = viewportRotateSpeed.value
    moveSpeed      = viewportMoveSpeed.value
    zoomModifier   = viewportZoomSpeed.value

    const viewportBackdrop          = document.getElementById('viewportBackdrop')
    const workingPlaneColor         = document.getElementById('workingPlaneColor')

    switch (viewportBackdrop.value)
    {
        case "Black":
            setBackgroundColor(blackMaterial.diffuse)
            break
        case "Red":
            setBackgroundColor(redMaterial.diffuse)
            break
        case "Green":
            setBackgroundColor(greenMaterial.diffuse)
            break
        case "Brown":
            setBackgroundColor(brownMaterial.diffuse)
            break
        case "Blue":
            setBackgroundColor(blueMaterial.diffuse)
            break
        case "Purple":
            setBackgroundColor(purpleMaterial.diffuse)
            break
        case "Cyan":
            setBackgroundColor(cyanMaterial.diffuse)
            break
        case "Light Gray":
            setBackgroundColor(lightGrayMaterial.diffuse)
            break
        case "Gray":
            setBackgroundColor(grayMaterial.diffuse)
            break
        case "Pink":
            setBackgroundColor(pinkMaterial.diffuse)
            break
        case "Lime":
            setBackgroundColor(limeMaterial.diffuse)
            break
        case "Yellow":
            setBackgroundColor(yellowMaterial.diffuse)
            break
        case "Light Blue":
            setBackgroundColor(lightBlueCode.diffuse)
            break
        case "Magenta":
            setBackgroundColor(magentaMaterial.diffuse)
            break
        case "Orange":
            setBackgroundColor(orangeMaterial.diffuse)
            break
        case "White":
            setBackgroundColor(whiteMaterial.diffuse)
            break
    }

    switch (workingPlaneColor.value)
    {
        case "Black":
            setWorkingPlaneColor(blackMaterial)
            break
        case "Red":
            setWorkingPlaneColor(redMaterial)
            break
        case "Green":
            setWorkingPlaneColor(greenMaterial)
            break
        case "Brown":
            setWorkingPlaneColor(brownMaterial)
            break
        case "Blue":
            setWorkingPlaneColor(blueMaterial)
            break
        case "Purple":
            setWorkingPlaneColor(purpleMaterial)
            break
        case "Cyan":
            setWorkingPlaneColor(cyanMaterial)
            break
        case "Light Gray":
            setWorkingPlaneColor(lightGrayMaterial)
            break
        case "Gray":
            setWorkingPlaneColor(grayMaterial)
            break
        case "Pink":
            setWorkingPlaneColor(pinkMaterial)
            break
        case "Lime":
            setWorkingPlaneColor(limeMaterial)
            break
        case "Yellow":
            setWorkingPlaneColor(yellowMaterial)
            break
        case "Light Blue":
            setWorkingPlaneColor(lightBlueCode)
            break
        case "Magenta":
            setWorkingPlaneColor(magentaMaterial)
            break
        case "Orange":
            setWorkingPlaneColor(orangeMaterial)
            break
        case "White":
            setWorkingPlaneColor(whiteMaterial)
            break
    }
})

const colorSettingsForm = document.getElementById('colorSettings')
colorSettingsForm.addEventListener('change', function (event)
{
    const overridePalette  = document.getElementById('colorOverride')
    const colorPicker      = document.getElementById('overrideMap')

    if(overridePalette.checked)
    {
        colorPicker.style.visibility = "visible"

        const settingBlack          = document.getElementById("color1")
        const settingRed            = document.getElementById("color2")
        const settingGreen          = document.getElementById("color3")
        const settingBrown          = document.getElementById("color4")
        const settingBlue           = document.getElementById("color5")
        const settingPurple         = document.getElementById("color6")
        const settingCyan           = document.getElementById("color7")
        const settingLightGray      = document.getElementById("color8")
        const settingGray           = document.getElementById("color9")
        const settingPink           = document.getElementById("color10")
        const settingLime           = document.getElementById("color11")
        const settingYellow         = document.getElementById("color12")
        const settingLightBlue      = document.getElementById("color13")
        const settingMagenta        = document.getElementById("color14")
        const settingOrange         = document.getElementById("color15")
        const settingWhite          = document.getElementById("color16")

        const settingGlassBlack          = document.getElementById("blend1")
        const settingGlassRed            = document.getElementById("blend2")
        const settingGlassGreen          = document.getElementById("blend3")
        const settingGlassBrown          = document.getElementById("blend4")
        const settingGlassBlue           = document.getElementById("blend5")
        const settingGlassPurple         = document.getElementById("blend6")
        const settingGlassCyan           = document.getElementById("blend7")
        const settingGlassLightGray      = document.getElementById("blend8")
        const settingGlassGray           = document.getElementById("blend9")
        const settingGlassPink           = document.getElementById("blend10")
        const settingGlassLime           = document.getElementById("blend11")
        const settingGlassYellow         = document.getElementById("blend12")
        const settingGlassLightBlue      = document.getElementById("blend13")
        const settingGlassMagenta        = document.getElementById("blend14")
        const settingGlassOrange         = document.getElementById("blend15")
        const settingGlassWhite          = document.getElementById("blend16")

        var uses = []
        for(var i = 1; i <= 9; i++)
        {
            uses[i] = 0
        }

        for(var code = 1; code <= 16; code++)
        {
            const currentSetting = document.getElementById("color" + code)
            var value = parseInt(currentSetting.options[currentSetting.selectedIndex].value)

            if(value >= 1 && value <= 9)
            {
                uses[value]++
            }
        }

        //TODO add none option to all preselected colors
        //Check over codes again
        //  add each digit with uses === 0 as an option
        //  if uses > 1, remove as an option, decrement
        for(var code = 1; code <= 16; code++)
        {
            var currentSetting = document.getElementById("color" + code)

            for(var digit = 1; digit <= 9; digit++)
            {
                if(uses[digit] === 0)
                {
                    var alreadyAdded = false

                    for(var option of currentSetting.options)
                    {
                        if(parseInt(option.value) === digit)
                        {
                            alreadyAdded = true
                        }
                    }

                    if(!alreadyAdded)
                    {
                        var opt = document.createElement('option')
                        opt.value = digit
                        opt.innerHTML = digit
                        currentSetting.appendChild(opt)   //TODO insertBefore over append to keep numbers in order
                    }
                }
                else if(uses[digit] > 1)
                {
                    //try to remove as an option
                    //set to -
                    for(var option of currentSetting.options)
                    {
                        if(parseInt(option.value) === digit)
                        {
                            //decrement uses
                            uses[digit]--

                            option.remove()
                        }
                    }

                }
            }
        }

        //Assign color codes
        var unusableCodes = 20

        const forBlack = parseInt(settingBlack.options[settingBlack.selectedIndex].value)
        blackCode = Number.isNaN(forBlack) ? unusableCodes++ : forBlack
        blackMaterial.blendType = settingGlassBlack.checked ? pc.BLEND_NORMAL : pc.BLEND_NONE

        const forRed = parseInt(settingRed.options[settingRed.selectedIndex].value)
        redCode = Number.isNaN(forRed) ? unusableCodes++ : forRed
        redMaterial.blendType = settingGlassRed.checked ? pc.BLEND_NORMAL : pc.BLEND_NONE

        const forGreen = parseInt(settingGreen.options[settingGreen.selectedIndex].value)
        greenCode = Number.isNaN(forGreen) ? unusableCodes++ : forGreen
        greenMaterial.blendType = settingGlassGreen.checked ? pc.BLEND_NORMAL : pc.BLEND_NONE

        const forBrown = parseInt(settingBrown.options[settingBrown.selectedIndex].value)
        brownCode = Number.isNaN(forBrown) ? unusableCodes++ : forBrown
        brownMaterial.blendType = settingGlassBrown.checked ? pc.BLEND_NORMAL : pc.BLEND_NONE

        const forBlue = parseInt(settingBlue.options[settingBlue.selectedIndex].value)
        blueCode = Number.isNaN(forBlue) ? unusableCodes++ : forBlue
        blueMaterial.blendType = settingGlassBlue.checked ? pc.BLEND_NORMAL : pc.BLEND_NONE

        const forPurple = parseInt(settingPurple.options[settingPurple.selectedIndex].value)
        purpleCode = Number.isNaN(forPurple) ? unusableCodes++ : forPurple
        purpleMaterial.blendType = settingGlassPurple.checked ? pc.BLEND_NORMAL : pc.BLEND_NONE

        const forCyan = parseInt(settingCyan.options[settingCyan.selectedIndex].value)
        cyanCode = Number.isNaN(forCyan) ? unusableCodes++ : forCyan
        cyanMaterial.blendType = settingGlassCyan.checked ? pc.BLEND_NORMAL : pc.BLEND_NONE

        const forLightGray = parseInt(settingLightGray.options[settingLightGray.selectedIndex].value)
        lightGrayCode = Number.isNaN(forLightGray) ? unusableCodes++ : forLightGray
        lightGrayMaterial.blendType = settingGlassLightGray.checked ? pc.BLEND_NORMAL : pc.BLEND_NONE

        const forGray = parseInt(settingGray.options[settingGray.selectedIndex].value)
        grayCode = Number.isNaN(forGray) ? unusableCodes++ : forGray
        grayMaterial.blendType = settingGlassGray.checked ? pc.BLEND_NORMAL : pc.BLEND_NONE

        const forPink = parseInt(settingPink.options[settingPink.selectedIndex].value)
        pinkCode = Number.isNaN(forPink) ? unusableCodes++ : forPink
        pinkMaterial.blendType = settingGlassPink.checked ? pc.BLEND_NORMAL : pc.BLEND_NONE

        const forLime = parseInt(settingLime.options[settingLime.selectedIndex].value)
        limeCode = Number.isNaN(forLime) ? unusableCodes++ : forLime
        limeMaterial.blendType = settingGlassLime.checked ? pc.BLEND_NORMAL : pc.BLEND_NONE

        const forYellow = parseInt(settingYellow.options[settingYellow.selectedIndex].value)
        yellowCode = Number.isNaN(forYellow) ? unusableCodes++ : forYellow
        yellowMaterial.blendType = settingGlassYellow.checked ? pc.BLEND_NORMAL : pc.BLEND_NONE

        const forLightBlue = parseInt(settingLightBlue.options[settingLightBlue.selectedIndex].value)
        lightBlueCode = Number.isNaN(forLightBlue) ? unusableCodes++ : forLightBlue
        lightBlueMaterial.blendType = settingGlassLightBlue.checked ? pc.BLEND_NORMAL : pc.BLEND_NONE

        const forMagenta = parseInt(settingMagenta.options[settingMagenta.selectedIndex].value)
        magentaCode = Number.isNaN(forMagenta) ? unusableCodes++ : forMagenta
        magentaMaterial.blendType = settingGlassMagenta.checked ? pc.BLEND_NORMAL : pc.BLEND_NONE

        const forOrange = parseInt(settingOrange.options[settingOrange.selectedIndex].value)
        orangeCode = Number.isNaN(forOrange) ? unusableCodes++ : forOrange
        orangeMaterial.blendType = settingGlassOrange.checked ? pc.BLEND_NORMAL : pc.BLEND_NONE

        const forWhite = parseInt(settingWhite.options[settingWhite.selectedIndex].value)
        whiteCode = Number.isNaN(forWhite) ? unusableCodes++ : forWhite
        whiteMaterial.blendType = settingGlassWhite.checked ? pc.BLEND_NORMAL : pc.BLEND_NONE

    }
    else
    {
        colorPicker.style.visibility = "hidden"

        blackCode = 20 //oops
        redCode = 1
        greenCode = 2
        brownCode = 3
        blueCode = 4
        purpleCode = 5
        cyanCode = 6
        lightGrayCode = 7
        grayCode = 8
        pinkCode = 9
        limeCode = 10
        yellowCode = 11
        lightBlueCode = 12
        magentaCode = 13
        orangeCode = 14
        whiteCode = 15

    }

    loadFromTextArea() //Rebuild once color codes are changed
})
//Camera and scene initialized

//Returns a matrix of the given size, initialized to 0
function generateMatrix(width, height, depth)
{
    var output = []

    for (var i = 0; i < depth; i++)
    {
        output.push([])
        for (var j = 0; j < height; j++)
        {
            output[i].push([])
            for (var k = 0; k < width; k++)
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
    for (var i = 0; i < fWidth; i++)
    {
        for (var j = 0; j < fHeight; j++)
        {
            for (var k = 0; k < fDepth; k++)
            {
                second[i][j][k] = first[i][j][k]
            }
        }
    }
}

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
    for(var x = 0; x < depth; x++)
    {
        for(var y = 0; y < height; y++)
        {
            for(var z = 0; z < width; z++)
            {
                matrix[x][y][z] = 0
            }
        }
    }
}

//Initialize matrix
let width = 64
let height = 100
let depth = 64

let matrix = generateMatrix(width, height, depth)
let matrixBuffer = generateMatrix(width, height, depth)

function loadFromTextArea()
{
    for(var x = 0; x < depth; x++)
    {
        for(var y = 0; y < height; y++)
        {
            for(var z = 0; z < width; z++)
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

    const content = document.getElementById('editor_text')

    var lx = 0 //Width
    var ly = 0 //Height
    var lz = 0 //Depth

    var layers = []
    layers = content.value.split("#")

    for(const layer of layers)
    {
        var rows = []
        rows = layer.split("\n")

        for(const row of rows)
        {
            if(row !== "") //Checking for excess whitespace
            {
                var blocks = []
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
            var e = new pc.Entity()
            e.addComponent("model", { type: "box", isStatic: true })

            switch (b) {
                case blackCode:
                    e.model.model.meshInstances[0].material = blackMaterial
                    break
                case redCode:
                    e.model.model.meshInstances[0].material = redMaterial
                    break
                case greenCode:
                    e.model.model.meshInstances[0].material = greenMaterial
                    break
                case brownCode:
                    e.model.model.meshInstances[0].material = brownMaterial
                    break
                case blueCode:
                    e.model.model.meshInstances[0].material = blueMaterial
                    break
                case purpleCode:
                    e.model.model.meshInstances[0].material = purpleMaterial
                    break
                case cyanCode:
                    e.model.model.meshInstances[0].material = cyanMaterial
                    break
                case lightGrayCode:
                    e.model.model.meshInstances[0].material = lightGrayMaterial
                    break
                case grayCode:
                    e.model.model.meshInstances[0].material = grayMaterial
                    break
                case pinkCode:
                    e.model.model.meshInstances[0].material = pinkMaterial
                    break
                case limeCode:
                    e.model.model.meshInstances[0].material = limeMaterial
                    break
                case yellowCode:
                    e.model.model.meshInstances[0].material = yellowMaterial
                    break
                case lightBlueCode:
                    e.model.model.meshInstances[0].material = lightBlueMaterial
                    break
                case magentaCode:
                    e.model.model.meshInstances[0].material = magentaMaterial
                    break
                case orangeCode:
                    e.model.model.meshInstances[0].material = orangeMaterial
                    break
                case whiteCode:
                    e.model.model.meshInstances[0].material = whiteMaterial
                    break
                default:
                    e.model.model.meshInstances[0].material = whiteMaterial
            }

            app.root.addChild(e)
            e.setPosition(x + 0.5, y + 0.5, z + 0.5)
            e.setLocalScale(0.99, 0.99, 0.99)

            this.e = e
        }
    }
}

function addBlock(x, y, z, b)
{
    var toAdd = new Block(x, y, z, b)

    var resize = false
    var fwidth = width
    var fheight = height
    var fdepth = depth
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

for (var z = 0; z < matrix.length; z++)
{
    for (var y = 0; y < matrix[z].length; y++)
    {
        for (var x = 0; x < matrix[z][y].length; x++)
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

var viewportLocked
var rotateSpeed = 0.1
var moveSpeed = 0.05
var zoomModifier = 5

//Viewport Controls

{
    const mouse = new pc.Mouse(document.body)
    mouse.disableContextMenu()

    const keyboard = new pc.Keyboard(document.body)

    var x = 0
    var y = 0

    mouse.on("mousemove", function (event) {
        if (event.buttons[pc.MOUSEBUTTON_LEFT] && !viewportLocked)
        {
            x += event.dx
            y += event.dy

            camera.setLocalEulerAngles(rotateSpeed * y, rotateSpeed * x, 0)

            if(!eulerAnglesSet && false) //Shelved this, was going to just spin the camera until the right angle was found
            {
                var startRotation = camera.rotation
                var margin = 10
                var steps = 0

                while   (
                    Math.abs(camera.rotation.x - startRotation.x <= margin &&
                        steps < 20)
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

    var onKeyDown = function (e)
    {
        var digit = e.key - pc.KEY_0
        if(0 <= digit && digit < 10 && !viewportLocked)
        {
            if (keyboard.isPressed(pc.KEY_SHIFT))
            {
                //Set a camera angle
                console.log("Setting camera angle " + digit + " to:")

                var rX = camera.rotation.x
                var rY = camera.rotation.y
                var rZ = camera.rotation.z
                var rW = camera.rotation.w

                console.log([rX, rY, rZ, rW])

                var pX = camera.position.x
                var pY = camera.position.y
                var pZ = camera.position.z

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
    keyboard.on("keydown", onKeyDown, this)

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