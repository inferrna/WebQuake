var tofree = [];
mUint32Arrayp = function(param, off, ln){
    const $M = memory;
    const $malloc = $M.malloc, $U4 = $M.U4;
    if(param instanceof Array || param instanceof Uint8Array || param instanceof Uint16Array || param instanceof Uint32Array ){
        //console.log("new Float32Array called on array "+param.length);
        this._len = param.length;
        this._addr =  $malloc((4 * this._len|0)>>>0) >> 2;
        var res = $U4.subarray(this._addr, this._addr+this._len);
        res.set(param);
    } else if(typeof param === 'number'){
        //console.log("new Float32Array called on number");
        this._len = param;
        this._addr =  $malloc((4 * param|0)>>>0) >> 2;
        var res = $U4.subarray(this._addr, this._addr+this._len);
    } else if(param instanceof ArrayBuffer){
        if(off || ln) var res = new Uint32Array(param, off, ln);
        else          var res = new Uint32Array(param);
    }
    return res;
};
mInt32Arrayp = function(param, off, ln){
    const $M = memory;
    const $malloc = $M.malloc, $I4 = $M.I4;
    if(param instanceof Array || param instanceof Int8Array || param instanceof Int16Array || param instanceof Int32Array ){
        //console.log("new Float32Array called on array "+param.length);
        this._len = param.length;
        this._addr =  $malloc((4 * this._len|0)>>>0) >> 2;
        var res = $I4.subarray(this._addr, this._addr+this._len);
        res.set(param);
    } else if(typeof param === 'number'){
        //console.log("new Float32Array called on number");
        this._len = param;
        this._addr =  $malloc((4 * param|0)>>>0) >> 2;
        var res = $I4.subarray(this._addr, this._addr+this._len);
    } else if(param instanceof ArrayBuffer){
        if(off || ln) var res = new Int32Array(param, off, ln);
        else          var res = new Int32Array(param);
    }
    return res;
};
mUint16Arrayp = function(param, off, ln){
    const $M = memory;
    const $malloc = $M.malloc, $U2 = $M.U2;
    if(param instanceof Array || param instanceof Uint8Array || param instanceof Uint16Array ){
        //console.log("new Float32Array called on array "+param.length);
        this._len = param.length;
        this._addr =  $malloc((2 * this._len|0)>>>0) >> 1;
        var res = $U2.subarray(this._addr, this._addr+this._len);
        res.set(param);
    } else if(typeof param === 'number'){
        //console.log("new Float32Array called on number");
        this._len = param;
        this._addr =  $malloc((2 * param|0)>>>0) >> 1;
        var res = $U2.subarray(this._addr, this._addr+this._len);
    } else if(param instanceof ArrayBuffer){
        if(off || ln) var res = new Uint16Array(param, off, ln);
        else          var res = new Uint16Array(param);
    }
    return res;
};
mUint8Arrayp = function(param, off, ln){
    const $M = memory;
    const $malloc = $M.malloc, $U1 = $M.U1;
    if(param instanceof Array || param instanceof Uint8Array){
        //console.log("new Float32Array called on array "+param.length);
        this._len = param.length;
        this._addr =  $malloc((this._len|0)>>>0);
        var res = $U1.subarray(this._addr, this._addr+this._len);
        res.set(param);
    } else if(typeof param === 'number'){
        //console.log("new Float32Array called on number");
        this._len = param;
        this._addr =  $malloc((param|0)>>>0);
        var res = $U1.subarray(this._addr, this._addr+this._len);
    } else if(param instanceof ArrayBuffer){
        if(off || ln) var res = new Uint8Array(param, off, ln);
        else          var res = new Uint8Array(param);
    }
    return res;
};
mFloat32Arrayp = function(param, off, ln){
    const $M = memory;
    const $malloc = $M.malloc, $F4 = $M.F4;
    if(param instanceof Array || param instanceof Float32Array || param instanceof Float64Array){
        //console.log("new Float32Array called on array "+param.length);
        this._len = param.length;
        this._addr =  $malloc((4 * this._len|0)>>>0) >> 2;
        var res = $F4.subarray(this._addr, this._addr+this._len);
        res.set(param);
    } else if(typeof param === 'number'){
        //console.log("new Float32Array called on number");
        this._len = param;
        this._addr =  $malloc((4 * param|0)>>>0) >> 2;
        var res = $F4.subarray(this._addr, this._addr+this._len);
    } else if(param instanceof ArrayBuffer){
        if(off || ln) var res = new Float32Array(param, off, ln);
        else          var res = new Float32Array(param);
    }
    return res;
};
mUint32Array = function(param, off, ln){
    const $M = memory;
    const $malloc = $M.malloc, $U4 = $M.U4;
    if(param instanceof Array || param instanceof Uint8Array || param instanceof Uint16Array || param instanceof Uint32Array ){
        //console.log("new Float32Array called on array "+param.length);
        this._len = param.length;
        this._addr =  $malloc((4 * this._len|0)>>>0) >> 2;
        var res = $U4.subarray(this._addr, this._addr+this._len);
        res.set(param);
    } else if(typeof param === 'number'){
        //console.log("new Float32Array called on number");
        this._len = param;
        this._addr =  $malloc((4 * param|0)>>>0) >> 2;
        var res = $U4.subarray(this._addr, this._addr+this._len);
    } else if(param instanceof ArrayBuffer){
        if(off || ln) var res = new Uint32Array(param, off, ln);
        else          var res = new Uint32Array(param);
    }
    if(this._addr && mUint32Array.caller) 
        tofree.push(this._addr << 1);
    //console.log(this._addr);
    return res;
};
mInt32Array = function(param, off, ln){
    const $M = memory;
    const $malloc = $M.malloc, $I4 = $M.I4;
    if(param instanceof Array || param instanceof Int8Array || param instanceof Int16Array || param instanceof Int32Array ){
        //console.log("new Float32Array called on array "+param.length);
        this._len = param.length;
        this._addr =  $malloc((4 * this._len|0)>>>0) >> 2;
        var res = $I4.subarray(this._addr, this._addr+this._len);
        res.set(param);
    } else if(typeof param === 'number'){
        //console.log("new Float32Array called on number");
        this._len = param;
        this._addr =  $malloc((4 * param|0)>>>0) >> 2;
        var res = $I4.subarray(this._addr, this._addr+this._len);
    } else if(param instanceof ArrayBuffer){
        if(off || ln) var res = new Int32Array(param, off, ln);
        else          var res = new Int32Array(param);
    }
    if(this._addr && mInt32Array.caller) 
        tofree.push(this._addr << 1);
    //console.log(this._addr);
    return res;
};
mUint16Array = function(param, off, ln){
    const $M = memory;
    const $malloc = $M.malloc, $U2 = $M.U2;
    if(param instanceof Array || param instanceof Uint8Array || param instanceof Uint16Array ){
        //console.log("new Float32Array called on array "+param.length);
        this._len = param.length;
        this._addr =  $malloc((2 * this._len|0)>>>0) >> 1;
        var res = $U2.subarray(this._addr, this._addr+this._len);
        res.set(param);
    } else if(typeof param === 'number'){
        //console.log("new Float32Array called on number");
        this._len = param;
        this._addr =  $malloc((2 * param|0)>>>0) >> 1;
        var res = $U2.subarray(this._addr, this._addr+this._len);
    } else if(param instanceof ArrayBuffer){
        if(off || ln) var res = new Uint16Array(param, off, ln);
        else          var res = new Uint16Array(param);
    }
    if(this._addr && mUint16Array.caller) 
        tofree.push(this._addr << 1);
    //console.log(this._addr);
    return res;
};
mUint8Array = function(param, off, ln){
    const $M = memory;
    const $malloc = $M.malloc, $U1 = $M.U1;
    if(param instanceof Array || param instanceof Uint8Array){
        //console.log("new Float32Array called on array "+param.length);
        this._len = param.length;
        this._addr =  $malloc((this._len|0)>>>0);
        var res = $U1.subarray(this._addr, this._addr+this._len);
        res.set(param);
    } else if(typeof param === 'number'){
        //console.log("new Float32Array called on number");
        this._len = param;
        this._addr =  $malloc((param|0)>>>0);
        var res = $U1.subarray(this._addr, this._addr+this._len);
    } else if(param instanceof ArrayBuffer){
        if(off || ln) var res = new Uint8Array(param, off, ln);
        else          var res = new Uint8Array(param);
    }
    if(this._addr && mUint8Array.caller) 
        tofree.push(this._addr);
    //console.log(this._addr);
    return res;
};
mFloat32Array = function(param, off, ln){
    const $M = memory;
    const $malloc = $M.malloc, $F4 = $M.F4;
    if(param instanceof Array || param instanceof Float32Array || param instanceof Float64Array){
        //console.log("new Float32Array called on array "+param.length);
        this._len = param.length;
        this._addr =  $malloc((4 * this._len|0)>>>0) >> 2;
        var res = $F4.subarray(this._addr, this._addr+this._len);
        res.set(param);
    } else if(typeof param === 'number'){
        //console.log("new Float32Array called on number");
        this._len = param;
        this._addr =  $malloc((4 * param|0)>>>0) >> 2;
        var res = $F4.subarray(this._addr, this._addr+this._len);
    } else if(param instanceof ArrayBuffer){
        if(off || ln) var res = new Float32Array(param, off, ln);
        else          var res = new Float32Array(param);
    }
    if(this._addr && mFloat32Array.caller) 
        tofree.push(this._addr << 2);
    //console.log(this._addr);
    return res;
};
mfree = function(array){
    $free(array.byteOffset);
};

freetofree = function(){
   const $M = memory;
   const $free = $M.free;
 //  console.log("call to freetofree. To free "+tofree.length+" total arrays.");//NFP
   for(var i=0; i<tofree.length; i++)
       $free(tofree[i])
   tofree = [];
};
