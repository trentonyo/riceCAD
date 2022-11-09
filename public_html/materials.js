let Material = function (name, color, isGlass)
{
    this.name = name

    this.updateColor(color)

    this.isGlass = isGlass
    this.phong = undefined
}
Material.prototype.getPhongMaterial = function ()
{
    if (!this.phong)
    {
        this.phong = new pc.PhongMaterial()
        this.phong.diffuse.set(this.color.red, this.color.green, this.color.blue)
        this.phong.opacity = this.isGlass ? 0.5 : 1.0
        this.phong.blendType = pc.BLEND_NORMAL
        this.phong.update()
    }

    return this.phong
}
Material.prototype.updateColor = function(color)
{
    if (typeof color === "string")
    {
        this.color = {
            red:    parseInt(color.substring(1,3), 16) / 256,
            green:  parseInt(color.substring(3,5), 16) / 256,
            blue:   parseInt(color.substring(5,7), 16) / 256
        }
    }
    else if (color.red && color.green && color.blue)
    {
        this.color = color
    }
    else
    {
        throw "Material was passed a bad value for color: "+color
    }
}
Material.prototype.getPCColor = function ()
{
    return this.phong.diffuse
}

let deleteMe = function (r, g, b, color)
{
    let output = "#"
    output += Math.floor(255*r).toString(16)
    output += Math.floor(255*g).toString(16)
    output += Math.floor(255*b).toString(16)

    console.log(color, output)
}

let blackCode = 20
let minecraftBlack = new Material("Minecraft Black", "#1c1c21", false)
let blackMaterial = minecraftBlack.getPhongMaterial()

let redCode = 1
let minecraftRed = new Material("Minecraft Red", "#af2d26", false)
let redMaterial = minecraftRed.getPhongMaterial()

let greenCode = 2
let minecraftGreen = new Material("Minecraft Green", "#5e7c16", false)
let greenMaterial = minecraftGreen.getPhongMaterial()

let brownCode = 3
let minecraftBrown = new Material("Minecraft Brown", "#825433", false)
let brownMaterial = minecraftBrown.getPhongMaterial()

let blueCode = 4
let minecraftBlue = new Material("Minecraft Blue", "#3d44aa", false)
let blueMaterial = minecraftBlue.getPhongMaterial()

let purpleCode = 5
let minecraftPurple = new Material("Minecraft Purple", "#8933b7", false)
let purpleMaterial = minecraftPurple.getPhongMaterial()

let cyanCode = 6
let minecraftCyan = new Material("Minecraft Cyan", "#169b9b", false)
let cyanMaterial = minecraftCyan.getPhongMaterial()

let lightGrayCode = 7
let minecraftLightGray = new Material("Minecraft Cyan", "#9e9e96", false)
let lightGrayMaterial = minecraftLightGray.getPhongMaterial()

let grayCode = 8
let minecraftGray = new Material("Minecraft Gray", "#474f51", false)
let grayMaterial = minecraftGray.getPhongMaterial()

let pinkCode = 9
let minecraftPink = new Material("Minecraft Pink", "#f28caa", false)
let pinkMaterial = minecraftPink.getPhongMaterial()

let limeCode = 10
let minecraftLime = new Material("Minecraft Lime", "#7fc61e", false)
let limeMaterial = minecraftLime.getPhongMaterial()

let yellowCode = 11
let minecraftYellow = new Material("Minecraft Yellow", "#fcd83d", false)
let yellowMaterial = minecraftYellow.getPhongMaterial()

let lightBlueCode = 12
let minecraftLightBlue = new Material("Minecraft Light Blue", "#3ab2d8", false)
let lightBlueMaterial = minecraftLightBlue.getPhongMaterial()

let magentaCode = 13
let minecraftMagenta = new Material("Minecraft Magenta", "#c64fbc", false)
let magentaMaterial = minecraftMagenta.getPhongMaterial()

let orangeCode = 14
let minecraftOrange = new Material("Minecraft Orange", "#f77f1c", false)
let orangeMaterial = minecraftOrange.getPhongMaterial()

let whiteCode = 15
let minecraftWhite = new Material("Minecraft White", "#f9ffff", false)
let whiteMaterial = minecraftWhite.getPhongMaterial()
