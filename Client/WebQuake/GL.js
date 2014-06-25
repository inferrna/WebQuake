var GL = {};
var BUFFER_SIZE = 16777216;
GL.textures = [];
GL.currenttextures = [];
GL.programs = [];
function AsmFuncs(stdlib, env, heap) {
    "use asm";
    var sin = stdlib.Math.sin;
    var cos = stdlib.Math.cos;
    var floor = stdlib.Math.floor;
    var res32f = new stdlib.Float32Array(heap);
    var res64f = new stdlib.Float64Array(heap);
    var res8i = new stdlib.Uint8Array(heap);
    var inp8i = new stdlib.Uint8Array(heap);
    function rotation_matrix(pitch, yaw, roll, res){
        pitch = +pitch;
        yaw = +yaw;
        roll = +roll;
        res = res|0;
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
        res32f[(res+0)<<2>>2] = +(cy * cp);
        res32f[(res+1)<<2>>2] = +(sy * cp);
        res32f[(res+2)<<2>>2] = +(-sp);
        res32f[(res+3)<<2>>2] = +(-sy * cr + cy * sp * sr);
        res32f[(res+4)<<2>>2] = +(cy * cr + sy * sp * sr);
        res32f[(res+5)<<2>>2] = +( cp * sr);
        res32f[(res+6)<<2>>2] = +(-sy * -sr + cy * sp * cr);
        res32f[(res+7)<<2>>2] = +(cy * -sr + sy * sp * cr);
        res32f[(res+8)<<2>>2] = +(cp * cr);
        return 0;
    }
    function dot_product(){
        //return  +((+res32f[0])*(+res32f[3])+(+res32f[1])*(+res32f[4])+(+res32f[2])*(+res32f[5])) ;
        return  +(res64f[0]*res64f[3]+res64f[1]*res64f[4]+res64f[2]*res64f[5]);
    }
    function concat_rotations(m1, m2, r){
        m1 = m1|0;
        m2 = m2|0;
        r = r|0;
        res32f[(r+0)<<2>>2] = ((+res32f[(m1)<<2>>2])*(+res32f[(m2+0)<<2>>2])+(+res32f[(m1+1)<<2>>2])*(+res32f[(m2+3)<<2>>2])+(+res32f[(m1+2)<<2>>2])*(+res32f[(m2+6)<<2>>2]));
        res32f[(r+1)<<2>>2] = ((+res32f[(m1+0)<<2>>2])*(+res32f[(m2+1)<<2>>2])+(+res32f[(m1+1)<<2>>2])*(+res32f[(m2+4)<<2>>2])+(+res32f[(m1+2)<<2>>2])*(+res32f[(m2+7)<<2>>2]));
        res32f[(r+2)<<2>>2] = ((+res32f[(m1+0)<<2>>2])*(+res32f[(m2+2)<<2>>2])+(+res32f[(m1+1)<<2>>2])*(+res32f[(m2+5)<<2>>2])+(+res32f[(m1+2)<<2>>2])*(+res32f[(m2+8)<<2>>2]));
        res32f[(r+3)<<2>>2] = ((+res32f[(m1+3)<<2>>2])*(+res32f[(m2+0)<<2>>2])+(+res32f[(m1+4)<<2>>2])*(+res32f[(m2+3)<<2>>2])+(+res32f[(m1+5)<<2>>2])*(+res32f[(m2+6)<<2>>2]));
        res32f[(r+4)<<2>>2] = ((+res32f[(m1+3)<<2>>2])*(+res32f[(m2+1)<<2>>2])+(+res32f[(m1+4)<<2>>2])*(+res32f[(m2+4)<<2>>2])+(+res32f[(m1+5)<<2>>2])*(+res32f[(m2+7)<<2>>2]));
        res32f[(r+5)<<2>>2] = ((+res32f[(m1+3)<<2>>2])*(+res32f[(m2+2)<<2>>2])+(+res32f[(m1+4)<<2>>2])*(+res32f[(m2+5)<<2>>2])+(+res32f[(m1+5)<<2>>2])*(+res32f[(m2+8)<<2>>2]));
        res32f[(r+6)<<2>>2] = ((+res32f[(m1+6)<<2>>2])*(+res32f[(m2+0)<<2>>2])+(+res32f[(m1+7)<<2>>2])*(+res32f[(m2+3)<<2>>2])+(+res32f[(m1+8)<<2>>2])*(+res32f[(m2+6)<<2>>2]));
        res32f[(r+7)<<2>>2] = ((+res32f[(m1+6)<<2>>2])*(+res32f[(m2+1)<<2>>2])+(+res32f[(m1+7)<<2>>2])*(+res32f[(m2+4)<<2>>2])+(+res32f[(m1+8)<<2>>2])*(+res32f[(m2+7)<<2>>2]));
        res32f[(r+8)<<2>>2] = ((+res32f[(m1+6)<<2>>2])*(+res32f[(m2+2)<<2>>2])+(+res32f[(m1+7)<<2>>2])*(+res32f[(m2+5)<<2>>2])+(+res32f[(m1+8)<<2>>2])*(+res32f[(m2+8)<<2>>2]));
        return 0;
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
        var idxd = 0;
        var idxs = 0;
        var src = 0;
        var bs = 0;
        i = i|0; j = j|0; dest = dest|0; src = src|0; bs = bs|0; idxd = idxd|0; idxs = idxs|0;
        bs = 16777216;
        xstep = (+~~inwidth)/(+~~outwidth);
        ystep = (+~~inheight)/(+~~outheight);
        for (i = 0; (i|0) < (outheight|0); i = (i+1)|0){
            mul = +floor((+~~i)*ystep);
            src = (~~mul)|0 * inwidth;
            for (j = 0; (j | 0) < (outwidth | 0); j = (j | 0) + 1 | 0){
                idxd = (bs>>1) + dest|0 + j|0;
                idxs = src|0 + (~~+floor((+~~j)*xstep))|0;
                res8i[idxd>>0] = inp8i[idxs>>0]|0;
            }
            dest = dest+outwidth|0;
        }
        return 0;
    }
    return {
            rotation_matrix: rotation_matrix,
            scale_texture: scale_texture,
            dot_product: dot_product,
            concat_rotations: concat_rotations
            };
}

if(!window['asm_funcs']){
    console.warn("Init buffer. Must be single.");
    var buffer = memory.F4.buffer;
    window['mybuffer'] = buffer;
    var asm_funcs = AsmFuncs(window, 0, window['mybuffer']);
    window['asm_funcs'] = asm_funcs;
    GL.datav = new DataView(window['mybuffer']);
}
GL.Bind = function(target, texnum)
{
	if (GL.currenttextures[target] !== texnum)
	{
		if (GL.activetexture !== target)
		{
			GL.activetexture = target;
			gl.activeTexture(gl.TEXTURE0 + target);
		}
		GL.currenttextures[target] = texnum;
		gl.bindTexture(gl.TEXTURE_2D, texnum);
	}
};

GL.TextureMode_f = function()
{
	var i;
	if (Cmd.argv.length <= 1)
	{
		for (i = 0; i < GL.modes.length; ++i)
		{
			if (GL.filter_min === GL.modes[i][1])
			{
				Con.Print(GL.modes[i][0] + '\n');
				return;
			}
		}
		Con.Print('current filter is unknown???\n');
		return;
	}
	var name = Cmd.argv[1].toUpperCase();
	for (i = 0; i < GL.modes.length; ++i)
	{
		if (GL.modes[i][0] === name)
			break;
	}
	if (i === GL.modes.length)
	{
		Con.Print('bad filter name\n');
		return;
	}
	GL.filter_min = GL.modes[i][1];
	GL.filter_max = GL.modes[i][2];
	for (i = 0; i < GL.textures.length; ++i)
	{
		GL.Bind(0, GL.textures[i].texnum);
		gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, GL.filter_min);
		gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, GL.filter_max);
	}
};

GL.ortho = mFloat32Array([
	0.0, 0.0, 0.0, 0.0,
	0.0, 0.0, 0.0, 0.0,
	0.0, 0.0, 0.00001, 0.0,
	-1.0, 1.0, 0.0, 1.0
]);

GL.Set2D = function()
{
	gl.viewport(0, 0, (VID.width * SCR.devicePixelRatio) >> 0, (VID.height * SCR.devicePixelRatio) >> 0);
	GL.UnbindProgram();
	var i, program;
	for (i = 0; i < GL.programs.length; ++i)
	{
		program = GL.programs[i];
		if (program.uOrtho == null)
			continue;
		gl.useProgram(program.program);
		gl.uniformMatrix4fv(program.uOrtho, false, GL.ortho);
	}
	gl.disable(gl.DEPTH_TEST);
	gl.enable(gl.BLEND);
};

GL.ResampleTexture = function(data, inwidth, inheight, outwidth, outheight)
{
    /*//console.log("GL.ResampleTexture got "+inwidth+"x"+inheight+"=="+inwidth*inheight+" data:");
    //console.log(Array.prototype.slice.call(data).filter(function(x){return x!=0}));
    var heapin = new Uint8Array(window['mybuffer'], 0, inwidth * inheight);
    var heapout = new Uint8Array(window['mybuffer'], BUFFER_SIZE >> 1, outwidth * outheight);
    heapin.set(data);
    //for(var i=0; i<inwidth * inheight; i++) heapin[i]=data[i];
    window['asm_funcs'].scale_texture(inwidth, inheight, outwidth, outheight); 
	//var out = new Uint8Array(outwidth * outheight);
    //out.set(heapout);
    //console.log("GL.ResampleTexture gives "+outwidth+"x"+outheight+"=="+outwidth*outheight+" out:");
    //console.log(Array.prototype.slice.call(out).filter(function(x){return x!=0}));
    return heapout;*/
	var out = new Uint8Array(outwidth * outheight);
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
	return out;
};

GL.Upload = function(data, width, height)
{
	var scaled_width = width, scaled_height = height;
	if (((width & (width - 1)) !== 0) || ((height & (height - 1)) !== 0))
	{
		--scaled_width;
		scaled_width |= (scaled_width >> 1);
		scaled_width |= (scaled_width >> 2);
		scaled_width |= (scaled_width >> 4);
		scaled_width |= (scaled_width >> 8);
		scaled_width |= (scaled_width >> 16);
		++scaled_width;
		--scaled_height;
		scaled_height |= (scaled_height >> 1);
		scaled_height |= (scaled_height >> 2);
		scaled_height |= (scaled_height >> 4);
		scaled_height |= (scaled_height >> 8);
		scaled_height |= (scaled_height >> 16);
		++scaled_height;
	}
	if (scaled_width > 1024)
		scaled_width = 1024;
	if (scaled_height > 1024)
		scaled_height = 1024;
	if ((scaled_width !== width) || (scaled_height !== height)){
		data = GL.ResampleTexture(data, width, height, scaled_width, scaled_height);
        //console.log("rs1");
        //console.log(Array.prototype.slice.call(data).filter(function(x){return x!=0}));
    }
	var trans = new ArrayBuffer((scaled_width * scaled_height) << 2)
	var trans32 = new Uint32Array(trans);
	var i;
	for (i = scaled_width * scaled_height - 1; i >= 0; --i)
	{
		trans32[i] = COM.LittleLong(VID.d_8to24table[data[i]] + 0xff000000);
		if (data[i] >= 224)
			trans32[i] &= 0xffffff;
	}
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, scaled_width, scaled_height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(trans));
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, GL.filter_min);
	gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, GL.filter_max);
};

GL.LoadTexture = function(identifier, width, height, data)
{
	var glt, i;
	if (identifier.length !== 0)
	{
		for (i = 0; i < GL.textures.length; ++i)
		{
			glt = GL.textures[i];
			if (glt.identifier === identifier)
			{
				if ((width !== glt.width) || (height !== glt.height))
					Sys.Error('GL.LoadTexture: cache mismatch');
				return glt;
			}
		}
	}

	var scaled_width = width, scaled_height = height;
	if (((width & (width - 1)) !== 0) || ((height & (height - 1)) !== 0))
	{
		--scaled_width ;
		scaled_width |= (scaled_width >> 1);
		scaled_width |= (scaled_width >> 2);
		scaled_width |= (scaled_width >> 4);
		scaled_width |= (scaled_width >> 8);
		scaled_width |= (scaled_width >> 16);
		++scaled_width;
		--scaled_height;
		scaled_height |= (scaled_height >> 1);
		scaled_height |= (scaled_height >> 2);
		scaled_height |= (scaled_height >> 4);
		scaled_height |= (scaled_height >> 8);
		scaled_height |= (scaled_height >> 16);
		++scaled_height;
	}
	if (scaled_width > 1024)
		scaled_width = 1024;
	if (scaled_height > 1024)
		scaled_height = 1024;
	scaled_width >>= GL.picmip.value;
	if (scaled_width === 0)
		scaled_width = 1;
	scaled_height >>= GL.picmip.value;
	if (scaled_height === 0)
		scaled_height = 1;
	if ((scaled_width !== width) || (scaled_height !== height)){
		var rsdata = GL.ResampleTexture(data, width, height, scaled_width, scaled_height);
        //console.log("rs2");
        //console.log(Array.prototype.slice.call(rsdata).filter(function(x){return x!=0}));
    } else var rsdata = data;
	glt = {texnum: gl.createTexture(), identifier: identifier, width: width, height: height};
	GL.Bind(0, glt.texnum);
	GL.Upload(rsdata, scaled_width, scaled_height);
	GL.textures[GL.textures.length] = glt;
	return glt;
};

GL.LoadPicTexture = function(pic)
{
	var data = pic.data, scaled_width = pic.width, scaled_height = pic.height;
	if (((pic.width & (pic.width - 1)) !== 0) || ((pic.height & (pic.height - 1)) !== 0))
	{
		--scaled_width ;
		scaled_width |= (scaled_width >> 1);
		scaled_width |= (scaled_width >> 2);
		scaled_width |= (scaled_width >> 4);
		scaled_width |= (scaled_width >> 8);
		scaled_width |= (scaled_width >> 16);
		++scaled_width;
		--scaled_height;
		scaled_height |= (scaled_height >> 1);
		scaled_height |= (scaled_height >> 2);
		scaled_height |= (scaled_height >> 4);
		scaled_height |= (scaled_height >> 8);
		scaled_height |= (scaled_height >> 16);
		++scaled_height;
	}
	if (scaled_width > 1024)
		scaled_width = 1024;
	if (scaled_height > 1024)
		scaled_height = 1024;
	if ((scaled_width !== pic.width) || (scaled_height !== pic.height)){
		data = GL.ResampleTexture(data, pic.width, pic.height, scaled_width, scaled_height);
        //console.log("rs3");
        //console.log(Array.prototype.slice.call(data).filter(function(x){return x!=0}));
    }
	var texnum = gl.createTexture();
	GL.Bind(0, texnum);
	var trans = new ArrayBuffer((scaled_width * scaled_height) << 2)
	var trans32 = new Uint32Array(trans);
	var i;
	for (i = scaled_width * scaled_height - 1; i >= 0; --i)
	{
		if (data[i] !== 255)
			trans32[i] = COM.LittleLong(VID.d_8to24table[data[i]] + 0xff000000);
	}
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, scaled_width, scaled_height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(trans));
	gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	return texnum;
};

GL.CreateProgram = function(identifier, uniforms, attribs, textures)
{
	var p = gl.createProgram();
	var program =
	{
		identifier: identifier,
		program: p,
		attribs: []
	};

	var vsh = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vsh, document.getElementById('vsh' + identifier).text);
	gl.compileShader(vsh);
	if (gl.getShaderParameter(vsh, gl.COMPILE_STATUS) !== true)
		Sys.Error('Error compiling shader: ' + gl.getShaderInfoLog(vsh));

	var fsh = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fsh, document.getElementById('fsh' + identifier).text);
	gl.compileShader(fsh);
	if (gl.getShaderParameter(fsh, gl.COMPILE_STATUS) !== true)
		Sys.Error('Error compiling shader: ' + gl.getShaderInfoLog(fsh));

	gl.attachShader(p, vsh);
	gl.attachShader(p, fsh);

	gl.linkProgram(p);
	if (gl.getProgramParameter(p, gl.LINK_STATUS) !== true)
		Sys.Error('Error linking program: ' + gl.getProgramInfoLog(p));

	gl.useProgram(p);
	var i;
	for (i = 0; i < uniforms.length; ++i)
		program[uniforms[i]] = gl.getUniformLocation(p, uniforms[i]);
	for (i = 0; i < attribs.length; ++i)
	{
		program.attribs[program.attribs.length] = attribs[i];
		program[attribs[i]] = gl.getAttribLocation(p, attribs[i]);
	}
	for (i = 0; i < textures.length; ++i)
	{
		program[textures[i]] = i;
		gl.uniform1i(gl.getUniformLocation(p, textures[i]), i);
	}

	GL.programs[GL.programs.length] = program;
	return program;
};

GL.UseProgram = function(identifier)
{
	var i, j;
	var program = GL.currentprogram;
	if (program != null)
	{
		if (program.identifier === identifier)
			return program;
		for (i = 0; i < program.attribs.length; ++i)
			gl.disableVertexAttribArray(program[program.attribs[i]]);
	}
	for (i = 0; i < GL.programs.length; ++i)
	{
		program = GL.programs[i];
		if (program.identifier === identifier)
		{
			GL.currentprogram = program;
			gl.useProgram(program.program);
			for (j = 0; j < program.attribs.length; ++j)
				gl.enableVertexAttribArray(program[program.attribs[j]]);
			return program;
		}
	}
};

GL.UnbindProgram = function()
{
	if (GL.currentprogram == null)
		return;
	var i;
	for (i = 0; i < GL.currentprogram.attribs.length; ++i)
		gl.disableVertexAttribArray(GL.currentprogram[GL.currentprogram.attribs[i]]);
	GL.currentprogram = null;
};

GL.identity = mFloat32Array([1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0]);



GL.RotationMatrix = function(pitch, yaw, roll)
{
	/*pitch *= Math.PI / -180.0;
	yaw *= Math.PI / 180.0;
	roll *= Math.PI / 180.0;
	var sp = Math.sin(pitch);
	var cp = Math.cos(pitch);
	var sy = Math.sin(yaw);
	var cy = Math.cos(yaw);
	var sr = Math.sin(roll);
	var cr = Math.cos(roll);
	return [
		cy * cp,					sy * cp,					-sp,
		-sy * cr + cy * sp * sr,	cy * cr + sy * sp * sr,		cp * sr,
		-sy * -sr + cy * sp * cr,	cy * -sr + sy * sp * cr,	cp * cr
	];*/
    var res = mFloat32Array(9);
    window['asm_funcs'].rotation_matrix(pitch, yaw, roll, res.byteOffset>>2);
    return res;
};

GL.Init = function()
{
	VID.mainwindow = document.getElementById('mainwindow');
	try
	{
		gl = VID.mainwindow.getContext('webgl') || VID.mainwindow.getContext('experimental-webgl');
	}
	catch (e) {}
	if (gl == null)
		Sys.Error('Unable to initialize WebGL. Your browser may not support it.');

	gl.clearColor(0.0, 0.0, 0.0, 0.0);
	gl.cullFace(gl.FRONT);
	gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);

	GL.modes = [
		['GL_NEAREST', gl.NEAREST, gl.NEAREST],
		['GL_LINEAR', gl.LINEAR, gl.LINEAR],
		['GL_NEAREST_MIPMAP_NEAREST', gl.NEAREST_MIPMAP_NEAREST, gl.NEAREST],
		['GL_LINEAR_MIPMAP_NEAREST', gl.LINEAR_MIPMAP_NEAREST, gl.LINEAR],
		['GL_NEAREST_MIPMAP_LINEAR', gl.NEAREST_MIPMAP_LINEAR, gl.NEAREST],
		['GL_LINEAR_MIPMAP_LINEAR', gl.LINEAR_MIPMAP_LINEAR, gl.LINEAR]
	];
	GL.filter_min = gl.LINEAR_MIPMAP_NEAREST;
	GL.filter_max = gl.LINEAR;

	GL.picmip = Cvar.RegisterVariable('gl_picmip', '2');
	Cmd.AddCommand('gl_texturemode', GL.TextureMode_f);

	GL.rect = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, GL.rect);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW);

	VID.mainwindow.style.display = 'inline-block';
};
