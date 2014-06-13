var MM = {};
MM.Init = function(bytes){
    MM.HS = bytes;
    MM.HEAP = new ArrayBuffer(MM.HS);
    MM.HEAP8U = new Uint8Array(MM.HEAP);
    MM.HEAP16U = new Uint16Array(MM.HEAP);
    MM.HEAP32U = new Uint32Array(MM.HEAP);
    MM.HEAP8S = new Int8Array(MM.HEAP);
    MM.HEAP16S = new Int16Array(MM.HEAP);
    MM.HEAP32S = new Int32Array(MM.HEAP);
    MM.HEAP32F = new Float32Array(MM.HEAP);
    MM.HEAP64F = new Float64Array(MM.HEAP);
};
MM.arrays = [];
MM.freeidx = [];
MM.end = 0;
//Shift in bytes
MM.Shift = function(start, end, length){
    var diff = start - end;
    var newarr = new Uint8Array(MM.HEAP, start, length);
    newarr.set(new Uint8Array(MM.HEAP, end, length));
    for(var i=0; i<MM.arrays.length; i++){
        var arr = MM.arrays[i];
        if(arr.byteOffset>=start && arr.byteOffset<start+length)
            MM.arrays[i] = new arr.__proto__.constructor(MM.HEAP, arr.byteOffset - diff, arr.length);
    }
};

MM.Free = function(index){
    MM.freeidx.push(index); //Reserve as free index
    var arr = MM.arrays[index]; 
    var start = arr.byteOffset;
    var end = start + arr.byteLength;
    var length = MM.HS - end;
    MM.Shift(start, end, length); //Shift to compact heap
};

MM.Alloc = function(length, constructor){
    var bpe = constructor.BYTES_PER_ELEMENT;
    if(MM.freeidx.length) var idx = MM.freeidx.pop();
    else var idx = MM.arrays.length;
    MM.arrays[idx] = new constructor(MM.HEAP, MM.end, length);
    MM.end += ((length*bpe + 7)>>3)<<3; //Rearrange by 8 for access from inside asm.js code
};
