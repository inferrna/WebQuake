var Vec = {};

Vec.v9a = new Float32Array(9);
Vec.v9b = new Float32Array(9);
Vec.v9c = new Float32Array(9);
Vec.v9d = new Float32Array(9);
Vec.v3a = new Float32Array(3);
Vec.v3b = new Float32Array(3);
Vec.v3c = new Float32Array(3);

Vec.origin = new Float32Array([0.0, 0.0, 0.0]);

Vec.Perpendicular = function(v)
{
	var pos = 0;
	var minelem = 1;
	if (Math.abs(v[2]) < minelem)
	{
		pos = 2;
		minelem = Math.abs(v[2]);
	}
	else if (Math.abs(v[1]) < minelem)
	{
		pos = 1;
		minelem = Math.abs(v[1]);
	}
	else if (Math.abs(v[0]) < minelem)
	{
		pos = 0;
		minelem = Math.abs(v[0]);
	}
	var tempvec = new Float32Array([0.0, 0.0, 0.0]);
	tempvec[pos] = 1.0;
	var inv_denom = 1.0 / (Vec.DotProduct(v, v));
	var d = (Vec.DotProduct(tempvec, v)) * inv_denom;
	var dst = new Float32Array([
		tempvec[0] - d * v[0] * inv_denom,
		tempvec[1] - d * v[1] * inv_denom,
		tempvec[2] - d * v[2] * inv_denom
	]);
	Vec.Normalize(dst);
	return dst;
};

Vec.RotatePointAroundVector = function(dir, point, degrees)
{
    //console.log("Call to Vec.RotatePointAroundVector");
	var r = Vec.Perpendicular(dir);
	var up = Vec.CrossProduct(r, dir);
	var m = Vec.v9a; m.set([
		r[0], up[0], dir[0],
		r[1], up[1], dir[1],
		r[2], up[2], dir[2]
	]);
	var im = Vec.v9b; im.set([
            m[0], m[3], m[6],
            m[1], m[4], m[7],
            m[2], m[5], m[8]
        ]);
	var s = Math.sin(degrees * Math.PI / 180.0);
	var c = Math.cos(degrees * Math.PI / 180.0);
	var zrot = Vec.v9c; zrot.set([c, s, 0, -s, c, 0, 0, 0, 1]);
	var rot = Vec.ConcatRotations(Vec.ConcatRotations(m, zrot), im);
	var res = Vec.v3a; res.set([
        Vec.DotProduct(rot, point),
        Vec.DotProduct(rot.subarray(3<<2, 3), point),
        Vec.DotProduct(rot.subarray(6<<2, 3), point),
		/*rot[0] * point[0] + rot[1] * point[1] + rot[2] * point[2],
		rot[3] * point[0] + rot[4] * point[1] + rot[5] * point[2],
		rot[6] * point[0] + rot[7] * point[1] + rot[8] * point[2]*/
	]);
    return res;
};

Vec.Anglemod = function(a)
{
	return (a % 360.0 + 360.0) % 360.0;
};

Vec.BoxOnPlaneSide = function(emins, emaxs, p)
{
	if (p.type <= 2)
	{
		if (p.dist <= emins[p.type])
			return 1;
		if (p.dist >= emaxs[p.type])
			return 2;
		return 3;
	}
	var dist1, dist2;
	switch (p.signbits)
	{
	case 0:
		dist1 = p.normal[0] * emaxs[0] + p.normal[1] * emaxs[1] + p.normal[2] * emaxs[2];
		dist2 = p.normal[0] * emins[0] + p.normal[1] * emins[1] + p.normal[2] * emins[2];
		break;
	case 1:
		dist1 = p.normal[0] * emins[0] + p.normal[1] * emaxs[1] + p.normal[2] * emaxs[2];
		dist2 = p.normal[0] * emaxs[0] + p.normal[1] * emins[1] + p.normal[2] * emins[2];
		break;
	case 2:
		dist1 = p.normal[0] * emaxs[0] + p.normal[1] * emins[1] + p.normal[2] * emaxs[2];
		dist2 = p.normal[0] * emins[0] + p.normal[1] * emaxs[1] + p.normal[2] * emins[2];
		break;
	case 3:
		dist1 = p.normal[0] * emins[0] + p.normal[1] * emins[1] + p.normal[2] * emaxs[2];
		dist2 = p.normal[0] * emaxs[0] + p.normal[1] * emaxs[1] + p.normal[2] * emins[2];
		break;
	case 4:
		dist1 = p.normal[0] * emaxs[0] + p.normal[1] * emaxs[1] + p.normal[2] * emins[2];
		dist2 = p.normal[0] * emins[0] + p.normal[1] * emins[1] + p.normal[2] * emaxs[2];
		break;
	case 5:
		dist1 = p.normal[0] * emins[0] + p.normal[1] * emaxs[1] + p.normal[2] * emins[2];
		dist2 = p.normal[0] * emaxs[0] + p.normal[1] * emins[1] + p.normal[2] * emaxs[2];
		break;
	case 6:
		dist1 = p.normal[0] * emaxs[0] + p.normal[1] * emins[1] + p.normal[2] * emins[2];
		dist2 = p.normal[0] * emins[0] + p.normal[1] * emaxs[1] + p.normal[2] * emaxs[2];
		break;
	case 7:
		dist1 = p.normal[0] * emins[0] + p.normal[1] * emins[1] + p.normal[2] * emins[2];
		dist2 = p.normal[0] * emaxs[0] + p.normal[1] * emaxs[1] + p.normal[2] * emaxs[2];
		break;
	default:
		Sys.Error('Vec.BoxOnPlaneSide: Bad signbits');
	}
	var sides = 0;
	if (dist1 >= p.dist)
		sides = 1;
	if (dist2 < p.dist)
		sides += 2;
	return sides;
};

Vec.AngleVectors = function(angles, forward, right, up)
{
	var angle;
	
	angle = angles[0] * Math.PI / 180.0;
	var sp = Math.sin(angle);
	var cp = Math.cos(angle);
	angle = angles[1] * Math.PI / 180.0;
	var sy = Math.sin(angle);
	var cy = Math.cos(angle);
	angle = angles[2] * Math.PI / 180.0;
	var sr = Math.sin(angle);
	var cr = Math.cos(angle);
    try {
        if (forward != null)
        {
            forward.set([cp * cy, cp * sy, -sp]);
        }
        if (right != null)
        {
            right.set([cr * sy - sr * sp * cy,
                      -sr * sp * sy - cr * cy,
                      -sr * cp]);
        }
        if (up != null)
        {
            up.set([cr * sp * cy + sr * sy,
                    cr * sp * sy - sr * cy,
                    cr * cp]);
        }
    } catch(e) {
        console.log(e);
        console.log("Caller was " + Vec.AngleVectors.caller.name);
    }
};

Vec.DotProduct = function(v1, v2)
{
    /*(new Float64Array(window['mybuffer'], 0, 3)).set(v1.subarray(0,3));
    (new Float64Array(window['mybuffer'], 3<<3, 3)).set(v2.subarray(0,3));
    return window['asm_funcs'].dot_product();*/
    //return GL.datav.getFloat32(6<<2);
	return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
};

Vec.Copy = function(v1, v2)
{
    v2.set(v1);
	/*v2[0] = v1[0];
	v2[1] = v1[1];
	v2[2] = v1[2];*/
};

Vec.CrossProduct = function(v1, v2)
{
    var res = new Float32Array(3);//Vec.v3c;
	res.set([
		v1[1] * v2[2] - v1[2] * v2[1],
		v1[2] * v2[0] - v1[0] * v2[2],
		v1[0] * v2[1] - v1[1] * v2[0]
	]);
    return res;
};

Vec.Length = function(v)
{
	return Math.sqrt(Vec.DotProduct(v, v));
};

Vec.Normalize = function(v)
{
	var length = Math.sqrt(Vec.DotProduct(v, v));
	if (length === 0.0)
	{
		v[0] = v[1] = v[2] = 0.0;
		return 0.0;
	}
	v[0] /= length;
	v[1] /= length;
	v[2] /= length;
	return length;
};

Vec.ConcatRotations = function(m1, m2)
{
    //concat_rotations
    (new Float64Array(window['mybuffer'], 0, 9)).set(m1.subarray(0,9));
    (new Float64Array(window['mybuffer'], 9<<3, 9)).set(m2.subarray(0,9));
    window['asm_funcs'].concat_rotations();
    var res = new Float64Array(window['mybuffer'], 18<<3, 9);
    return new Float32Array(res);
    /*var res = Vec.v9d;
	res.set([
			m1[0] * m2[0] + m1[1] * m2[3] + m1[2] * m2[6],
			m1[0] * m2[1] + m1[1] * m2[4] + m1[2] * m2[7],
			m1[0] * m2[2] + m1[1] * m2[5] + m1[2] * m2[8],
			m1[3] * m2[0] + m1[4] * m2[3] + m1[5] * m2[6],
			m1[3] * m2[1] + m1[4] * m2[4] + m1[5] * m2[7],
			m1[3] * m2[2] + m1[4] * m2[5] + m1[5] * m2[8],
			m1[6] * m2[0] + m1[7] * m2[3] + m1[8] * m2[6],
			m1[6] * m2[1] + m1[7] * m2[4] + m1[8] * m2[7],
			m1[6] * m2[2] + m1[7] * m2[5] + m1[8] * m2[8]
	]);
    return res;*/
};
