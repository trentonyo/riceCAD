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
    return this.getPhongMaterial().diffuse
}

let deleteMe = function (r, g, b, color)
{
    let output = "#"
    output += Math.floor(255*r).toString(16)
    output += Math.floor(255*g).toString(16)
    output += Math.floor(255*b).toString(16)

    console.log(color, output)
}

let minecraftBlack = new Material("Minecraft Black", "#1c1c21", false)

let minecraftRed = new Material("Minecraft Red", "#af2d26", false)

let minecraftGreen = new Material("Minecraft Green", "#5e7c16", false)

let minecraftBrown = new Material("Minecraft Brown", "#825433", false)

let minecraftBlue = new Material("Minecraft Blue", "#3d44aa", false)

let minecraftPurple = new Material("Minecraft Purple", "#8933b7", false)

let minecraftCyan = new Material("Minecraft Cyan", "#169b9b", false)

let minecraftLightGray = new Material("Minecraft Cyan", "#9e9e96", false)

let minecraftGray = new Material("Minecraft Gray", "#474f51", false)

let minecraftPink = new Material("Minecraft Pink", "#f28caa", false)

let minecraftLime = new Material("Minecraft Lime", "#7fc61e", false)

let minecraftYellow = new Material("Minecraft Yellow", "#fcd83d", false)

let minecraftLightBlue = new Material("Minecraft Light Blue", "#3ab2d8", false)

let minecraftMagenta = new Material("Minecraft Magenta", "#c64fbc", false)

let minecraftOrange = new Material("Minecraft Orange", "#f77f1c", false)

let minecraftWhite = new Material("Minecraft White", "#f9ffff", false)
