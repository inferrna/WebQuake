function DotProduct(v1, v2)
{
    /*(new Float64Array(window['mybuffer'], 0, 3)).set(v1.subarray(0,3));
    (new Float64Array(window['mybuffer'], 3<<3, 3)).set(v2.subarray(0,3));
    return window['asm_funcs'].dot_product();*/
    //return GL.datav.getFloat32(6<<2);
	return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

function RecursiveLightPoint(node, start, end, lightdata, faces, texinfo, lightstylevalue)
{
	if (node.contents < 0)
		return -1;

	var normal = node.plane.normal;
	var front = DotProduct(start, normal) - node.plane.dist;
	var back = DotProduct(end, normal) - node.plane.dist;
	var side = front < 0;

	if ((back < 0) === side)
		return RecursiveLightPoint(node.children[side === true ? 1 : 0], start, end);

	var frac = front / (front - back);
	var mid = new Float32Array([
		start[0] + (end[0] - start[0]) * frac,
		start[1] + (end[1] - start[1]) * frac,
		start[2] + (end[2] - start[2]) * frac
	]);

	var r = RecursiveLightPoint(node.children[side === true ? 1 : 0], start, mid);
	if (r >= 0)
		return r;

	if ((back < 0) === side)
		return -1;

	var i, surf, tex, s, t, ds, dt, lightmap, size, maps;
	for (i = 0; i < node.numfaces; ++i)
	{
		surf = faces[node.firstface + i];
		if ((surf.sky === true) || (surf.turbulent === true))
			continue;

		tex = texinfo[surf.texinfo];

		s = DotProduct(mid, tex.vecs[0]) + tex.vecs[0][3];
		if (s < surf.texturemins[0])
			continue;
		t = DotProduct(mid, tex.vecs[1]) + tex.vecs[1][3];
		if (t < surf.texturemins[1])
			continue;

		if (surf.lightofs === 0)
			return 0;
		ds = s - surf.texturemins[0];
		dt = t - surf.texturemins[1];
		if ((ds > surf.extents[0]) || (dt > surf.extents[1]))
			continue;

		ds >>= 4;
		dt >>= 4;

		lightmap = surf.lightofs;
		if (lightmap === 0)
			return 0;

		lightmap += dt * ((surf.extents[0] >> 4) + 1) + ds;
		r = 0;
		size = ((surf.extents[0] >> 4) + 1) * ((surf.extents[1] >> 4) + 1);
		for (maps = 0; maps < surf.styles.length; ++maps)
		{
			r += lightdata[lightmap] * lightstylevalue[surf.styles[maps]] * 22;
			lightmap += size;
		}
		return r >> 8;
	}
	return RecursiveLightPoint(node.children[side !== true ? 1 : 0], mid, end);
}

onmessage = function (oEvent) {
    var res = RecursiveLightPoint(oEvent.data.node, 
                                  oEvent.data.start,
                                  oEvent.data.end,
                                  oEvent.data.lightdata,
                                  oEvent.data.faces,
                                  oEvent.data.texinfo,
                                  oEvent.data.lightstylevalue);
    delete oEvent.data;
    delete oEvent;
    postMessage(res);
};
