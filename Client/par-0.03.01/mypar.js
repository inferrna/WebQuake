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
  'magic': new ArrayBuffer(PAK_MAGIC_SIZE+1),
  'toc_off':0,
  'toc_sze':0,
  'pak_sze':0
};

pak_tocentry = {
  'f_nme':new ArrayBuffer(PAK_TOC_FN_LEN+1),        /* to be shure */
  'f_off':0,
  'f_sze':0
};

buffer = fs.readFileSync("pak0.pak");
function read_pak_header(buf){
}

function my_read(buf, nbtr, 

