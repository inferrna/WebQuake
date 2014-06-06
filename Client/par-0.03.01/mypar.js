var fs = require('fs');
var Buffer = require('buffer').Buffer;
var constants = require('constants');

PAK_MAGIC          = "PACK";
PAK_OFFSET_SIZE    = 0x04;    /* == sizeof(off_t) or convers. fails */
PAK_MAGIC_SIZE     = PAK_OFFSET_SIZE;    /* '\0' excluded */
PAK_HDR_SIZE       = (PAK_MAGIC_SIZE+2*PAK_OFFSET_SIZE);
PAK_TOC_ENTRY_SIZE = 0x40;
PAK_TOC_FN_LEN     = 0x38;    /* number of filename bytes in toc */

pak_header = {
  magic: null, //PAK_MAGIC_SIZE+1),
  toc_off:0, //Uint32
  toc_sze:0, //Uint32
  pak_sze:0  //Uint32
};

pak_tocentry = {
  f_nme: null, //PAK_TOC_FN_LEN+1,        /* to be shure */
  f_off: 0, //Uint32
  f_sze: 0  //Uint32
};

pak_tocentries = [];

function read_pak_header(buf){
}

pakbuf = new Uint8Array(fs.readFileSync("/home/inferno/Work/fake-sdcard/id1/PAK0.PAK")).buffer;
pakb8 = new Uint8Array(pakbuf);
dataw = new DataView(pakbuf);
pak_header.magic = pakb8.subarray(0, PAK_MAGIC_SIZE);
pak_header.toc_off = dataw.getUint32(PAK_MAGIC_SIZE);
pak_header.toc_sze = dataw.getUint32(PAK_MAGIC_SIZE+PAK_OFFSET_SIZE);
pak_header.pak_sze = pakbuf.byteLength - PAK_HDR_SIZE;//???????????
noe = pak_header.toc_sze/PAK_TOC_ENTRY_SIZE;   /* number of entries */

console.log(
            "pak_header.toc_off=="+pak_header.toc_off+"\n"+
            "pak_header.toc_sze=="+pak_header.toc_sze+"\n"+
            "pak_header.pak_sze=="+pak_header.pak_sze+"\n"+
            "noe=="+noe+"\n"
        );

//for( j=0; j<noe; j++ )

