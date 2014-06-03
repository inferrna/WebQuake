var BUFFER_SIZE = 4194304;
function AsmFuncs(stdlib, env, heap) {
    "use asm";
    var sin = stdlib.Math.sin;
    var cos = stdlib.Math.cos;
    var floor = stdlib.Math.floor;
    var res32f = new stdlib.Float32Array(heap);
    var res8i = new stdlib.Uint8Array(heap);
    var inp8i = new stdlib.Uint8Array(heap);
    function rotation_matrix(pitch, yaw, roll){
        pitch = +pitch;
        yaw = +yaw;
        roll = +roll;
        var sp = 0.0;
        var cp = 0.0;
        var sy = 0.0;
        var cy = 0.0;
        var sr = 0.0;
        var cr = 0.0;
        var PI = 3.141592653589793;
        pitch = -1.0*pitch*PI/180.0;
        yaw   = yaw*PI/180.0;
        roll  = roll*PI/180.0;
        sp = +sin(pitch);
        cp = +cos(pitch);
        sy = +sin(yaw);
        cy = +cos(yaw);
        sr = +sin(roll);
        cr = +cos(roll);
        res32f[0] =  cy * cp;
        res32f[1] =  sy * cp;
        res32f[2] =  -sp;
        res32f[3] =  -sy * cr + cy * sp * sr;
        res32f[4] =  cy * cr + sy * sp * sr;
        res32f[5] =   cp * sr;
        res32f[6] =  -sy * -sr + cy * sp * cr;
        res32f[7] =  cy * -sr + sy * sp * cr;
        res32f[8] =  cp * cr;
    }
    function scale_texture(inwidth, inheight, outwidth, outheight){
        inwidth = inwidth|0;
        inheight = inheight|0;
        outwidth = outwidth|0;
        outheight = outheight|0;
        var xstep = 0.0;
        var ystep = 0.0;
        var mul = 0.0;
        var dest = 0;
        var i = 0;
        var j = 0;
        var src = 0;
        var bs = 0;
        i = i|0; j = j|0; dest = dest|0; src = src|0; bs = 0|0;
        bs = 4194304;
        xstep = (+~~inwidth)/(+~~outwidth);
        ystep = (+~~inheight)/(+~~outheight);
        for (i = 0; (i|0) < (outheight|0); i = (i|0)+1|0){
            mul = +floor((+~~i)*ystep);
            src = (~~mul)|0 * inwidth;
            for (j = 0; (j|0) < (outwidth|0); j = (j|0)+1|0){
                res8i[(dest+j|0)>>0] = inp8i[(bs>>1) + src|0+(~~+floor((+~~j)*xstep))];
            }
            dest = dest+outwidth|0;
        }
    }
    return {rotation_matrix: rotation_matrix, scale_texture: scale_texture}; //asm_funcs.scale_texture
}

var buffer = new ArrayBuffer(BUFFER_SIZE);
var asm_funcs = AsmFuncs(global, 0, buffer);

function rt(data, inwidth, inheight, outwidth, outheight)
{
    var heapin = new Uint8Array(buffer, BUFFER_SIZE >> 1, inwidth*inheight);
    var heapout = new Uint8Array(buffer, 0, outwidth*outheight);
    heapin.set(data);
    asm_funcs.scale_texture(inwidth, inheight, outwidth, outheight); 
	var outdata = new ArrayBuffer(outwidth * outheight);
	var out = new Uint8Array(outdata);
    out.set(heapout);
    return out;
	/*var outdata = new ArrayBuffer(outwidth * outheight);
	var out = new Uint8Array(outdata);
	var xstep = inwidth / outwidth, ystep = inheight / outheight;
	var src, dest = 0, y;
	var i, j;
	for (i = 0; i < outheight; ++i)
	{
		src = Math.floor(i * ystep) * inwidth;
		for (j = 0; j < outwidth; ++j)
			out[dest + j] = data[src + Math.floor(j * xstep)];
		dest += outwidth;
	}
	return out;*/
}
var s1 = 8;
var s2 = 160;
var arr = new Uint8Array(s1*s1);
for(var i=0; i<s1; i++)
	for(var j=0; j<s1; j++) arr[i*s1+j] = i+j;
arr = rt(arr, s1, s1, s2, s2);
console.log(Array.prototype.slice.call(arr));
