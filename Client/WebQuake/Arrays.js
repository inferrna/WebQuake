window.Float32Array = function(param){
    console.log("Own Float32Array called");
    const $M = memory;
    const $malloc = $M.malloc, $F4 = $M.F4;
    if(param instanceof Array){
        var res =  $malloc((4 * Array.length|0)>>>0) >> 2;
        param.map(function(x, i){res[i] = x;});
    } else if(typeof param === 'number'){
        var res =  $malloc((4 * param|0)>>>0) >> 2;
    }
    return res;
}
var rest = new Float32Array(9);
console.log(rest);
var rest2 = new Float32Array([1,2,3,4]);
console.log(rest2);
