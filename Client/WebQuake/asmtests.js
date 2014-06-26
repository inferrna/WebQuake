CRotations = function(m1, m2)
{
    var res = new Float32Array(9);
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
    return res;
};
var m1 = new Float32Array([0.4, 0.1, 0.3, 0.1, 0.2, 0.3, 0.1, 0.3, 0.2]);
var m2 = new Float32Array([0.2, 0.1, 0.1, 0.2, 0.2, 0.1, 0.2, 0.3, 0.1]);
var m11 = new Float32Array([0.4, 0.1, 0.3, 0.1, 0.2, 0.3, 0.1, 0.3, 0.2]);
var m21 = new Float32Array([0.2, 0.1, 0.1, 0.2, 0.2, 0.1, 0.2, 0.3, 0.1]);
var res = Vec.ConcatRotations(m1, m2);
var res1 = CRotations(m1, m2);
var res2 = CRotations(m11, m21);

var ts1 = performance.now();
var res2 = CRotations(m11, m21);
var ts2 = performance.now();
var res1 = CRotations(m1, m2);
var ts3 = performance.now();
var res = Vec.ConcatRotations(m1, m2);
var ts4 = performance.now();
console.log(ts2-ts1);
console.log(res);
console.log(ts3-ts2);
console.log(res1);
console.log(ts4-ts3);
console.log(res2);
/*var a = SIMD.float32x4(1.0, 2.0, 3.0, 4.0);
console.log("SIMD a:");
console.log(a);*/
