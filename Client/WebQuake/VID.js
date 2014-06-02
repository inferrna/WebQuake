var VID = {};

VID.d_8to24table = new Uint32Array(new ArrayBuffer(1024));

VID.SetPalette = function()
{
	var palette = COM.LoadFile('gfx/palette.lmp');
	if (palette === null)
		Sys.Error('Couldn\'t load gfx/palette.lmp');
	var _pal = new Uint8Array(palette);
    (function(pal){
        "use asm";
        (function(){
            var i = 0;
            var src = 0;
            i = i | 0;
            src = src|0;
            for (i = 0; (i|0)<(256|0); i=(i|0)+1|0)
            {
                VID.d_8to24table[i] = pal[src] + (pal[src + 1] << 8) + (pal[src + 2] << 16);
                src += 3|0;
            }
        }());
    }(_pal));
};

VID.Init = function()
{
	document.getElementById('progress').style.display = 'none';
	GL.Init();
	VID.SetPalette();
};
VID = {};

VID.d_8to24table = new Uint32Array(new ArrayBuffer(1024));

VID.SetPalette = function()
{
var palette = COM.LoadFile('gfx/palette.lmp');
if (palette == null)
Sys.Error('Couldn\'t load gfx/palette.lmp');
var pal = new Uint8Array(palette);
var i, src = 0;
for (i = 0; i < 256; ++i)
{
VID.d_8to24table[i] = pal[src] + (pal[src + 1] << 8) + (pal[src + 2] << 16);
src += 3;
}
};

VID.Init = function()
{
document.getElementById('progress').style.display = 'none';
GL.Init();
VID.SetPalette();
};
