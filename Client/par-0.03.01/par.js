// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = (typeof Module !== 'undefined' ? Module : null) || {};

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  if (!Module['print']) Module['print'] = function print(x) {
    process['stdout'].write(x + '\n');
  };
  if (!Module['printErr']) Module['printErr'] = function printErr(x) {
    process['stderr'].write(x + '\n');
  };

  var nodeFS = require('fs');
  var nodePath = require('path');

  Module['read'] = function read(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };

  Module['readBinary'] = function readBinary(filename) { return Module['read'](filename, true) };

  Module['load'] = function load(f) {
    globalEval(read(f));
  };

  Module['arguments'] = process['argv'].slice(2);

  module['exports'] = Module;
}
else if (ENVIRONMENT_IS_SHELL) {
  if (!Module['print']) Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm

  if (typeof read != 'undefined') {
    Module['read'] = read;
  } else {
    Module['read'] = function read() { throw 'no read() available (jsc?)' };
  }

  Module['readBinary'] = function readBinary(f) {
    return read(f, 'binary');
  };

  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  this['Module'] = Module;

  eval("if (typeof gc === 'function' && gc.toString().indexOf('[native code]') > 0) var gc = undefined"); // wipe out the SpiderMonkey shell 'gc' function, which can confuse closure (uses it as a minified name, and it is then initted to a non-falsey value unexpectedly)
}
else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function read(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };

  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }

  if (typeof console !== 'undefined') {
    if (!Module['print']) Module['print'] = function print(x) {
      console.log(x);
    };
    if (!Module['printErr']) Module['printErr'] = function printErr(x) {
      console.log(x);
    };
  } else {
    // Probably a worker, and without console.log. We can do very little here...
    var TRY_USE_DUMP = false;
    if (!Module['print']) Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
      dump(x);
    }) : (function(x) {
      // self.postMessage(x); // enable this if you want stdout to be sent as messages
    }));
  }

  if (ENVIRONMENT_IS_WEB) {
    window['Module'] = Module;
  } else {
    Module['load'] = importScripts;
  }
}
else {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}

function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function load(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***

// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];

// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];

// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}



// === Auto-generated preamble library stuff ===

//========================================
// Runtime code shared with compiler
//========================================

var Runtime = {
  setTempRet0: function (value) {
    tempRet0 = value;
  },
  getTempRet0: function () {
    return tempRet0;
  },
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      return '(((' +target + ')+' + (quantum-1) + ')&' + -quantum + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?\{ ?[^}]* ?\}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type) {
    switch (type) {
      case 'i1': case 'i8': return 1;
      case 'i16': return 2;
      case 'i32': return 4;
      case 'i64': return 8;
      case 'float': return 4;
      case 'double': return 8;
      default: {
        if (type[type.length-1] === '*') {
          return Runtime.QUANTUM_SIZE; // A pointer
        } else if (type[0] === 'i') {
          var bits = parseInt(type.substr(1));
          assert(bits % 8 === 0);
          return bits/8;
        } else {
          return 0;
        }
      }
    }
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (!vararg && (type == 'i64' || type == 'double')) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          if (Types.types[field]) {
            alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
          } else {
            alignSize = type.alignSize || QUANTUM_SIZE;
          }
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else if (field[0] === '<') {
        // vector type
        size = alignSize = Types.types[field].flatSize; // fully aligned
      } else if (field[0] === 'i') {
        // illegal integer field, that could not be legalized because it is an internal structure field
        // it is ok to have such fields, if we just use them as markers of field size and nothing more complex
        size = alignSize = parseInt(field.substr(1))/8;
        assert(size % 1 === 0, 'cannot handle non-byte-size field ' + field);
      } else {
        assert(false, 'invalid type for calculateStructAlignment');
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    if (type.name_ && type.name_[0] === '[') {
      // arrays have 2 elements, so we get the proper difference. then we scale here. that way we avoid
      // allocating a potentially huge array for [999999 x i8] etc.
      type.flatSize = parseInt(type.name_.substr(1))*type.flatSize/2;
    }
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2*(1 + i);
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  getAsmConst: function (code, numArgs) {
    // code is a constant string on the heap, so we can cache these
    if (!Runtime.asmConstCache) Runtime.asmConstCache = {};
    var func = Runtime.asmConstCache[code];
    if (func) return func;
    var args = [];
    for (var i = 0; i < numArgs; i++) {
      args.push(String.fromCharCode(36) + i); // $0, $1 etc
    }
    var source = Pointer_stringify(code);
    if (source[0] === '"') {
      // tolerate EM_ASM("..code..") even though EM_ASM(..code..) is correct
      if (source.indexOf('"', 1) === source.length-1) {
        source = source.substr(1, source.length-2);
      } else {
        // something invalid happened, e.g. EM_ASM("..code($0)..", input)
        abort('invalid EM_ASM input |' + source + '|. Please use EM_ASM(..code..) (no quotes) or EM_ASM({ ..code($0).. }, input) (to input values)');
      }
    }
    try {
      var evalled = eval('(function(' + args.join(',') + '){ ' + source + ' })'); // new Function does not allow upvars in node
    } catch(e) {
      Module.printErr('error in executing inline EM_ASM code: ' + e + ' on: \n\n' + source + '\n\nwith args |' + args + '| (make sure to use the right one out of EM_ASM, EM_ASM_ARGS, etc.)');
      throw e;
    }
    return Runtime.asmConstCache[code] = evalled;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function dynCall_wrapper() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xFF;

      if (buffer.length == 0) {
        if ((code & 0x80) == 0x00) {        // 0xxxxxxx
          return String.fromCharCode(code);
        }
        buffer.push(code);
        if ((code & 0xE0) == 0xC0) {        // 110xxxxx
          needed = 1;
        } else if ((code & 0xF0) == 0xE0) { // 1110xxxx
          needed = 2;
        } else {                            // 11110xxx
          needed = 3;
        }
        return '';
      }

      if (needed) {
        buffer.push(code);
        needed--;
        if (needed > 0) return '';
      }

      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var c4 = buffer[3];
      var ret;
      if (buffer.length == 2) {
        ret = String.fromCharCode(((c1 & 0x1F) << 6)  | (c2 & 0x3F));
      } else if (buffer.length == 3) {
        ret = String.fromCharCode(((c1 & 0x0F) << 12) | ((c2 & 0x3F) << 6)  | (c3 & 0x3F));
      } else {
        // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        var codePoint = ((c1 & 0x07) << 18) | ((c2 & 0x3F) << 12) |
                        ((c3 & 0x3F) << 6)  | (c4 & 0x3F);
        ret = String.fromCharCode(
          Math.floor((codePoint - 0x10000) / 0x400) + 0xD800,
          (codePoint - 0x10000) % 0x400 + 0xDC00);
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function processJSString(string) {
      /* TODO: use TextEncoder when present,
        var encoder = new TextEncoder();
        encoder['encoding'] = "utf-8";
        var utf8Array = encoder['encode'](aMsg.data);
      */
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  getCompilerSetting: function (name) {
    throw 'You must build with -s RETAIN_COMPILER_SETTINGS=1 for Runtime.getCompilerSetting or emscripten_get_compiler_setting to work';
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = (((STACKTOP)+7)&-8); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = (((STATICTOP)+7)&-8); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = (((DYNAMICTOP)+7)&-8); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+((low>>>0)))+((+((high>>>0)))*(+4294967296))) : ((+((low>>>0)))+((+((high|0)))*(+4294967296)))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}


Module['Runtime'] = Runtime;









//========================================
// Runtime essentials
//========================================

var __THREW__ = 0; // Used in checking for thrown exceptions.

var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var EXITSTATUS = 0;

var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD, tempDouble, tempFloat;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;

function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

var globalScope = this;

// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}

// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      value = intArrayFromString(value);
      type = 'array';
    }
    if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}

// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;

// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[((ptr)>>0)]=value; break;
      case 'i8': HEAP8[((ptr)>>0)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= (+1) ? (tempDouble > (+0) ? ((Math_min((+(Math_floor((tempDouble)/(+4294967296)))), (+4294967295)))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/(+4294967296))))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;

// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)>>0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}
Module['allocate'] = allocate;

function Pointer_stringify(ptr, /* optional */ length) {
  // TODO: use TextDecoder
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))>>0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;

  var ret = '';

  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }

  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))>>0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;

// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF16ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
    if (codeUnit == 0)
      return str;
    ++i;
    // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
    str += String.fromCharCode(codeUnit);
  }
}
Module['UTF16ToString'] = UTF16ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16LE form. The copy will require at most (str.length*2+1)*2 bytes of space in the HEAP.
function stringToUTF16(str, outPtr) {
  for(var i = 0; i < str.length; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[(((outPtr)+(i*2))>>1)]=codeUnit;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[(((outPtr)+(str.length*2))>>1)]=0;
}
Module['stringToUTF16'] = stringToUTF16;

// Given a pointer 'ptr' to a null-terminated UTF32LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.
function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}
Module['UTF32ToString'] = UTF32ToString;

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32LE form. The copy will require at most (str.length+1)*4 bytes of space in the HEAP,
// but can use less, since str.length does not return the number of characters in the string, but the number of UTF-16 code units in the string.
function stringToUTF32(str, outPtr) {
  var iChar = 0;
  for(var iCodeUnit = 0; iCodeUnit < str.length; ++iCodeUnit) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    var codeUnit = str.charCodeAt(iCodeUnit); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++iCodeUnit);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[(((outPtr)+(iChar*4))>>2)]=codeUnit;
    ++iChar;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[(((outPtr)+(iChar*4))>>2)]=0;
}
Module['stringToUTF32'] = stringToUTF32;

function demangle(func) {
  var i = 3;
  // params, etc.
  var basicTypes = {
    'v': 'void',
    'b': 'bool',
    'c': 'char',
    's': 'short',
    'i': 'int',
    'l': 'long',
    'f': 'float',
    'd': 'double',
    'w': 'wchar_t',
    'a': 'signed char',
    'h': 'unsigned char',
    't': 'unsigned short',
    'j': 'unsigned int',
    'm': 'unsigned long',
    'x': 'long long',
    'y': 'unsigned long long',
    'z': '...'
  };
  var subs = [];
  var first = true;
  function dump(x) {
    //return;
    if (x) Module.print(x);
    Module.print(func);
    var pre = '';
    for (var a = 0; a < i; a++) pre += ' ';
    Module.print (pre + '^');
  }
  function parseNested() {
    i++;
    if (func[i] === 'K') i++; // ignore const
    var parts = [];
    while (func[i] !== 'E') {
      if (func[i] === 'S') { // substitution
        i++;
        var next = func.indexOf('_', i);
        var num = func.substring(i, next) || 0;
        parts.push(subs[num] || '?');
        i = next+1;
        continue;
      }
      if (func[i] === 'C') { // constructor
        parts.push(parts[parts.length-1]);
        i += 2;
        continue;
      }
      var size = parseInt(func.substr(i));
      var pre = size.toString().length;
      if (!size || !pre) { i--; break; } // counter i++ below us
      var curr = func.substr(i + pre, size);
      parts.push(curr);
      subs.push(curr);
      i += pre + size;
    }
    i++; // skip E
    return parts;
  }
  function parse(rawList, limit, allowVoid) { // main parser
    limit = limit || Infinity;
    var ret = '', list = [];
    function flushList() {
      return '(' + list.join(', ') + ')';
    }
    var name;
    if (func[i] === 'N') {
      // namespaced N-E
      name = parseNested().join('::');
      limit--;
      if (limit === 0) return rawList ? [name] : name;
    } else {
      // not namespaced
      if (func[i] === 'K' || (first && func[i] === 'L')) i++; // ignore const and first 'L'
      var size = parseInt(func.substr(i));
      if (size) {
        var pre = size.toString().length;
        name = func.substr(i + pre, size);
        i += pre + size;
      }
    }
    first = false;
    if (func[i] === 'I') {
      i++;
      var iList = parse(true);
      var iRet = parse(true, 1, true);
      ret += iRet[0] + ' ' + name + '<' + iList.join(', ') + '>';
    } else {
      ret = name;
    }
    paramLoop: while (i < func.length && limit-- > 0) {
      //dump('paramLoop');
      var c = func[i++];
      if (c in basicTypes) {
        list.push(basicTypes[c]);
      } else {
        switch (c) {
          case 'P': list.push(parse(true, 1, true)[0] + '*'); break; // pointer
          case 'R': list.push(parse(true, 1, true)[0] + '&'); break; // reference
          case 'L': { // literal
            i++; // skip basic type
            var end = func.indexOf('E', i);
            var size = end - i;
            list.push(func.substr(i, size));
            i += size + 2; // size + 'EE'
            break;
          }
          case 'A': { // array
            var size = parseInt(func.substr(i));
            i += size.toString().length;
            if (func[i] !== '_') throw '?';
            i++; // skip _
            list.push(parse(true, 1, true)[0] + ' [' + size + ']');
            break;
          }
          case 'E': break paramLoop;
          default: ret += '?' + c; break paramLoop;
        }
      }
    }
    if (!allowVoid && list.length === 1 && list[0] === 'void') list = []; // avoid (void)
    if (rawList) {
      if (ret) {
        list.push(ret + '?');
      }
      return list;
    } else {
      return ret + flushList();
    }
  }
  try {
    // Special-case the entry point, since its name differs from other name mangling.
    if (func == 'Object._main' || func == '_main') {
      return 'main()';
    }
    if (typeof func === 'number') func = Pointer_stringify(func);
    if (func[0] !== '_') return func;
    if (func[1] !== '_') return func; // C function
    if (func[2] !== 'Z') return func;
    switch (func[3]) {
      case 'n': return 'operator new()';
      case 'd': return 'operator delete()';
    }
    return parse();
  } catch(e) {
    return func;
  }
}

function demangleAll(text) {
  return text.replace(/__Z[\w\d_]+/g, function(x) { var y = demangle(x); return x === y ? x : (x + ' [' + y + ']') });
}

function stackTrace() {
  var stack = new Error().stack;
  return stack ? demangleAll(stack) : '(no stack trace available)'; // Stack trace is not available at least on IE10 and Safari 6.
}

// Memory management

var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return (x+4095)&-4096;
}

var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk

function enlargeMemory() {
  abort('Cannot enlarge memory arrays. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value ' + TOTAL_MEMORY + ', (2) compile with ALLOW_MEMORY_GROWTH which adjusts the size at runtime but prevents some optimizations, or (3) set Module.TOTAL_MEMORY before the program runs.');
}

var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;

var totalMemory = 4096;
while (totalMemory < TOTAL_MEMORY || totalMemory < 2*TOTAL_STACK) {
  if (totalMemory < 16*1024*1024) {
    totalMemory *= 2;
  } else {
    totalMemory += 16*1024*1024
  }
}
if (totalMemory !== TOTAL_MEMORY) {
  Module.printErr('increasing TOTAL_MEMORY to ' + totalMemory + ' to be more reasonable');
  TOTAL_MEMORY = totalMemory;
}

// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(typeof Int32Array !== 'undefined' && typeof Float64Array !== 'undefined' && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'JS engine does not provide full typed array support');

var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);

// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');

Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;

function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited

var runtimeInitialized = false;

function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}

function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;

function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;

// Tools

// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;

// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))>>0)]=chr;
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;

function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))>>0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; i++) {
    HEAP8[(((buffer)+(i))>>0)]=str.charCodeAt(i);
  }
  if (!dontAddNull) HEAP8[(((buffer)+(str.length))>>0)]=0;
}
Module['writeAsciiToMemory'] = writeAsciiToMemory;

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}

// check for imul support, and also for correctness ( https://bugs.webkit.org/show_bug.cgi?id=126345 )
if (!Math['imul'] || Math['imul'](0xffffffff, 5) !== -5) Math['imul'] = function imul(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];


var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_min = Math.min;

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}
Module['removeRunDependency'] = removeRunDependency;

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


var memoryInitializer = null;

// === Body ===





STATIC_BASE = 8;

STATICTOP = STATIC_BASE + Runtime.alignMemory(3027);
/* global initializers */ __ATINIT__.push();


/* memory initializer */ allocate([37,115,32,118,37,115,32,40,37,115,41,58,32,0,0,0,48,46,48,51,46,48,49,0,50,48,48,52,45,48,56,45,48,54,0,0,0,0,0,0,81,117,97,107,101,32,80,97,107,32,65,82,99,104,105,118,105,110,103,32,117,116,105,108,105,116,121,46,10,0,0,0,70,108,111,119,101,114,115,32,38,32,98,117,103,32,114,101,112,111,114,116,115,32,116,111,32,37,115,46,10,0,0,0,83,116,101,102,102,101,110,32,83,111,108,121,103,97,32,60,115,111,108,121,103,97,64,97,98,115,105,110,116,104,46,110,101,116,62,0,0,0,0,0,85,115,97,103,101,58,32,37,115,32,111,112,116,105,111,110,115,32,97,114,99,104,105,118,101,32,91,102,105,108,101,115,93,10,0,0,0,0,0,0,115,119,105,116,99,104,101,115,58,10,0,0,0,0,0,0,32,32,45,99,9,32,99,114,101,97,116,101,32,110,101,119,32,112,97,107,32,97,114,99,104,105,118,101,10,0,0,0,32,32,45,102,9,32,102,111,114,99,101,32,97,99,116,105,111,110,115,10,0,0,0,0,32,32,45,104,9,32,119,114,105,116,101,32,116,104,105,115,32,105,110,102,111,32,116,111,32,37,115,32,97,110,100,32,101,120,105,116,32,115,117,99,101,115,115,102,117,108,108,121,10,0,0,0,0,0,0,0,115,116,100,111,117,116,0,0,32,32,45,108,9,32,108,105,115,116,32,99,111,110,116,101,110,116,115,32,111,102,32,112,97,107,32,97,114,99,104,105,118,101,10,0,0,0,0,0,32,32,45,116,9,32,102,105,108,101,115,32,33,33,99,111,110,116,97,105,110,33,33,32,116,104,101,32,110,97,109,101,115,32,111,102,32,116,104,101,32,102,105,108,101,115,32,116,111,32,112,114,111,99,101,115,115,10,0,0,0,0,0,0,32,32,45,118,9,32,98,101,32,118,101,114,98,111,115,101,10,0,0,0,0,0,0,0,32,32,45,120,9,32,101,120,116,114,97,99,116,32,102,105,108,101,115,32,102,114,111,109,32,97,114,99,104,105,118,101,10,0,0,0,0,0,0,0,32,32,45,86,9,32,112,114,105,110,116,32,118,101,114,115,105,111,110,32,97,110,100,32,99,111,109,112,105,108,97,116,105,111,110,32,105,110,102,111,32,116,111,32,37,115,32,97,110,100,32,101,120,105,116,32,115,117,99,101,115,115,102,117,108,108,121,10,0,0,0,0,72,105,110,116,58,32,37,115,32,100,111,101,115,110,39,116,32,119,111,114,107,32,119,105,116,104,32,115,116,100,105,110,47,115,116,100,111,117,116,46,10,0,0,0,0,0,0,0,37,115,32,118,37,115,32,40,37,115,41,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,115,58,32,67,97,110,110,111,116,32,111,112,101,110,32,96,37,115,39,32,102,111,114,32,37,115,46,32,37,115,46,10,0,0,0,0,0,0,0,114,101,97,100,105,110,103,0,119,114,105,116,105,110,103,0,114,101,97,100,45,119,114,105,116,101,0,0,0,0,0,0,37,115,58,32,67,111,117,108,100,32,110,111,116,32,99,108,111,115,101,32,96,37,115,39,32,115,117,99,99,101,115,115,102,117,108,108,121,46,32,37,115,46,10,0,0,0,0,0,37,115,58,32,67,97,110,110,111,116,32,108,115,101,101,107,32,96,37,115,39,46,32,37,115,46,10,0,0,0,0,0,37,115,58,32,67,97,110,110,111,116,32,114,101,97,100,32,102,114,111,109,32,96,37,115,39,46,32,37,115,46,10,0,37,115,58,32,67,97,110,110,111,116,32,119,114,105,116,101,32,116,111,32,96,37,115,39,46,32,37,115,46,10,0,0,37,115,58,32,67,97,110,110,111,116,32,119,114,105,116,101,32,40,37,100,32,98,121,116,101,115,41,32,116,111,32,96,37,115,39,46,10,0,0,0,37,115,58,32,67,97,110,110,111,116,32,109,97,107,101,32,100,105,114,101,99,116,111,114,121,32,96,37,115,39,46,32,37,115,46,10,0,0,0,0,80,65,67,75,0,0,0,0,37,115,58,32,70,105,108,101,32,96,37,115,39,32,105,115,32,110,111,116,32,97,32,112,97,107,32,97,114,99,104,105,118,101,46,32,70,105,108,101,32,116,111,111,32,115,109,97,108,108,46,10,0,0,0,0,37,115,58,32,70,105,108,101,32,96,37,115,39,32,105,115,32,110,111,116,32,97,32,112,97,107,32,97,114,99,104,105,118,101,46,32,37,115,46,10,0,0,0,0,0,0,0,0,87,114,111,110,103,32,109,97,103,105,99,32,110,117,109,98,101,114,0,0,0,0,0,0,37,115,58,32,80,97,107,32,97,114,99,104,105,118,101,32,96,37,115,39,32,99,111,114,114,117,112,116,101,100,46,32,84,111,99,32,111,102,102,115,101,116,32,61,32,37,100,46,10,0,0,0,0,0,0,0,37,115,58,32,80,97,107,32,97,114,99,104,105,118,101,32,96,37,115,39,32,99,111,114,114,117,112,116,101,100,46,32,84,111,99,32,115,105,122,101,32,61,32,37,100,46,10,0,37,115,58,32,80,97,107,32,97,114,99,104,105,118,101,32,96,37,115,39,32,99,111,114,114,117,112,116,101,100,46,32,37,115,46,10,0,0,0,0,80,97,107,32,102,105,108,101,32,115,105,122,101,32,33,61,32,116,111,99,32,111,102,102,115,101,116,32,43,32,116,111,99,32,115,105,122,101,0,0,37,115,58,32,80,97,107,32,97,114,99,104,105,118,101,32,96,37,115,39,32,99,111,114,114,117,112,116,101,100,46,32,37,51,46,50,102,32,116,111,99,32,101,110,116,114,105,101,115,46,10,0,0,0,0,0,0,0,0,0,0,0,0,0,37,115,58,32,65,108,108,111,99,97,116,105,111,110,32,112,114,111,98,108,101,109,115,32,40,37,100,32,98,121,116,101,115,41,46,10,0,0,0,0,70,105,108,101,32,116,111,111,32,115,109,97,108,108,0,0,37,115,58,32,80,97,107,32,97,114,99,104,105,118,101,32,96,37,115,39,32,99,111,114,114,117,112,116,101,100,32,40,116,111,99,32,101,110,116,114,121,32,37,100,41,46,10,0,0,0,0,0,0,0,0,0,37,115,58,32,65,108,108,111,99,97,116,105,111,110,32,112,114,111,98,108,101,109,32,40,37,100,32,98,121,116,101,115,41,46,10,0,0,0,0,0,37,115,0,0,0,0,0,0,37,56,100,0,0,0,0,0,37,115,58,32,70,105,108,101,32,96,37,115,39,32,110,111,116,32,102,111,117,110,100,32,105,110,32,97,114,99,104,105,118,101,46,10,0,0,0,0,83,117,109,109,97,114,121,32,102,111,114,32,112,97,107,32,97,114,99,104,105,118,101,32,96,37,115,39,58,32,10,0,32,32,76,105,115,116,101,100,58,32,37,100,32,102,105,108,101,37,115,44,32,37,100,32,98,121,116,101,115,10,0,0,115,0,0,0,0,0,0,0,32,32,32,84,111,116,97,108,58,32,37,100,32,102,105,108,101,37,115,44,32,37,100,32,98,121,116,101,115,10,0,0,37,115,44,32,37,100,32,98,121,116,101,115,10,0,0,0,70,105,108,101,32,116,111,111,32,115,109,97,108,108,46,0,32,32,69,120,116,114,97,99,116,101,100,58,32,37,100,32,102,105,108,101,37,115,44,32,37,100,32,98,121,116,101,115,10,0,0,0,0,0,0,0,32,32,32,32,32,32,84,111,116,97,108,58,32,37,100,32,102,105,108,101,37,115,44,32,37,100,32,98,121,116,101,115,10,0,0,0,0,0,0,0,37,115,58,32,67,97,110,110,111,116,32,114,101,97,100,32,102,114,111,109,32,102,105,108,101,32,96,37,115,39,46,32,37,115,46,10,0,0,0,0,99,102,104,108,116,118,120,86,0,0,0,0,0,0,0,0,37,115,58,32,84,119,111,32,97,99,116,105,111,110,115,32,115,112,101,99,105,102,105,101,100,46,32,84,114,121,32,45,104,32,102,111,114,32,104,101,108,112,46,10,0,0,0,0,37,115,58,32,84,114,121,32,96,37,115,32,45,104,39,32,102,111,114,32,109,111,114,101,32,105,110,102,111,114,109,97,116,105,111,110,46,10,0,0,37,115,58,32,79,112,116,105,111,110,115,32,98,117,103,33,32,69,45,109,97,105,108,32,109,101,32,97,116,32,37,115,46,10,0,0,0,0,0,0,37,115,58,32,78,111,32,97,99,116,105,111,110,32,115,112,101,99,105,102,105,101,100,46,32,84,114,121,32,45,104,32,102,111,114,32,104,101,108,112,46,10,0,0,0,0,0,0,37,115,58,32,78,111,32,97,114,99,104,105,118,101,32,115,112,101,99,105,102,105,101,100,46,10,0,0,0,0,0,0,37,115,58,32,70,105,108,101,32,110,97,109,101,32,96,37,115,39,32,102,114,111,109,32,102,105,108,101,32,96,37,115,39,32,116,111,111,32,108,111,110,103,46,10,0,0,0,0,37,115,58,32,65,108,108,111,99,97,116,105,111,110,32,112,114,111,98,108,101,109,46,10,0,0,0,0,0,0,0,0,37,115,58,32,70,105,108,101,32,110,97,109,101,32,96,37,115,39,32,116,111,111,32,108,111,110,103,46,10,0,0,0,37,115,58,32,65,99,116,105,111,110,32,37,100,32,117,110,107,110,111,119,110,33,32,69,45,109,97,105,108,32,109,101,32,97,116,32,37,115,46,10,0,0,0,0,0,0,0,0,114,109,32,45,102,32,37,115,0,0,0,0,0,0,0,0,112,97,114,0,0,0,0,0,45,120,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,58,32,105,108,108,101,103,97,108,32,111,112,116,105,111,110,58,32,0,0,0,0,0,0,10,0,0,0,0,0,0,0,58,32,111,112,116,105,111,110,32,114,101,113,117,105,114,101,115,32,97,110,32,97,114,103,117,109,101,110,116,58,32,0,0,0,0,0,0,0,0,0,2,0,0,192,3,0,0,192,4,0,0,192,5,0,0,192,6,0,0,192,7,0,0,192,8,0,0,192,9,0,0,192,10,0,0,192,11,0,0,192,12,0,0,192,13,0,0,192,14,0,0,192,15,0,0,192,16,0,0,192,17,0,0,192,18,0,0,192,19,0,0,192,20,0,0,192,21,0,0,192,22,0,0,192,23,0,0,192,24,0,0,192,25,0,0,192,26,0,0,192,27,0,0,192,28,0,0,192,29,0,0,192,30,0,0,192,31,0,0,192,0,0,0,179,1,0,0,195,2,0,0,195,3,0,0,195,4,0,0,195,5,0,0,195,6,0,0,195,7,0,0,195,8,0,0,195,9,0,0,195,10,0,0,195,11,0,0,195,12,0,0,195,13,0,0,211,14,0,0,195,15,0,0,195,0,0,12,187,1,0,12,195,2,0,12,195,3,0,12,195,4,0,12,211,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE);




var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);

assert(tempDoublePtr % 8 == 0);

function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

}

function copyTempDouble(ptr) {

  HEAP8[tempDoublePtr] = HEAP8[ptr];

  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];

  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];

  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];

  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];

  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];

  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];

  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];

}


  
  
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:42,EIDRM:43,ECHRNG:44,EL2NSYNC:45,EL3HLT:46,EL3RST:47,ELNRNG:48,EUNATCH:49,ENOCSI:50,EL2HLT:51,EDEADLK:35,ENOLCK:37,EBADE:52,EBADR:53,EXFULL:54,ENOANO:55,EBADRQC:56,EBADSLT:57,EDEADLOCK:35,EBFONT:59,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:72,EDOTDOT:73,EBADMSG:74,ENOTUNIQ:76,EBADFD:77,EREMCHG:78,ELIBACC:79,ELIBBAD:80,ELIBSCN:81,ELIBMAX:82,ELIBEXEC:83,ENOSYS:38,ENOTEMPTY:39,ENAMETOOLONG:36,ELOOP:40,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:97,EPROTOTYPE:91,ENOTSOCK:88,ENOPROTOOPT:92,ESHUTDOWN:108,ECONNREFUSED:111,EADDRINUSE:98,ECONNABORTED:103,ENETUNREACH:101,ENETDOWN:100,ETIMEDOUT:110,EHOSTDOWN:112,EHOSTUNREACH:113,EINPROGRESS:115,EALREADY:114,EDESTADDRREQ:89,EMSGSIZE:90,EPROTONOSUPPORT:93,ESOCKTNOSUPPORT:94,EADDRNOTAVAIL:99,ENETRESET:102,EISCONN:106,ENOTCONN:107,ETOOMANYREFS:109,EUSERS:87,EDQUOT:122,ESTALE:116,ENOTSUP:95,ENOMEDIUM:123,EILSEQ:84,EOVERFLOW:75,ECANCELED:125,ENOTRECOVERABLE:131,EOWNERDEAD:130,ESTRPIPE:86};
  
  var ERRNO_MESSAGES={0:"Success",1:"Not super-user",2:"No such file or directory",3:"No such process",4:"Interrupted system call",5:"I/O error",6:"No such device or address",7:"Arg list too long",8:"Exec format error",9:"Bad file number",10:"No children",11:"No more processes",12:"Not enough core",13:"Permission denied",14:"Bad address",15:"Block device required",16:"Mount device busy",17:"File exists",18:"Cross-device link",19:"No such device",20:"Not a directory",21:"Is a directory",22:"Invalid argument",23:"Too many open files in system",24:"Too many open files",25:"Not a typewriter",26:"Text file busy",27:"File too large",28:"No space left on device",29:"Illegal seek",30:"Read only file system",31:"Too many links",32:"Broken pipe",33:"Math arg out of domain of func",34:"Math result not representable",35:"File locking deadlock error",36:"File or path name too long",37:"No record locks available",38:"Function not implemented",39:"Directory not empty",40:"Too many symbolic links",42:"No message of desired type",43:"Identifier removed",44:"Channel number out of range",45:"Level 2 not synchronized",46:"Level 3 halted",47:"Level 3 reset",48:"Link number out of range",49:"Protocol driver not attached",50:"No CSI structure available",51:"Level 2 halted",52:"Invalid exchange",53:"Invalid request descriptor",54:"Exchange full",55:"No anode",56:"Invalid request code",57:"Invalid slot",59:"Bad font file fmt",60:"Device not a stream",61:"No data (for no delay io)",62:"Timer expired",63:"Out of streams resources",64:"Machine is not on the network",65:"Package not installed",66:"The object is remote",67:"The link has been severed",68:"Advertise error",69:"Srmount error",70:"Communication error on send",71:"Protocol error",72:"Multihop attempted",73:"Cross mount point (not really error)",74:"Trying to read unreadable message",75:"Value too large for defined data type",76:"Given log. name not unique",77:"f.d. invalid for this operation",78:"Remote address changed",79:"Can   access a needed shared lib",80:"Accessing a corrupted shared lib",81:".lib section in a.out corrupted",82:"Attempting to link in too many libs",83:"Attempting to exec a shared library",84:"Illegal byte sequence",86:"Streams pipe error",87:"Too many users",88:"Socket operation on non-socket",89:"Destination address required",90:"Message too long",91:"Protocol wrong type for socket",92:"Protocol not available",93:"Unknown protocol",94:"Socket type not supported",95:"Not supported",96:"Protocol family not supported",97:"Address family not supported by protocol family",98:"Address already in use",99:"Address not available",100:"Network interface is not configured",101:"Network is unreachable",102:"Connection reset by network",103:"Connection aborted",104:"Connection reset by peer",105:"No buffer space available",106:"Socket is already connected",107:"Socket is not connected",108:"Can't send after socket shutdown",109:"Too many references",110:"Connection timed out",111:"Connection refused",112:"Host is down",113:"Host is unreachable",114:"Socket already connected",115:"Connection already in progress",116:"Stale file handle",122:"Quota exceeded",123:"No medium (in tape drive)",125:"Operation canceled",130:"Previous owner died",131:"State not recoverable"};
  
  
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value;
      return value;
    }
  
  var PATH={splitPath:function (filename) {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },normalizeArray:function (parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }
        return parts;
      },normalize:function (path) {
        var isAbsolute = path.charAt(0) === '/',
            trailingSlash = path.substr(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },dirname:function (path) {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }
        return root + dir;
      },basename:function (path) {
        // EMSCRIPTEN return '/'' for '/', not an empty string
        if (path === '/') return '/';
        var lastSlash = path.lastIndexOf('/');
        if (lastSlash === -1) return path;
        return path.substr(lastSlash+1);
      },extname:function (path) {
        return PATH.splitPath(path)[3];
      },join:function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return PATH.normalize(paths.join('/'));
      },join2:function (l, r) {
        return PATH.normalize(l + '/' + r);
      },resolve:function () {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter(function(p) {
          return !!p;
        }), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },relative:function (from, to) {
        from = PATH.resolve(from).substr(1);
        to = PATH.resolve(to).substr(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      }};
  
  var TTY={ttys:[],init:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process['stdin']['setEncoding']('utf8');
        // }
      },shutdown:function () {
        // https://github.com/kripken/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process['stdin']['pause']();
        // }
      },register:function (dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },stream_ops:{open:function (stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          stream.tty = tty;
          stream.seekable = false;
        },close:function (stream) {
          // flush any pending line data
          if (stream.tty.output.length) {
            stream.tty.ops.put_char(stream.tty, 10);
          }
        },read:function (stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },write:function (stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
          }
          for (var i = 0; i < length; i++) {
            try {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        }},default_tty_ops:{get_char:function (tty) {
          if (!tty.input.length) {
            var result = null;
            if (ENVIRONMENT_IS_NODE) {
              result = process['stdin']['read']();
              if (!result) {
                if (process['stdin']['_readableState'] && process['stdin']['_readableState']['ended']) {
                  return null;  // EOF
                }
                return undefined;  // no data available
              }
            } else if (typeof window != 'undefined' &&
              typeof window.prompt == 'function') {
              // Browser.
              result = window.prompt('Input: ');  // returns null on cancel
              if (result !== null) {
                result += '\n';
              }
            } else if (typeof readline == 'function') {
              // Command line.
              result = readline();
              if (result !== null) {
                result += '\n';
              }
            }
            if (!result) {
              return null;
            }
            tty.input = intArrayFromString(result, true);
          }
          return tty.input.shift();
        },put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['print'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }},default_tty1_ops:{put_char:function (tty, val) {
          if (val === null || val === 10) {
            Module['printErr'](tty.output.join(''));
            tty.output = [];
          } else {
            tty.output.push(TTY.utf8.processCChar(val));
          }
        }}};
  
  var MEMFS={ops_table:null,CONTENT_OWNING:1,CONTENT_FLEXIBLE:2,CONTENT_FIXED:3,mount:function (mount) {
        return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createNode:function (parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (!MEMFS.ops_table) {
          MEMFS.ops_table = {
            dir: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                lookup: MEMFS.node_ops.lookup,
                mknod: MEMFS.node_ops.mknod,
                rename: MEMFS.node_ops.rename,
                unlink: MEMFS.node_ops.unlink,
                rmdir: MEMFS.node_ops.rmdir,
                readdir: MEMFS.node_ops.readdir,
                symlink: MEMFS.node_ops.symlink
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek
              }
            },
            file: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: {
                llseek: MEMFS.stream_ops.llseek,
                read: MEMFS.stream_ops.read,
                write: MEMFS.stream_ops.write,
                allocate: MEMFS.stream_ops.allocate,
                mmap: MEMFS.stream_ops.mmap
              }
            },
            link: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr,
                readlink: MEMFS.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: MEMFS.node_ops.getattr,
                setattr: MEMFS.node_ops.setattr
              },
              stream: FS.chrdev_stream_ops
            },
          };
        }
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.contents = [];
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.timestamp = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
        }
        return node;
      },ensureFlexible:function (node) {
        if (node.contentMode !== MEMFS.CONTENT_FLEXIBLE) {
          var contents = node.contents;
          node.contents = Array.prototype.slice.call(contents);
          node.contentMode = MEMFS.CONTENT_FLEXIBLE;
        }
      },node_ops:{getattr:function (node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.contents.length;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.timestamp);
          attr.mtime = new Date(node.timestamp);
          attr.ctime = new Date(node.timestamp);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },setattr:function (node, attr) {
          if (attr.mode !== undefined) {
            node.mode = attr.mode;
          }
          if (attr.timestamp !== undefined) {
            node.timestamp = attr.timestamp;
          }
          if (attr.size !== undefined) {
            MEMFS.ensureFlexible(node);
            var contents = node.contents;
            if (attr.size < contents.length) contents.length = attr.size;
            else while (attr.size > contents.length) contents.push(0);
          }
        },lookup:function (parent, name) {
          throw FS.genericErrors[ERRNO_CODES.ENOENT];
        },mknod:function (parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },rename:function (old_node, new_dir, new_name) {
          // if we're overwriting a directory at new_name, make sure it's empty.
          if (FS.isDir(old_node.mode)) {
            var new_node;
            try {
              new_node = FS.lookupNode(new_dir, new_name);
            } catch (e) {
            }
            if (new_node) {
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
              }
            }
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          old_node.name = new_name;
          new_dir.contents[new_name] = old_node;
          old_node.parent = new_dir;
        },unlink:function (parent, name) {
          delete parent.contents[name];
        },rmdir:function (parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
          }
          delete parent.contents[name];
        },readdir:function (node) {
          var entries = ['.', '..']
          for (var key in node.contents) {
            if (!node.contents.hasOwnProperty(key)) {
              continue;
            }
            entries.push(key);
          }
          return entries;
        },symlink:function (parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
          node.link = oldpath;
          return node;
        },readlink:function (node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          return node.link;
        }},stream_ops:{read:function (stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else
          {
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          }
          return size;
        },write:function (stream, buffer, offset, length, position, canOwn) {
          var node = stream.node;
          node.timestamp = Date.now();
          var contents = node.contents;
          if (length && contents.length === 0 && position === 0 && buffer.subarray) {
            // just replace it with the new data
            if (canOwn && offset === 0) {
              node.contents = buffer; // this could be a subarray of Emscripten HEAP, or allocated from some other source.
              node.contentMode = (buffer.buffer === HEAP8.buffer) ? MEMFS.CONTENT_OWNING : MEMFS.CONTENT_FIXED;
            } else {
              node.contents = new Uint8Array(buffer.subarray(offset, offset+length));
              node.contentMode = MEMFS.CONTENT_FIXED;
            }
            return length;
          }
          MEMFS.ensureFlexible(node);
          var contents = node.contents;
          while (contents.length < position) contents.push(0);
          for (var i = 0; i < length; i++) {
            contents[position + i] = buffer[offset + i];
          }
          return length;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.contents.length;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          stream.ungotten = [];
          stream.position = position;
          return position;
        },allocate:function (stream, offset, length) {
          MEMFS.ensureFlexible(stream.node);
          var contents = stream.node.contents;
          var limit = offset + length;
          while (limit > contents.length) contents.push(0);
        },mmap:function (stream, buffer, offset, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if ( !(flags & 2) &&
                (contents.buffer === buffer || contents.buffer === buffer.buffer) ) {
            // We can't emulate MAP_SHARED when the file is not backed by the buffer
            // we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            // Try to avoid unnecessary slices.
            if (position > 0 || position + length < contents.length) {
              if (contents.subarray) {
                contents = contents.subarray(position, position + length);
              } else {
                contents = Array.prototype.slice.call(contents, position, position + length);
              }
            }
            allocated = true;
            ptr = _malloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
            }
            buffer.set(contents, ptr);
          }
          return { ptr: ptr, allocated: allocated };
        }}};
  
  var IDBFS={dbs:{},indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_VERSION:21,DB_STORE_NAME:"FILE_DATA",mount:function (mount) {
        // reuse all of the core MEMFS functionality
        return MEMFS.mount.apply(null, arguments);
      },syncfs:function (mount, populate, callback) {
        IDBFS.getLocalSet(mount, function(err, local) {
          if (err) return callback(err);
  
          IDBFS.getRemoteSet(mount, function(err, remote) {
            if (err) return callback(err);
  
            var src = populate ? remote : local;
            var dst = populate ? local : remote;
  
            IDBFS.reconcile(src, dst, callback);
          });
        });
      },getDB:function (name, callback) {
        // check the cache first
        var db = IDBFS.dbs[name];
        if (db) {
          return callback(null, db);
        }
  
        var req;
        try {
          req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
        } catch (e) {
          return callback(e);
        }
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          var transaction = e.target.transaction;
  
          var fileStore;
  
          if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
            fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
          } else {
            fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
          }
  
          fileStore.createIndex('timestamp', 'timestamp', { unique: false });
        };
        req.onsuccess = function() {
          db = req.result;
  
          // add to the cache
          IDBFS.dbs[name] = db;
          callback(null, db);
        };
        req.onerror = function() {
          callback(this.error);
        };
      },getLocalSet:function (mount, callback) {
        var entries = {};
  
        function isRealDir(p) {
          return p !== '.' && p !== '..';
        };
        function toAbsolute(root) {
          return function(p) {
            return PATH.join2(root, p);
          }
        };
  
        var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  
        while (check.length) {
          var path = check.pop();
          var stat;
  
          try {
            stat = FS.stat(path);
          } catch (e) {
            return callback(e);
          }
  
          if (FS.isDir(stat.mode)) {
            check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
          }
  
          entries[path] = { timestamp: stat.mtime };
        }
  
        return callback(null, { type: 'local', entries: entries });
      },getRemoteSet:function (mount, callback) {
        var entries = {};
  
        IDBFS.getDB(mount.mountpoint, function(err, db) {
          if (err) return callback(err);
  
          var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readonly');
          transaction.onerror = function() { callback(this.error); };
  
          var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
          var index = store.index('timestamp');
  
          index.openKeyCursor().onsuccess = function(event) {
            var cursor = event.target.result;
  
            if (!cursor) {
              return callback(null, { type: 'remote', db: db, entries: entries });
            }
  
            entries[cursor.primaryKey] = { timestamp: cursor.key };
  
            cursor.continue();
          };
        });
      },loadLocalEntry:function (path, callback) {
        var stat, node;
  
        try {
          var lookup = FS.lookupPath(path);
          node = lookup.node;
          stat = FS.stat(path);
        } catch (e) {
          return callback(e);
        }
  
        if (FS.isDir(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode });
        } else if (FS.isFile(stat.mode)) {
          return callback(null, { timestamp: stat.mtime, mode: stat.mode, contents: node.contents });
        } else {
          return callback(new Error('node type not supported'));
        }
      },storeLocalEntry:function (path, entry, callback) {
        try {
          if (FS.isDir(entry.mode)) {
            FS.mkdir(path, entry.mode);
          } else if (FS.isFile(entry.mode)) {
            FS.writeFile(path, entry.contents, { encoding: 'binary', canOwn: true });
          } else {
            return callback(new Error('node type not supported'));
          }
  
          FS.utime(path, entry.timestamp, entry.timestamp);
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },removeLocalEntry:function (path, callback) {
        try {
          var lookup = FS.lookupPath(path);
          var stat = FS.stat(path);
  
          if (FS.isDir(stat.mode)) {
            FS.rmdir(path);
          } else if (FS.isFile(stat.mode)) {
            FS.unlink(path);
          }
        } catch (e) {
          return callback(e);
        }
  
        callback(null);
      },loadRemoteEntry:function (store, path, callback) {
        var req = store.get(path);
        req.onsuccess = function(event) { callback(null, event.target.result); };
        req.onerror = function() { callback(this.error); };
      },storeRemoteEntry:function (store, path, entry, callback) {
        var req = store.put(entry, path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },removeRemoteEntry:function (store, path, callback) {
        var req = store.delete(path);
        req.onsuccess = function() { callback(null); };
        req.onerror = function() { callback(this.error); };
      },reconcile:function (src, dst, callback) {
        var total = 0;
  
        var create = [];
        Object.keys(src.entries).forEach(function (key) {
          var e = src.entries[key];
          var e2 = dst.entries[key];
          if (!e2 || e.timestamp > e2.timestamp) {
            create.push(key);
            total++;
          }
        });
  
        var remove = [];
        Object.keys(dst.entries).forEach(function (key) {
          var e = dst.entries[key];
          var e2 = src.entries[key];
          if (!e2) {
            remove.push(key);
            total++;
          }
        });
  
        if (!total) {
          return callback(null);
        }
  
        var errored = false;
        var completed = 0;
        var db = src.type === 'remote' ? src.db : dst.db;
        var transaction = db.transaction([IDBFS.DB_STORE_NAME], 'readwrite');
        var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= total) {
            return callback(null);
          }
        };
  
        transaction.onerror = function() { done(this.error); };
  
        // sort paths in ascending order so directory entries are created
        // before the files inside them
        create.sort().forEach(function (path) {
          if (dst.type === 'local') {
            IDBFS.loadRemoteEntry(store, path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeLocalEntry(path, entry, done);
            });
          } else {
            IDBFS.loadLocalEntry(path, function (err, entry) {
              if (err) return done(err);
              IDBFS.storeRemoteEntry(store, path, entry, done);
            });
          }
        });
  
        // sort paths in descending order so files are deleted before their
        // parent directories
        remove.sort().reverse().forEach(function(path) {
          if (dst.type === 'local') {
            IDBFS.removeLocalEntry(path, done);
          } else {
            IDBFS.removeRemoteEntry(store, path, done);
          }
        });
      }};
  
  var NODEFS={isWindows:false,staticInit:function () {
        NODEFS.isWindows = !!process.platform.match(/^win/);
      },mount:function (mount) {
        assert(ENVIRONMENT_IS_NODE);
        return NODEFS.createNode(null, '/', NODEFS.getMode(mount.opts.root), 0);
      },createNode:function (parent, name, mode, dev) {
        if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node = FS.createNode(parent, name, mode);
        node.node_ops = NODEFS.node_ops;
        node.stream_ops = NODEFS.stream_ops;
        return node;
      },getMode:function (path) {
        var stat;
        try {
          stat = fs.lstatSync(path);
          if (NODEFS.isWindows) {
            // On Windows, directories return permission bits 'rw-rw-rw-', even though they have 'rwxrwxrwx', so 
            // propagate write bits to execute bits.
            stat.mode = stat.mode | ((stat.mode & 146) >> 1);
          }
        } catch (e) {
          if (!e.code) throw e;
          throw new FS.ErrnoError(ERRNO_CODES[e.code]);
        }
        return stat.mode;
      },realPath:function (node) {
        var parts = [];
        while (node.parent !== node) {
          parts.push(node.name);
          node = node.parent;
        }
        parts.push(node.mount.opts.root);
        parts.reverse();
        return PATH.join.apply(null, parts);
      },flagsToPermissionStringMap:{0:"r",1:"r+",2:"r+",64:"r",65:"r+",66:"r+",129:"rx+",193:"rx+",514:"w+",577:"w",578:"w+",705:"wx",706:"wx+",1024:"a",1025:"a",1026:"a+",1089:"a",1090:"a+",1153:"ax",1154:"ax+",1217:"ax",1218:"ax+",4096:"rs",4098:"rs+"},flagsToPermissionString:function (flags) {
        if (flags in NODEFS.flagsToPermissionStringMap) {
          return NODEFS.flagsToPermissionStringMap[flags];
        } else {
          return flags;
        }
      },node_ops:{getattr:function (node) {
          var path = NODEFS.realPath(node);
          var stat;
          try {
            stat = fs.lstatSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          // node.js v0.10.20 doesn't report blksize and blocks on Windows. Fake them with default blksize of 4096.
          // See http://support.microsoft.com/kb/140365
          if (NODEFS.isWindows && !stat.blksize) {
            stat.blksize = 4096;
          }
          if (NODEFS.isWindows && !stat.blocks) {
            stat.blocks = (stat.size+stat.blksize-1)/stat.blksize|0;
          }
          return {
            dev: stat.dev,
            ino: stat.ino,
            mode: stat.mode,
            nlink: stat.nlink,
            uid: stat.uid,
            gid: stat.gid,
            rdev: stat.rdev,
            size: stat.size,
            atime: stat.atime,
            mtime: stat.mtime,
            ctime: stat.ctime,
            blksize: stat.blksize,
            blocks: stat.blocks
          };
        },setattr:function (node, attr) {
          var path = NODEFS.realPath(node);
          try {
            if (attr.mode !== undefined) {
              fs.chmodSync(path, attr.mode);
              // update the common node structure mode as well
              node.mode = attr.mode;
            }
            if (attr.timestamp !== undefined) {
              var date = new Date(attr.timestamp);
              fs.utimesSync(path, date, date);
            }
            if (attr.size !== undefined) {
              fs.truncateSync(path, attr.size);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },lookup:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          var mode = NODEFS.getMode(path);
          return NODEFS.createNode(parent, name, mode);
        },mknod:function (parent, name, mode, dev) {
          var node = NODEFS.createNode(parent, name, mode, dev);
          // create the backing node for this in the fs root as well
          var path = NODEFS.realPath(node);
          try {
            if (FS.isDir(node.mode)) {
              fs.mkdirSync(path, node.mode);
            } else {
              fs.writeFileSync(path, '', { mode: node.mode });
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return node;
        },rename:function (oldNode, newDir, newName) {
          var oldPath = NODEFS.realPath(oldNode);
          var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
          try {
            fs.renameSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },unlink:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.unlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },rmdir:function (parent, name) {
          var path = PATH.join2(NODEFS.realPath(parent), name);
          try {
            fs.rmdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readdir:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readdirSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },symlink:function (parent, newName, oldPath) {
          var newPath = PATH.join2(NODEFS.realPath(parent), newName);
          try {
            fs.symlinkSync(oldPath, newPath);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },readlink:function (node) {
          var path = NODEFS.realPath(node);
          try {
            return fs.readlinkSync(path);
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        }},stream_ops:{open:function (stream) {
          var path = NODEFS.realPath(stream.node);
          try {
            if (FS.isFile(stream.node.mode)) {
              stream.nfd = fs.openSync(path, NODEFS.flagsToPermissionString(stream.flags));
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },close:function (stream) {
          try {
            if (FS.isFile(stream.node.mode) && stream.nfd) {
              fs.closeSync(stream.nfd);
            }
          } catch (e) {
            if (!e.code) throw e;
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
        },read:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(length);
          var res;
          try {
            res = fs.readSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          if (res > 0) {
            for (var i = 0; i < res; i++) {
              buffer[offset + i] = nbuffer[i];
            }
          }
          return res;
        },write:function (stream, buffer, offset, length, position) {
          // FIXME this is terrible.
          var nbuffer = new Buffer(buffer.subarray(offset, offset + length));
          var res;
          try {
            res = fs.writeSync(stream.nfd, nbuffer, 0, length, position);
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES[e.code]);
          }
          return res;
        },llseek:function (stream, offset, whence) {
          var position = offset;
          if (whence === 1) {  // SEEK_CUR.
            position += stream.position;
          } else if (whence === 2) {  // SEEK_END.
            if (FS.isFile(stream.node.mode)) {
              try {
                var stat = fs.fstatSync(stream.nfd);
                position += stat.size;
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES[e.code]);
              }
            }
          }
  
          if (position < 0) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
  
          stream.position = position;
          return position;
        }}};
  
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  
  function _fflush(stream) {
      // int fflush(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fflush.html
      // we don't currently perform any user-space buffering of data
    }var FS={root:null,mounts:[],devices:[null],streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,trackingDelegate:{},tracking:{openFlags:{READ:1,WRITE:2}},ErrnoError:null,genericErrors:{},handleFSError:function (e) {
        if (!(e instanceof FS.ErrnoError)) throw e + ' : ' + stackTrace();
        return ___setErrNo(e.errno);
      },lookupPath:function (path, opts) {
        path = PATH.resolve(FS.cwd(), path);
        opts = opts || {};
  
        var defaults = {
          follow_mount: true,
          recurse_count: 0
        };
        for (var key in defaults) {
          if (opts[key] === undefined) {
            opts[key] = defaults[key];
          }
        }
  
        if (opts.recurse_count > 8) {  // max recursive lookup of 8
          throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
        }
  
        // split the path
        var parts = PATH.normalizeArray(path.split('/').filter(function(p) {
          return !!p;
        }), false);
  
        // start at the root
        var current = FS.root;
        var current_path = '/';
  
        for (var i = 0; i < parts.length; i++) {
          var islast = (i === parts.length-1);
          if (islast && opts.parent) {
            // stop resolving
            break;
          }
  
          current = FS.lookupNode(current, parts[i]);
          current_path = PATH.join2(current_path, parts[i]);
  
          // jump to the mount's root node if this is a mountpoint
          if (FS.isMountpoint(current)) {
            if (!islast || (islast && opts.follow_mount)) {
              current = current.mounted.root;
            }
          }
  
          // by default, lookupPath will not follow a symlink if it is the final path component.
          // setting opts.follow = true will override this behavior.
          if (!islast || opts.follow) {
            var count = 0;
            while (FS.isLink(current.mode)) {
              var link = FS.readlink(current_path);
              current_path = PATH.resolve(PATH.dirname(current_path), link);
              
              var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count });
              current = lookup.node;
  
              if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
                throw new FS.ErrnoError(ERRNO_CODES.ELOOP);
              }
            }
          }
        }
  
        return { path: current_path, node: current };
      },getPath:function (node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? mount + '/' + path : mount + path;
          }
          path = path ? node.name + '/' + path : node.name;
          node = node.parent;
        }
      },hashName:function (parentid, name) {
        var hash = 0;
  
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },hashAddNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },hashRemoveNode:function (node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },lookupNode:function (parent, name) {
        var err = FS.mayLookup(parent);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },createNode:function (parent, name, mode, rdev) {
        if (!FS.FSNode) {
          FS.FSNode = function(parent, name, mode, rdev) {
            if (!parent) {
              parent = this;  // root node sets parent to itself
            }
            this.parent = parent;
            this.mount = parent.mount;
            this.mounted = null;
            this.id = FS.nextInode++;
            this.name = name;
            this.mode = mode;
            this.node_ops = {};
            this.stream_ops = {};
            this.rdev = rdev;
          };
  
          FS.FSNode.prototype = {};
  
          // compatibility
          var readMode = 292 | 73;
          var writeMode = 146;
  
          // NOTE we must use Object.defineProperties instead of individual calls to
          // Object.defineProperty in order to make closure compiler happy
          Object.defineProperties(FS.FSNode.prototype, {
            read: {
              get: function() { return (this.mode & readMode) === readMode; },
              set: function(val) { val ? this.mode |= readMode : this.mode &= ~readMode; }
            },
            write: {
              get: function() { return (this.mode & writeMode) === writeMode; },
              set: function(val) { val ? this.mode |= writeMode : this.mode &= ~writeMode; }
            },
            isFolder: {
              get: function() { return FS.isDir(this.mode); },
            },
            isDevice: {
              get: function() { return FS.isChrdev(this.mode); },
            },
          });
        }
  
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },destroyNode:function (node) {
        FS.hashRemoveNode(node);
      },isRoot:function (node) {
        return node === node.parent;
      },isMountpoint:function (node) {
        return !!node.mounted;
      },isFile:function (mode) {
        return (mode & 61440) === 32768;
      },isDir:function (mode) {
        return (mode & 61440) === 16384;
      },isLink:function (mode) {
        return (mode & 61440) === 40960;
      },isChrdev:function (mode) {
        return (mode & 61440) === 8192;
      },isBlkdev:function (mode) {
        return (mode & 61440) === 24576;
      },isFIFO:function (mode) {
        return (mode & 61440) === 4096;
      },isSocket:function (mode) {
        return (mode & 49152) === 49152;
      },flagModes:{"r":0,"rs":1052672,"r+":2,"w":577,"wx":705,"xw":705,"w+":578,"wx+":706,"xw+":706,"a":1089,"ax":1217,"xa":1217,"a+":1090,"ax+":1218,"xa+":1218},modeStringToFlags:function (str) {
        var flags = FS.flagModes[str];
        if (typeof flags === 'undefined') {
          throw new Error('Unknown file open mode: ' + str);
        }
        return flags;
      },flagsToPermissionString:function (flag) {
        var accmode = flag & 2097155;
        var perms = ['r', 'w', 'rw'][accmode];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },nodePermissions:function (node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.indexOf('r') !== -1 && !(node.mode & 292)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('w') !== -1 && !(node.mode & 146)) {
          return ERRNO_CODES.EACCES;
        } else if (perms.indexOf('x') !== -1 && !(node.mode & 73)) {
          return ERRNO_CODES.EACCES;
        }
        return 0;
      },mayLookup:function (dir) {
        return FS.nodePermissions(dir, 'x');
      },mayCreate:function (dir, name) {
        try {
          var node = FS.lookupNode(dir, name);
          return ERRNO_CODES.EEXIST;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },mayDelete:function (dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var err = FS.nodePermissions(dir, 'wx');
        if (err) {
          return err;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return ERRNO_CODES.ENOTDIR;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return ERRNO_CODES.EBUSY;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return 0;
      },mayOpen:function (node, flags) {
        if (!node) {
          return ERRNO_CODES.ENOENT;
        }
        if (FS.isLink(node.mode)) {
          return ERRNO_CODES.ELOOP;
        } else if (FS.isDir(node.mode)) {
          if ((flags & 2097155) !== 0 ||  // opening for write
              (flags & 512)) {
            return ERRNO_CODES.EISDIR;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },MAX_OPEN_FDS:4096,nextfd:function (fd_start, fd_end) {
        fd_start = fd_start || 0;
        fd_end = fd_end || FS.MAX_OPEN_FDS;
        for (var fd = fd_start; fd <= fd_end; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(ERRNO_CODES.EMFILE);
      },getStream:function (fd) {
        return FS.streams[fd];
      },createStream:function (stream, fd_start, fd_end) {
        if (!FS.FSStream) {
          FS.FSStream = function(){};
          FS.FSStream.prototype = {};
          // compatibility
          Object.defineProperties(FS.FSStream.prototype, {
            object: {
              get: function() { return this.node; },
              set: function(val) { this.node = val; }
            },
            isRead: {
              get: function() { return (this.flags & 2097155) !== 1; }
            },
            isWrite: {
              get: function() { return (this.flags & 2097155) !== 0; }
            },
            isAppend: {
              get: function() { return (this.flags & 1024); }
            }
          });
        }
        // clone it, so we can return an instance of FSStream
        var newStream = new FS.FSStream();
        for (var p in stream) {
          newStream[p] = stream[p];
        }
        stream = newStream;
        var fd = FS.nextfd(fd_start, fd_end);
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },closeStream:function (fd) {
        FS.streams[fd] = null;
      },getStreamFromPtr:function (ptr) {
        return FS.streams[ptr - 1];
      },getPtrForStream:function (stream) {
        return stream ? stream.fd + 1 : 0;
      },chrdev_stream_ops:{open:function (stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          if (stream.stream_ops.open) {
            stream.stream_ops.open(stream);
          }
        },llseek:function () {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }},major:function (dev) {
        return ((dev) >> 8);
      },minor:function (dev) {
        return ((dev) & 0xff);
      },makedev:function (ma, mi) {
        return ((ma) << 8 | (mi));
      },registerDevice:function (dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },getDevice:function (dev) {
        return FS.devices[dev];
      },getMounts:function (mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push.apply(check, m.mounts);
        }
  
        return mounts;
      },syncfs:function (populate, callback) {
        if (typeof(populate) === 'function') {
          callback = populate;
          populate = false;
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function done(err) {
          if (err) {
            if (!done.errored) {
              done.errored = true;
              return callback(err);
            }
            return;
          }
          if (++completed >= mounts.length) {
            callback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach(function (mount) {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },mount:function (type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
          }
        }
  
        var mount = {
          type: type,
          opts: opts,
          mountpoint: mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },unmount:function (mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach(function (hash) {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.indexOf(current.mount) !== -1) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        assert(idx !== -1);
        node.mount.mounts.splice(idx, 1);
      },lookup:function (parent, name) {
        return parent.node_ops.lookup(parent, name);
      },mknod:function (path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var err = FS.mayCreate(parent, name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },create:function (path, mode) {
        mode = mode !== undefined ? mode : 438 /* 0666 */;
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },mkdir:function (path, mode) {
        mode = mode !== undefined ? mode : 511 /* 0777 */;
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },mkdev:function (path, mode, dev) {
        if (typeof(dev) === 'undefined') {
          dev = mode;
          mode = 438 /* 0666 */;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },symlink:function (oldpath, newpath) {
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        var newname = PATH.basename(newpath);
        var err = FS.mayCreate(parent, newname);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },rename:function (old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
        try {
          lookup = FS.lookupPath(old_path, { parent: true });
          old_dir = lookup.node;
          lookup = FS.lookupPath(new_path, { parent: true });
          new_dir = lookup.node;
        } catch (e) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(ERRNO_CODES.EXDEV);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        // new path should not be an ancestor of the old path
        relative = PATH.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var err = FS.mayDelete(old_dir, old_name, isdir);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        err = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          err = FS.nodePermissions(old_dir, 'w');
          if (err) {
            throw new FS.ErrnoError(err);
          }
        }
        try {
          if (FS.trackingDelegate['willMovePath']) {
            FS.trackingDelegate['willMovePath'](old_path, new_path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willMovePath']('"+old_path+"', '"+new_path+"') threw an exception: " + e.message);
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
        try {
          if (FS.trackingDelegate['onMovePath']) FS.trackingDelegate['onMovePath'](old_path, new_path);
        } catch(e) {
          console.log("FS.trackingDelegate['onMovePath']('"+old_path+"', '"+new_path+"') threw an exception: " + e.message);
        }
      },rmdir:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, true);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        try {
          if (FS.trackingDelegate['willDeletePath']) {
            FS.trackingDelegate['willDeletePath'](path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: " + e.message);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
        try {
          if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
        } catch(e) {
          console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: " + e.message);
        }
      },readdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node.node_ops.readdir) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        return node.node_ops.readdir(node);
      },unlink:function (path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var err = FS.mayDelete(parent, name, false);
        if (err) {
          // POSIX says unlink should set EPERM, not EISDIR
          if (err === ERRNO_CODES.EISDIR) err = ERRNO_CODES.EPERM;
          throw new FS.ErrnoError(err);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(ERRNO_CODES.EBUSY);
        }
        try {
          if (FS.trackingDelegate['willDeletePath']) {
            FS.trackingDelegate['willDeletePath'](path);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['willDeletePath']('"+path+"') threw an exception: " + e.message);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
        try {
          if (FS.trackingDelegate['onDeletePath']) FS.trackingDelegate['onDeletePath'](path);
        } catch(e) {
          console.log("FS.trackingDelegate['onDeletePath']('"+path+"') threw an exception: " + e.message);
        }
      },readlink:function (path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        return link.node_ops.readlink(link);
      },stat:function (path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        if (!node.node_ops.getattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        return node.node_ops.getattr(node);
      },lstat:function (path) {
        return FS.stat(path, true);
      },chmod:function (path, mode, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          timestamp: Date.now()
        });
      },lchmod:function (path, mode) {
        FS.chmod(path, mode, true);
      },fchmod:function (fd, mode) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chmod(stream.node, mode);
      },chown:function (path, uid, gid, dontFollow) {
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        node.node_ops.setattr(node, {
          timestamp: Date.now()
          // we ignore the uid / gid for now
        });
      },lchown:function (path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },fchown:function (fd, uid, gid) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        FS.chown(stream.node, uid, gid);
      },truncate:function (path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var node;
        if (typeof path === 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        if (!node.node_ops.setattr) {
          throw new FS.ErrnoError(ERRNO_CODES.EPERM);
        }
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var err = FS.nodePermissions(node, 'w');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        node.node_ops.setattr(node, {
          size: len,
          timestamp: Date.now()
        });
      },ftruncate:function (fd, len) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        FS.truncate(stream.node, len);
      },utime:function (path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        node.node_ops.setattr(node, {
          timestamp: Math.max(atime, mtime)
        });
      },open:function (path, flags, mode, fd_start, fd_end) {
        flags = typeof flags === 'string' ? FS.modeStringToFlags(flags) : flags;
        mode = typeof mode === 'undefined' ? 438 /* 0666 */ : mode;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        if (typeof path === 'object') {
          node = path;
        } else {
          path = PATH.normalize(path);
          try {
            var lookup = FS.lookupPath(path, {
              follow: !(flags & 131072)
            });
            node = lookup.node;
          } catch (e) {
            // ignore
          }
        }
        // perhaps we need to create the node
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(ERRNO_CODES.EEXIST);
            }
          } else {
            // node doesn't exist, try to create it
            node = FS.mknod(path, mode, 0);
          }
        }
        if (!node) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // check permissions
        var err = FS.mayOpen(node, flags);
        if (err) {
          throw new FS.ErrnoError(err);
        }
        // do truncation if necessary
        if ((flags & 512)) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node: node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags: flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        }, fd_start, fd_end);
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!FS.readFiles) FS.readFiles = {};
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
            Module['printErr']('read file: ' + path);
          }
        }
        try {
          if (FS.trackingDelegate['onOpenFile']) {
            var trackingFlags = 0;
            if ((flags & 2097155) !== 1) {
              trackingFlags |= FS.tracking.openFlags.READ;
            }
            if ((flags & 2097155) !== 0) {
              trackingFlags |= FS.tracking.openFlags.WRITE;
            }
            FS.trackingDelegate['onOpenFile'](path, trackingFlags);
          }
        } catch(e) {
          console.log("FS.trackingDelegate['onOpenFile']('"+path+"', flags) threw an exception: " + e.message);
        }
        return stream;
      },close:function (stream) {
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
      },llseek:function (stream, offset, whence) {
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        return stream.stream_ops.llseek(stream, offset, whence);
      },read:function (stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },write:function (stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.EISDIR);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        var seeking = true;
        if (typeof position === 'undefined') {
          position = stream.position;
          seeking = false;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(ERRNO_CODES.ESPIPE);
        }
        if (stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        try {
          if (stream.path && FS.trackingDelegate['onWriteToFile']) FS.trackingDelegate['onWriteToFile'](stream.path);
        } catch(e) {
          console.log("FS.trackingDelegate['onWriteToFile']('"+path+"') threw an exception: " + e.message);
        }
        return bytesWritten;
      },allocate:function (stream, offset, length) {
        if (offset < 0 || length <= 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(ERRNO_CODES.EBADF);
        }
        if (!FS.isFile(stream.node.mode) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        if (!stream.stream_ops.allocate) {
          throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
        }
        stream.stream_ops.allocate(stream, offset, length);
      },mmap:function (stream, buffer, offset, length, position, prot, flags) {
        // TODO if PROT is PROT_WRITE, make sure we have write access
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(ERRNO_CODES.EACCES);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
        }
        return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
      },ioctl:function (stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTTY);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },readFile:function (path, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'r';
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var ret;
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          ret = '';
          var utf8 = new Runtime.UTF8Processor();
          for (var i = 0; i < length; i++) {
            ret += utf8.processCChar(buf[i]);
          }
        } else if (opts.encoding === 'binary') {
          ret = buf;
        }
        FS.close(stream);
        return ret;
      },writeFile:function (path, data, opts) {
        opts = opts || {};
        opts.flags = opts.flags || 'w';
        opts.encoding = opts.encoding || 'utf8';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error('Invalid encoding type "' + opts.encoding + '"');
        }
        var stream = FS.open(path, opts.flags, opts.mode);
        if (opts.encoding === 'utf8') {
          var utf8 = new Runtime.UTF8Processor();
          var buf = new Uint8Array(utf8.processJSString(data));
          FS.write(stream, buf, 0, buf.length, 0, opts.canOwn);
        } else if (opts.encoding === 'binary') {
          FS.write(stream, data, 0, data.length, 0, opts.canOwn);
        }
        FS.close(stream);
      },cwd:function () {
        return FS.currentPath;
      },chdir:function (path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(ERRNO_CODES.ENOTDIR);
        }
        var err = FS.nodePermissions(lookup.node, 'x');
        if (err) {
          throw new FS.ErrnoError(err);
        }
        FS.currentPath = lookup.path;
      },createDefaultDirectories:function () {
        FS.mkdir('/tmp');
      },createDefaultDevices:function () {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: function() { return 0; },
          write: function() { return 0; }
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using Module['printErr']
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },createStandardStreams:function () {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (Module['stdin']) {
          FS.createDevice('/dev', 'stdin', Module['stdin']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (Module['stdout']) {
          FS.createDevice('/dev', 'stdout', null, Module['stdout']);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (Module['stderr']) {
          FS.createDevice('/dev', 'stderr', null, Module['stderr']);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 'r');
        HEAP32[((_stdin)>>2)]=FS.getPtrForStream(stdin);
        assert(stdin.fd === 0, 'invalid handle for stdin (' + stdin.fd + ')');
  
        var stdout = FS.open('/dev/stdout', 'w');
        HEAP32[((_stdout)>>2)]=FS.getPtrForStream(stdout);
        assert(stdout.fd === 1, 'invalid handle for stdout (' + stdout.fd + ')');
  
        var stderr = FS.open('/dev/stderr', 'w');
        HEAP32[((_stderr)>>2)]=FS.getPtrForStream(stderr);
        assert(stderr.fd === 2, 'invalid handle for stderr (' + stderr.fd + ')');
      },ensureErrnoError:function () {
        if (FS.ErrnoError) return;
        FS.ErrnoError = function ErrnoError(errno) {
          this.errno = errno;
          for (var key in ERRNO_CODES) {
            if (ERRNO_CODES[key] === errno) {
              this.code = key;
              break;
            }
          }
          this.message = ERRNO_MESSAGES[errno];
        };
        FS.ErrnoError.prototype = new Error();
        FS.ErrnoError.prototype.constructor = FS.ErrnoError;
        // Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
        [ERRNO_CODES.ENOENT].forEach(function(code) {
          FS.genericErrors[code] = new FS.ErrnoError(code);
          FS.genericErrors[code].stack = '<generic error, no stack>';
        });
      },staticInit:function () {
        FS.ensureErrnoError();
  
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
      },init:function (input, output, error) {
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
  
        FS.ensureErrnoError();
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        Module['stdin'] = input || Module['stdin'];
        Module['stdout'] = output || Module['stdout'];
        Module['stderr'] = error || Module['stderr'];
  
        FS.createStandardStreams();
      },quit:function () {
        FS.init.initialized = false;
        for (var i = 0; i < FS.streams.length; i++) {
          var stream = FS.streams[i];
          if (!stream) {
            continue;
          }
          FS.close(stream);
        }
      },getMode:function (canRead, canWrite) {
        var mode = 0;
        if (canRead) mode |= 292 | 73;
        if (canWrite) mode |= 146;
        return mode;
      },joinPath:function (parts, forceRelative) {
        var path = PATH.join.apply(null, parts);
        if (forceRelative && path[0] == '/') path = path.substr(1);
        return path;
      },absolutePath:function (relative, base) {
        return PATH.resolve(base, relative);
      },standardizePath:function (path) {
        return PATH.normalize(path);
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },analyzePath:function (path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },createFolder:function (parent, name, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.mkdir(path, mode);
      },createPath:function (parent, path, canRead, canWrite) {
        parent = typeof parent === 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            // ignore EEXIST
          }
          parent = current;
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(canRead, canWrite);
        return FS.create(path, mode);
      },createDataFile:function (parent, name, data, canRead, canWrite, canOwn) {
        var path = name ? PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name) : parent;
        var mode = FS.getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data === 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 'w');
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
        return node;
      },createDevice:function (parent, name, input, output) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        var mode = FS.getMode(!!input, !!output);
        if (!FS.createDevice.major) FS.createDevice.major = 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open: function(stream) {
            stream.seekable = false;
          },
          close: function(stream) {
            // flush any pending line data
            if (output && output.buffer && output.buffer.length) {
              output(10);
            }
          },
          read: function(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.timestamp = Date.now();
            }
            return bytesRead;
          },
          write: function(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(ERRNO_CODES.EIO);
              }
            }
            if (length) {
              stream.node.timestamp = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },createLink:function (parent, name, target, canRead, canWrite) {
        var path = PATH.join2(typeof parent === 'string' ? parent : FS.getPath(parent), name);
        return FS.symlink(target, path);
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
        function LazyUint8Array() {
          this.lengthKnown = false;
          this.chunks = []; // Loaded chunks. Index is the chunk number
        }
        LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
          if (idx > this.length-1 || idx < 0) {
            return undefined;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = Math.floor(idx / this.chunkSize);
          return this.getter(chunkNum)[chunkOffset];
        }
        LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        }
        LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
            // Find length
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, false);
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            var datalength = Number(xhr.getResponseHeader("Content-length"));
            var header;
            var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
            var chunkSize = 1024*1024; // Chunk size in bytes
  
            if (!hasByteServing) chunkSize = datalength;
  
            // Function to get a range from the remote URL.
            var doXHR = (function(from, to) {
              if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
              if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
              // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, false);
              if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
              // Some hints to the browser that we want binary data.
              if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
              if (xhr.overrideMimeType) {
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
              }
  
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              if (xhr.response !== undefined) {
                return new Uint8Array(xhr.response || []);
              } else {
                return intArrayFromString(xhr.responseText || '', true);
              }
            });
            var lazyArray = this;
            lazyArray.setDataGetter(function(chunkNum) {
              var start = chunkNum * chunkSize;
              var end = (chunkNum+1) * chunkSize - 1; // including this byte
              end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
              if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                lazyArray.chunks[chunkNum] = doXHR(start, end);
              }
              if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
              return lazyArray.chunks[chunkNum];
            });
  
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true;
        }
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
  
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach(function(key) {
          var fn = node.stream_ops[key];
          stream_ops[key] = function forceLoadLazyFile() {
            if (!FS.forceLoadFile(node)) {
              throw new FS.ErrnoError(ERRNO_CODES.EIO);
            }
            return fn.apply(null, arguments);
          };
        });
        // use a custom read function
        stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
          if (!FS.forceLoadFile(node)) {
            throw new FS.ErrnoError(ERRNO_CODES.EIO);
          }
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          assert(size >= 0);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        };
        node.stream_ops = stream_ops;
        return node;
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn) {
        Browser.init();
        // TODO we should allow people to just pass in a complete filename instead
        // of parent and name being that we just join them anyways
        var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },indexedDB:function () {
        return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      },DB_NAME:function () {
        return 'EM_FS_' + window.location.pathname;
      },DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
          console.log('creating db');
          var db = openRequest.result;
          db.createObjectStore(FS.DB_STORE_NAME);
        };
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          var transaction = db.transaction([FS.DB_STORE_NAME], 'readwrite');
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var putRequest = files.put(FS.analyzePath(path).object.contents, path);
            putRequest.onsuccess = function putRequest_onsuccess() { ok++; if (ok + fail == total) finish() };
            putRequest.onerror = function putRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      },loadFilesFromDB:function (paths, onload, onerror) {
        onload = onload || function(){};
        onerror = onerror || function(){};
        var indexedDB = FS.indexedDB();
        try {
          var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
        } catch (e) {
          return onerror(e);
        }
        openRequest.onupgradeneeded = onerror; // no database to load from
        openRequest.onsuccess = function openRequest_onsuccess() {
          var db = openRequest.result;
          try {
            var transaction = db.transaction([FS.DB_STORE_NAME], 'readonly');
          } catch(e) {
            onerror(e);
            return;
          }
          var files = transaction.objectStore(FS.DB_STORE_NAME);
          var ok = 0, fail = 0, total = paths.length;
          function finish() {
            if (fail == 0) onload(); else onerror();
          }
          paths.forEach(function(path) {
            var getRequest = files.get(path);
            getRequest.onsuccess = function getRequest_onsuccess() {
              if (FS.analyzePath(path).exists) {
                FS.unlink(path);
              }
              FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
              ok++;
              if (ok + fail == total) finish();
            };
            getRequest.onerror = function getRequest_onerror() { fail++; if (ok + fail == total) finish() };
          });
          transaction.onerror = onerror;
        };
        openRequest.onerror = onerror;
      }};function _lseek(fildes, offset, whence) {
      // off_t lseek(int fildes, off_t offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/lseek.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        return FS.llseek(stream, offset, whence);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }

  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 30: return PAGE_SIZE;
        case 132:
        case 133:
        case 12:
        case 137:
        case 138:
        case 15:
        case 235:
        case 16:
        case 17:
        case 18:
        case 19:
        case 20:
        case 149:
        case 13:
        case 10:
        case 236:
        case 153:
        case 9:
        case 21:
        case 22:
        case 159:
        case 154:
        case 14:
        case 77:
        case 78:
        case 139:
        case 80:
        case 81:
        case 79:
        case 82:
        case 68:
        case 67:
        case 164:
        case 11:
        case 29:
        case 47:
        case 48:
        case 95:
        case 52:
        case 51:
        case 46:
          return 200809;
        case 27:
        case 246:
        case 127:
        case 128:
        case 23:
        case 24:
        case 160:
        case 161:
        case 181:
        case 182:
        case 242:
        case 183:
        case 184:
        case 243:
        case 244:
        case 245:
        case 165:
        case 178:
        case 179:
        case 49:
        case 50:
        case 168:
        case 169:
        case 175:
        case 170:
        case 171:
        case 172:
        case 97:
        case 76:
        case 32:
        case 173:
        case 35:
          return -1;
        case 176:
        case 177:
        case 7:
        case 155:
        case 8:
        case 157:
        case 125:
        case 126:
        case 92:
        case 93:
        case 129:
        case 130:
        case 131:
        case 94:
        case 91:
          return 1;
        case 74:
        case 60:
        case 69:
        case 70:
        case 4:
          return 1024;
        case 31:
        case 42:
        case 72:
          return 32;
        case 87:
        case 26:
        case 33:
          return 2147483647;
        case 34:
        case 1:
          return 47839;
        case 38:
        case 36:
          return 99;
        case 43:
        case 37:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 28: return 32768;
        case 44: return 32767;
        case 75: return 16384;
        case 39: return 1000;
        case 89: return 700;
        case 71: return 256;
        case 40: return 255;
        case 2: return 100;
        case 180: return 64;
        case 25: return 20;
        case 5: return 16;
        case 6: return 6;
        case 73: return 4;
        case 84: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }

  
  
  
  function _mkport() { throw 'TODO' }var SOCKFS={mount:function (mount) {
        return FS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
      },createSocket:function (family, type, protocol) {
        var streaming = type == 1;
        if (protocol) {
          assert(streaming == (protocol == 6)); // if SOCK_STREAM, must be tcp
        }
  
        // create our internal socket structure
        var sock = {
          family: family,
          type: type,
          protocol: protocol,
          server: null,
          peers: {},
          pending: [],
          recv_queue: [],
          sock_ops: SOCKFS.websocket_sock_ops
        };
  
        // create the filesystem node to store the socket structure
        var name = SOCKFS.nextname();
        var node = FS.createNode(SOCKFS.root, name, 49152, 0);
        node.sock = sock;
  
        // and the wrapping stream that enables library functions such
        // as read and write to indirectly interact with the socket
        var stream = FS.createStream({
          path: name,
          node: node,
          flags: FS.modeStringToFlags('r+'),
          seekable: false,
          stream_ops: SOCKFS.stream_ops
        });
  
        // map the new stream to the socket structure (sockets have a 1:1
        // relationship with a stream)
        sock.stream = stream;
  
        return sock;
      },getSocket:function (fd) {
        var stream = FS.getStream(fd);
        if (!stream || !FS.isSocket(stream.node.mode)) {
          return null;
        }
        return stream.node.sock;
      },stream_ops:{poll:function (stream) {
          var sock = stream.node.sock;
          return sock.sock_ops.poll(sock);
        },ioctl:function (stream, request, varargs) {
          var sock = stream.node.sock;
          return sock.sock_ops.ioctl(sock, request, varargs);
        },read:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          var msg = sock.sock_ops.recvmsg(sock, length);
          if (!msg) {
            // socket is closed
            return 0;
          }
          buffer.set(msg.buffer, offset);
          return msg.buffer.length;
        },write:function (stream, buffer, offset, length, position /* ignored */) {
          var sock = stream.node.sock;
          return sock.sock_ops.sendmsg(sock, buffer, offset, length);
        },close:function (stream) {
          var sock = stream.node.sock;
          sock.sock_ops.close(sock);
        }},nextname:function () {
        if (!SOCKFS.nextname.current) {
          SOCKFS.nextname.current = 0;
        }
        return 'socket[' + (SOCKFS.nextname.current++) + ']';
      },websocket_sock_ops:{createPeer:function (sock, addr, port) {
          var ws;
  
          if (typeof addr === 'object') {
            ws = addr;
            addr = null;
            port = null;
          }
  
          if (ws) {
            // for sockets that've already connected (e.g. we're the server)
            // we can inspect the _socket property for the address
            if (ws._socket) {
              addr = ws._socket.remoteAddress;
              port = ws._socket.remotePort;
            }
            // if we're just now initializing a connection to the remote,
            // inspect the url property
            else {
              var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
              if (!result) {
                throw new Error('WebSocket URL must be in the format ws(s)://address:port');
              }
              addr = result[1];
              port = parseInt(result[2], 10);
            }
          } else {
            // create the actual websocket object and connect
            try {
              // runtimeConfig gets set to true if WebSocket runtime configuration is available.
              var runtimeConfig = (Module['websocket'] && ('object' === typeof Module['websocket']));
  
              // The default value is 'ws://' the replace is needed because the compiler replaces "//" comments with '#'
              // comments without checking context, so we'd end up with ws:#, the replace swaps the "#" for "//" again.
              var url = 'ws:#'.replace('#', '//');
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['url']) {
                  url = Module['websocket']['url']; // Fetch runtime WebSocket URL config.
                }
              }
  
              if (url === 'ws://' || url === 'wss://') { // Is the supplied URL config just a prefix, if so complete it.
                url = url + addr + ':' + port;
              }
  
              // Make the WebSocket subprotocol (Sec-WebSocket-Protocol) default to binary if no configuration is set.
              var subProtocols = 'binary'; // The default value is 'binary'
  
              if (runtimeConfig) {
                if ('string' === typeof Module['websocket']['subprotocol']) {
                  subProtocols = Module['websocket']['subprotocol']; // Fetch runtime WebSocket subprotocol config.
                }
              }
  
              // The regex trims the string (removes spaces at the beginning and end, then splits the string by
              // <any space>,<any space> into an Array. Whitespace removal is important for Websockify and ws.
              subProtocols = subProtocols.replace(/^ +| +$/g,"").split(/ *, */);
  
              // The node ws library API for specifying optional subprotocol is slightly different than the browser's.
              var opts = ENVIRONMENT_IS_NODE ? {'protocol': subProtocols.toString()} : subProtocols;
  
              // If node we use the ws library.
              var WebSocket = ENVIRONMENT_IS_NODE ? require('ws') : window['WebSocket'];
              ws = new WebSocket(url, opts);
              ws.binaryType = 'arraybuffer';
            } catch (e) {
              throw new FS.ErrnoError(ERRNO_CODES.EHOSTUNREACH);
            }
          }
  
  
          var peer = {
            addr: addr,
            port: port,
            socket: ws,
            dgram_send_queue: []
          };
  
          SOCKFS.websocket_sock_ops.addPeer(sock, peer);
          SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);
  
          // if this is a bound dgram socket, send the port number first to allow
          // us to override the ephemeral port reported to us by remotePort on the
          // remote end.
          if (sock.type === 2 && typeof sock.sport !== 'undefined') {
            peer.dgram_send_queue.push(new Uint8Array([
                255, 255, 255, 255,
                'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
                ((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
            ]));
          }
  
          return peer;
        },getPeer:function (sock, addr, port) {
          return sock.peers[addr + ':' + port];
        },addPeer:function (sock, peer) {
          sock.peers[peer.addr + ':' + peer.port] = peer;
        },removePeer:function (sock, peer) {
          delete sock.peers[peer.addr + ':' + peer.port];
        },handlePeerEvents:function (sock, peer) {
          var first = true;
  
          var handleOpen = function () {
            try {
              var queued = peer.dgram_send_queue.shift();
              while (queued) {
                peer.socket.send(queued);
                queued = peer.dgram_send_queue.shift();
              }
            } catch (e) {
              // not much we can do here in the way of proper error handling as we've already
              // lied and said this data was sent. shut it down.
              peer.socket.close();
            }
          };
  
          function handleMessage(data) {
            assert(typeof data !== 'string' && data.byteLength !== undefined);  // must receive an ArrayBuffer
            data = new Uint8Array(data);  // make a typed array view on the array buffer
  
  
            // if this is the port message, override the peer's port with it
            var wasfirst = first;
            first = false;
            if (wasfirst &&
                data.length === 10 &&
                data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
                data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
              // update the peer's port and it's key in the peer map
              var newport = ((data[8] << 8) | data[9]);
              SOCKFS.websocket_sock_ops.removePeer(sock, peer);
              peer.port = newport;
              SOCKFS.websocket_sock_ops.addPeer(sock, peer);
              return;
            }
  
            sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
          };
  
          if (ENVIRONMENT_IS_NODE) {
            peer.socket.on('open', handleOpen);
            peer.socket.on('message', function(data, flags) {
              if (!flags.binary) {
                return;
              }
              handleMessage((new Uint8Array(data)).buffer);  // copy from node Buffer -> ArrayBuffer
            });
            peer.socket.on('error', function() {
              // don't throw
            });
          } else {
            peer.socket.onopen = handleOpen;
            peer.socket.onmessage = function peer_socket_onmessage(event) {
              handleMessage(event.data);
            };
          }
        },poll:function (sock) {
          if (sock.type === 1 && sock.server) {
            // listen sockets should only say they're available for reading
            // if there are pending clients.
            return sock.pending.length ? (64 | 1) : 0;
          }
  
          var mask = 0;
          var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
            SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
            null;
  
          if (sock.recv_queue.length ||
              !dest ||  // connection-less sockets are always ready to read
              (dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
            mask |= (64 | 1);
          }
  
          if (!dest ||  // connection-less sockets are always ready to write
              (dest && dest.socket.readyState === dest.socket.OPEN)) {
            mask |= 4;
          }
  
          if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
              (dest && dest.socket.readyState === dest.socket.CLOSED)) {
            mask |= 16;
          }
  
          return mask;
        },ioctl:function (sock, request, arg) {
          switch (request) {
            case 21531:
              var bytes = 0;
              if (sock.recv_queue.length) {
                bytes = sock.recv_queue[0].data.length;
              }
              HEAP32[((arg)>>2)]=bytes;
              return 0;
            default:
              return ERRNO_CODES.EINVAL;
          }
        },close:function (sock) {
          // if we've spawned a listen server, close it
          if (sock.server) {
            try {
              sock.server.close();
            } catch (e) {
            }
            sock.server = null;
          }
          // close any peer connections
          var peers = Object.keys(sock.peers);
          for (var i = 0; i < peers.length; i++) {
            var peer = sock.peers[peers[i]];
            try {
              peer.socket.close();
            } catch (e) {
            }
            SOCKFS.websocket_sock_ops.removePeer(sock, peer);
          }
          return 0;
        },bind:function (sock, addr, port) {
          if (typeof sock.saddr !== 'undefined' || typeof sock.sport !== 'undefined') {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already bound
          }
          sock.saddr = addr;
          sock.sport = port || _mkport();
          // in order to emulate dgram sockets, we need to launch a listen server when
          // binding on a connection-less socket
          // note: this is only required on the server side
          if (sock.type === 2) {
            // close the existing server if it exists
            if (sock.server) {
              sock.server.close();
              sock.server = null;
            }
            // swallow error operation not supported error that occurs when binding in the
            // browser where this isn't supported
            try {
              sock.sock_ops.listen(sock, 0);
            } catch (e) {
              if (!(e instanceof FS.ErrnoError)) throw e;
              if (e.errno !== ERRNO_CODES.EOPNOTSUPP) throw e;
            }
          }
        },connect:function (sock, addr, port) {
          if (sock.server) {
            throw new FS.ErrnoError(ERRNO_CODS.EOPNOTSUPP);
          }
  
          // TODO autobind
          // if (!sock.addr && sock.type == 2) {
          // }
  
          // early out if we're already connected / in the middle of connecting
          if (typeof sock.daddr !== 'undefined' && typeof sock.dport !== 'undefined') {
            var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
            if (dest) {
              if (dest.socket.readyState === dest.socket.CONNECTING) {
                throw new FS.ErrnoError(ERRNO_CODES.EALREADY);
              } else {
                throw new FS.ErrnoError(ERRNO_CODES.EISCONN);
              }
            }
          }
  
          // add the socket to our peer list and set our
          // destination address / port to match
          var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
          sock.daddr = peer.addr;
          sock.dport = peer.port;
  
          // always "fail" in non-blocking mode
          throw new FS.ErrnoError(ERRNO_CODES.EINPROGRESS);
        },listen:function (sock, backlog) {
          if (!ENVIRONMENT_IS_NODE) {
            throw new FS.ErrnoError(ERRNO_CODES.EOPNOTSUPP);
          }
          if (sock.server) {
             throw new FS.ErrnoError(ERRNO_CODES.EINVAL);  // already listening
          }
          var WebSocketServer = require('ws').Server;
          var host = sock.saddr;
          sock.server = new WebSocketServer({
            host: host,
            port: sock.sport
            // TODO support backlog
          });
  
          sock.server.on('connection', function(ws) {
            if (sock.type === 1) {
              var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);
  
              // create a peer on the new socket
              var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
              newsock.daddr = peer.addr;
              newsock.dport = peer.port;
  
              // push to queue for accept to pick up
              sock.pending.push(newsock);
            } else {
              // create a peer on the listen socket so calling sendto
              // with the listen socket and an address will resolve
              // to the correct client
              SOCKFS.websocket_sock_ops.createPeer(sock, ws);
            }
          });
          sock.server.on('closed', function() {
            sock.server = null;
          });
          sock.server.on('error', function() {
            // don't throw
          });
        },accept:function (listensock) {
          if (!listensock.server) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
          var newsock = listensock.pending.shift();
          newsock.stream.flags = listensock.stream.flags;
          return newsock;
        },getname:function (sock, peer) {
          var addr, port;
          if (peer) {
            if (sock.daddr === undefined || sock.dport === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            }
            addr = sock.daddr;
            port = sock.dport;
          } else {
            // TODO saddr and sport will be set for bind()'d UDP sockets, but what
            // should we be returning for TCP sockets that've been connect()'d?
            addr = sock.saddr || 0;
            port = sock.sport || 0;
          }
          return { addr: addr, port: port };
        },sendmsg:function (sock, buffer, offset, length, addr, port) {
          if (sock.type === 2) {
            // connection-less sockets will honor the message address,
            // and otherwise fall back to the bound destination address
            if (addr === undefined || port === undefined) {
              addr = sock.daddr;
              port = sock.dport;
            }
            // if there was no address to fall back to, error out
            if (addr === undefined || port === undefined) {
              throw new FS.ErrnoError(ERRNO_CODES.EDESTADDRREQ);
            }
          } else {
            // connection-based sockets will only use the bound
            addr = sock.daddr;
            port = sock.dport;
          }
  
          // find the peer for the destination address
          var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);
  
          // early out if not connected with a connection-based socket
          if (sock.type === 1) {
            if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
              throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
            } else if (dest.socket.readyState === dest.socket.CONNECTING) {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // create a copy of the incoming data to send, as the WebSocket API
          // doesn't work entirely with an ArrayBufferView, it'll just send
          // the entire underlying buffer
          var data;
          if (buffer instanceof Array || buffer instanceof ArrayBuffer) {
            data = buffer.slice(offset, offset + length);
          } else {  // ArrayBufferView
            data = buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + length);
          }
  
          // if we're emulating a connection-less dgram socket and don't have
          // a cached connection, queue the buffer to send upon connect and
          // lie, saying the data was sent now.
          if (sock.type === 2) {
            if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
              // if we're not connected, open a new connection
              if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
              }
              dest.dgram_send_queue.push(data);
              return length;
            }
          }
  
          try {
            // send the actual data
            dest.socket.send(data);
            return length;
          } catch (e) {
            throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
          }
        },recvmsg:function (sock, length) {
          // http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
          if (sock.type === 1 && sock.server) {
            // tcp servers should not be recv()'ing on the listen socket
            throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
          }
  
          var queued = sock.recv_queue.shift();
          if (!queued) {
            if (sock.type === 1) {
              var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
  
              if (!dest) {
                // if we have a destination address but are not connected, error out
                throw new FS.ErrnoError(ERRNO_CODES.ENOTCONN);
              }
              else if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
                // return null if the socket has closed
                return null;
              }
              else {
                // else, our socket is in a valid state but truly has nothing available
                throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
              }
            } else {
              throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
            }
          }
  
          // queued.data will be an ArrayBuffer if it's unadulterated, but if it's
          // requeued TCP data it'll be an ArrayBufferView
          var queuedLength = queued.data.byteLength || queued.data.length;
          var queuedOffset = queued.data.byteOffset || 0;
          var queuedBuffer = queued.data.buffer || queued.data;
          var bytesRead = Math.min(length, queuedLength);
          var res = {
            buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
            addr: queued.addr,
            port: queued.port
          };
  
  
          // push back any unread data for TCP connections
          if (sock.type === 1 && bytesRead < queuedLength) {
            var bytesRemaining = queuedLength - bytesRead;
            queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
            sock.recv_queue.unshift(queued);
          }
  
          return res;
        }}};function _recv(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _read(fd, buf, len);
    }
  
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.read(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }

  function ___errno_location() {
      return ___errno_state;
    }

   
  Module["_memset"] = _memset;

  
  function _strerror_r(errnum, strerrbuf, buflen) {
      if (errnum in ERRNO_MESSAGES) {
        if (ERRNO_MESSAGES[errnum].length > buflen - 1) {
          return ___setErrNo(ERRNO_CODES.ERANGE);
        } else {
          var msg = ERRNO_MESSAGES[errnum];
          writeAsciiToMemory(msg, strerrbuf);
          return 0;
        }
      } else {
        return ___setErrNo(ERRNO_CODES.EINVAL);
      }
    }
  
  function _malloc(bytes) {
      /* Over-allocate to make sure it is byte-aligned by 8.
       * This will leak memory, but this is only the dummy
       * implementation (replaced by dlmalloc normally) so
       * not an issue.
       */
      var ptr = Runtime.dynamicAlloc(bytes + 8);
      return (ptr+8) & 0xFFFFFFF8;
    }
  Module["_malloc"] = _malloc;function _strerror(errnum) {
      if (!_strerror.buffer) _strerror.buffer = _malloc(256);
      _strerror_r(errnum, _strerror.buffer, 256);
      return _strerror.buffer;
    }

  function _abort() {
      Module['abort']();
    }

  
  
  
  function _send(fd, buf, len, flags) {
      var sock = SOCKFS.getSocket(fd);
      if (!sock) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      // TODO honor flags
      return _write(fd, buf, len);
    }
  
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte, offset);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
  
  
      try {
        var slab = HEAP8;
        return FS.write(stream, slab, buf, nbyte);
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }
  
  function _fileno(stream) {
      // int fileno(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fileno.html
      stream = FS.getStreamFromPtr(stream);
      if (!stream) return -1;
      return stream.fd;
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var fd = _fileno(stream);
      var bytesWritten = _write(fd, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  
  
   
  Module["_strlen"] = _strlen;
  
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = (HEAP32[((tempDoublePtr)>>2)]=HEAP32[(((varargs)+(argIndex))>>2)],HEAP32[(((tempDoublePtr)+(4))>>2)]=HEAP32[(((varargs)+((argIndex)+(4)))>>2)],(+(HEAPF64[(tempDoublePtr)>>3])));
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+4))>>2)]];
  
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Runtime.getNativeFieldSize(type);
        return ret;
      }
  
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[((textIndex)>>0)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)>>0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          var flagPadSign = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              case 32:
                flagPadSign = true;
                break;
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)>>0)];
          }
  
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)>>0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)>>0)];
            }
          }
  
          // Handle precision.
          var precisionSet = false, precision = -1;
          if (next == 46) {
            precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)>>0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)>>0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)>>0)];
          }
          if (precision < 0) {
            precision = 6; // Standard default.
            precisionSet = false;
          }
  
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)>>0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)>>0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)>>0)];
  
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
  
              // Add sign if needed
              if (currArg >= 0) {
                if (flagAlwaysSigned) {
                  prefix = '+' + prefix;
                } else if (flagPadSign) {
                  prefix = ' ' + prefix;
                }
              }
  
              // Move sign to prefix so we zero-pad after the sign
              if (argText.charAt(0) == '-') {
                prefix = '-' + prefix;
                argText = argText.substr(1);
              }
  
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
  
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
  
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
  
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
  
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
  
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
  
                // Add sign.
                if (currArg >= 0) {
                  if (flagAlwaysSigned) {
                    argText = '+' + argText;
                  } else if (flagPadSign) {
                    argText = ' ' + argText;
                  }
                }
              }
  
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
  
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
  
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)>>0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length;
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[((i)>>0)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _fprintf(stream, format, varargs) {
      // int fprintf(FILE *restrict stream, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var stack = Runtime.stackSave();
      var ret = _fwrite(allocate(result, 'i8', ALLOC_STACK), 1, result.length, stream);
      Runtime.stackRestore(stack);
      return ret;
    }

  function _printf(format, varargs) {
      // int printf(const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var stdout = HEAP32[((_stdout)>>2)];
      return _fprintf(stdout, format, varargs);
    }

  function _close(fildes) {
      // int close(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/close.html
      var stream = FS.getStream(fildes);
      if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
      try {
        FS.close(stream);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }


  function _open(path, oflag, varargs) {
      // int open(const char *path, int oflag, ...);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/open.html
      var mode = HEAP32[((varargs)>>2)];
      path = Pointer_stringify(path);
      try {
        var stream = FS.open(path, oflag, mode);
        return stream.fd;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }

  
  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
      return dest;
    } 
  Module["_memcpy"] = _memcpy;

  
  function _fputc(c, stream) {
      // int fputc(int c, FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fputc.html
      var chr = unSign(c & 0xFF);
      HEAP8[((_fputc.ret)>>0)]=chr;
      var fd = _fileno(stream);
      var ret = _write(fd, _fputc.ret, 1);
      if (ret == -1) {
        var streamObj = FS.getStreamFromPtr(stream);
        if (streamObj) streamObj.error = true;
        return -1;
      } else {
        return chr;
      }
    }function _putchar(c) {
      // int putchar(int c);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/putchar.html
      return _fputc(c, HEAP32[((_stdout)>>2)]);
    }

  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }


  
  function _mknod(path, mode, dev) {
      // int mknod(const char *path, mode_t mode, dev_t dev);
      // http://pubs.opengroup.org/onlinepubs/7908799/xsh/mknod.html
      path = Pointer_stringify(path);
      // we don't want this in the JS API as the JS API
      // uses mknod to create all nodes.
      switch (mode & 61440) {
        case 32768:
        case 8192:
        case 24576:
        case 4096:
        case 49152:
          break;
        default:
          ___setErrNo(ERRNO_CODES.EINVAL);
          return -1;
      }
      try {
        FS.mknod(path, mode, dev);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }function _mkdir(path, mode) {
      // int mkdir(const char *path, mode_t mode);
      // http://pubs.opengroup.org/onlinepubs/7908799/xsh/mkdir.html
      path = Pointer_stringify(path);
      // remove a trailing slash, if one - /a/b/ has basename of '', but
      // we want to create b in the context of this function
      if (path[path.length-1] === '/') path = path.substr(0, path.length-1);
      try {
        FS.mkdir(path, mode, 0);
        return 0;
      } catch (e) {
        FS.handleFSError(e);
        return -1;
      }
    }

  function _system(command) {
      // int system(const char *command);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/system.html
      // Can't call external programs.
      ___setErrNo(ERRNO_CODES.EAGAIN);
      return -1;
    }


   
  Module["_strcpy"] = _strcpy;

  
  function __exit(status) {
      // void _exit(int status);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/exit.html
      Module['exit'](status);
    }function _exit(status) {
      __exit(status);
    }

  
  function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))>>0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))>>0)]=0;
      return result.length;
    }function _sprintf(s, format, varargs) {
      // int sprintf(char *restrict s, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      return _snprintf(s, undefined, format, varargs);
    }

  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret;
      }
      return ret;
    }

  var Browser={mainLoop:{scheduler:null,method:"",shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
  
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
  
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : undefined;
        if (!Module.noImageDecoding && typeof Browser.URLObject === 'undefined') {
          console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
          Module.noImageDecoding = true;
        }
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function img_onload() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function img_onerror(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function audio_onerror(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
  
        // Canvas event setup
  
        var canvas = Module['canvas'];
        if (canvas) {
          // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
          // Module['forcedAspectRatio'] = 4 / 3;
          
          canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                      canvas['mozRequestPointerLock'] ||
                                      canvas['webkitRequestPointerLock'] ||
                                      canvas['msRequestPointerLock'] ||
                                      function(){};
          canvas.exitPointerLock = document['exitPointerLock'] ||
                                   document['mozExitPointerLock'] ||
                                   document['webkitExitPointerLock'] ||
                                   document['msExitPointerLock'] ||
                                   function(){}; // no-op if function does not exist
          canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
          function pointerLockChange() {
            Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                  document['mozPointerLockElement'] === canvas ||
                                  document['webkitPointerLockElement'] === canvas ||
                                  document['msPointerLockElement'] === canvas;
          }
  
          document.addEventListener('pointerlockchange', pointerLockChange, false);
          document.addEventListener('mozpointerlockchange', pointerLockChange, false);
          document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
          document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
          if (Module['elementPointerLock']) {
            canvas.addEventListener("click", function(ev) {
              if (!Browser.pointerLock && canvas.requestPointerLock) {
                canvas.requestPointerLock();
                ev.preventDefault();
              }
            }, false);
          }
        }
      },createContext:function (canvas, useWebGL, setInModule, webGLContextAttributes) {
        var ctx;
        var errorInfo = '?';
        function onContextCreationError(event) {
          errorInfo = event.statusMessage || errorInfo;
        }
        try {
          if (useWebGL) {
            var contextAttributes = {
              antialias: false,
              alpha: false
            };
  
            if (webGLContextAttributes) {
              for (var attribute in webGLContextAttributes) {
                contextAttributes[attribute] = webGLContextAttributes[attribute];
              }
            }
  
  
            canvas.addEventListener('webglcontextcreationerror', onContextCreationError, false);
            try {
              ['experimental-webgl', 'webgl'].some(function(webglId) {
                return ctx = canvas.getContext(webglId, contextAttributes);
              });
            } finally {
              canvas.removeEventListener('webglcontextcreationerror', onContextCreationError, false);
            }
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas: ' + [errorInfo, e]);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
  
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          GLctx = Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          var canvasContainer = canvas.parentNode;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement'] ||
               document['msFullScreenElement'] || document['msFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'] ||
                                      document['msExitFullscreen'] ||
                                      document['exitFullscreen'] ||
                                      function() {};
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else {
            
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
            
            if (Browser.resizeCanvas) Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
          Browser.updateCanvasDimensions(canvas);
        }
  
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
          document.addEventListener('MSFullscreenChange', fullScreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
        
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullScreen = canvasContainer['requestFullScreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullScreen'] ? function() { canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvasContainer.requestFullScreen();
      },requestAnimationFrame:function requestAnimationFrame(func) {
        if (typeof window === 'undefined') { // Provide fallback to setTimeout if window is undefined (e.g. in Node.js)
          setTimeout(func, 1000/60);
        } else {
          if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                           window['mozRequestAnimationFrame'] ||
                                           window['webkitRequestAnimationFrame'] ||
                                           window['msRequestAnimationFrame'] ||
                                           window['oRequestAnimationFrame'] ||
                                           window['setTimeout'];
          }
          window.requestAnimationFrame(func);
        }
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        Module['noExitRuntime'] = true;
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        Module['noExitRuntime'] = true;
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },getMouseWheelDelta:function (event) {
        return Math.max(-1, Math.min(1, event.type === 'DOMMouseScroll' ? event.detail : -event.wheelDelta));
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,touches:{},lastTouches:{},calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
  
          // Neither .scrollX or .pageXOffset are defined in a spec, but
          // we prefer .scrollX because it is currently in a spec draft.
          // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
          var scrollX = ((typeof window.scrollX !== 'undefined') ? window.scrollX : window.pageXOffset);
          var scrollY = ((typeof window.scrollY !== 'undefined') ? window.scrollY : window.pageYOffset);
  
          if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
            var touch = event.touch;
            if (touch === undefined) {
              return; // the "touch" property is only defined in SDL
  
            }
            var adjustedX = touch.pageX - (scrollX + rect.left);
            var adjustedY = touch.pageY - (scrollY + rect.top);
  
            adjustedX = adjustedX * (cw / rect.width);
            adjustedY = adjustedY * (ch / rect.height);
  
            var coords = { x: adjustedX, y: adjustedY };
            
            if (event.type === 'touchstart') {
              Browser.lastTouches[touch.identifier] = coords;
              Browser.touches[touch.identifier] = coords;
            } else if (event.type === 'touchend' || event.type === 'touchmove') {
              Browser.lastTouches[touch.identifier] = Browser.touches[touch.identifier];
              Browser.touches[touch.identifier] = { x: adjustedX, y: adjustedY };
            } 
            return;
          }
  
          var x = event.pageX - (scrollX + rect.left);
          var y = event.pageY - (scrollY + rect.top);
  
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
  
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function xhr_onload() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },updateCanvasDimensions:function (canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
             document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
             document['fullScreenElement'] || document['fullscreenElement'] ||
             document['msFullScreenElement'] || document['msFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      }};


FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
__ATINIT__.unshift({ func: function() { TTY.init() } });__ATEXIT__.push({ func: function() { TTY.shutdown() } });TTY.utf8 = new Runtime.UTF8Processor();
if (ENVIRONMENT_IS_NODE) { var fs = require("fs"); NODEFS.staticInit(); }
__ATINIT__.push({ func: function() { SOCKFS.root = FS.mount(SOCKFS, {}, null); } });
_fputc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) { Browser.requestAnimationFrame(func) };
  Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) { Browser.setCanvasSize(width, height, noUpdates) };
  Module["pauseMainLoop"] = function Module_pauseMainLoop() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function Module_resumeMainLoop() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function Module_getUserMedia() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);

staticSealed = true; // seal the static portion of memory

STACK_MAX = STACK_BASE + 5242880;

DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);

assert(DYNAMIC_BASE < TOTAL_MEMORY, "TOTAL_MEMORY not big enough for stack");


var Math_min = Math.min;
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env._stderr|0;var n=env._stdout|0;var o=0;var p=0;var q=0;var r=0;var s=+env.NaN,t=+env.Infinity;var u=0,v=0,w=0,x=0,y=0.0,z=0,A=0,B=0,C=0.0;var D=0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=0;var N=global.Math.floor;var O=global.Math.abs;var P=global.Math.sqrt;var Q=global.Math.pow;var R=global.Math.cos;var S=global.Math.sin;var T=global.Math.tan;var U=global.Math.acos;var V=global.Math.asin;var W=global.Math.atan;var X=global.Math.atan2;var Y=global.Math.exp;var Z=global.Math.log;var _=global.Math.ceil;var $=global.Math.imul;var aa=env.abort;var ba=env.assert;var ca=env.asmPrintInt;var da=env.asmPrintFloat;var ea=env.min;var fa=env._send;var ga=env._lseek;var ha=env.___setErrNo;var ia=env._system;var ja=env._fflush;var ka=env._pwrite;var la=env._strerror_r;var ma=env._open;var na=env._sbrk;var oa=env._snprintf;var pa=env._emscripten_memcpy_big;var qa=env._fileno;var ra=env._sysconf;var sa=env._close;var ta=env.__formatString;var ua=env._putchar;var va=env._pread;var wa=env._printf;var xa=env._sprintf;var ya=env.__reallyNegative;var za=env._write;var Aa=env.___errno_location;var Ba=env._recv;var Ca=env._fputc;var Da=env._mkport;var Ea=env.__exit;var Fa=env._read;var Ga=env._abort;var Ha=env._fwrite;var Ia=env._time;var Ja=env._fprintf;var Ka=env._strerror;var La=env._mknod;var Ma=env._mkdir;var Na=env._exit;var Oa=0.0;
// EMSCRIPTEN_START_FUNCS
function Pa(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7&-8;return b|0}function Qa(){return i|0}function Ra(a){a=a|0;i=a}function Sa(a,b){a=a|0;b=b|0;if((o|0)==0){o=a;p=b}}function Ta(b){b=b|0;a[k>>0]=a[b>>0];a[k+1>>0]=a[b+1>>0];a[k+2>>0]=a[b+2>>0];a[k+3>>0]=a[b+3>>0]}function Ua(b){b=b|0;a[k>>0]=a[b>>0];a[k+1>>0]=a[b+1>>0];a[k+2>>0]=a[b+2>>0];a[k+3>>0]=a[b+3>>0];a[k+4>>0]=a[b+4>>0];a[k+5>>0]=a[b+5>>0];a[k+6>>0]=a[b+6>>0];a[k+7>>0]=a[b+7>>0]}function Va(a){a=a|0;D=a}function Wa(){return D|0}function Xa(a){a=a|0;var b=0,d=0,e=0;b=i;i=i+16|0;d=b;e=c[n>>2]|0;c[d>>2]=a;c[d+4>>2]=24;c[d+8>>2]=32;Ja(e|0,8,d|0)|0;Ha(48,29,1,e|0)|0;c[d>>2]=112;Ja(e|0,80,d|0)|0;c[d>>2]=a;Ja(e|0,152,d|0)|0;Ha(192,10,1,e|0)|0;Ha(208,29,1,e|0)|0;Ha(240,20,1,e|0)|0;c[d>>2]=320;Ja(e|0,264,d|0)|0;Ha(328,35,1,e|0)|0;Ha(368,58,1,e|0)|0;Ha(432,17,1,e|0)|0;Ha(456,33,1,e|0)|0;c[d>>2]=320;Ja(e|0,496,d|0)|0;c[d>>2]=a;Ja(e|0,568,d|0)|0;i=b;return 0}function Ya(b){b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0;d=i;f=a[b>>0]|0;if(f<<24>>24==0){k=1}else{k=1;g=b;do{g=g+1|0;k=k+1|0}while((a[g>>0]|0)!=0)}g=c[160]|0;h=(c[162]|0)-g|0;j=c[158]|0;do{if((h+k|0)>=(j|0)){l=j+512|0;c[158]=l;g=nb(g,l)|0;c[162]=g;if((g|0)!=0){c[160]=g;f=g+h|0;c[162]=f;a[f>>0]=0;f=a[b>>0]|0;break}l=nb(c[160]|0,0)|0;i=d;return l|0}}while(0);j=a[g>>0]|0;a:do{if(j<<24>>24==0){h=1;e=14}else{h=1;k=g;while(1){if(j<<24>>24==f<<24>>24){j=f;l=b;do{if(j<<24>>24==0){break a}k=k+1|0;l=l+1|0;j=a[k>>0]|0}while(j<<24>>24==(a[l>>0]|0))}k=k+1|0;if(!(j<<24>>24==0)){while(1){j=k+1|0;if((a[k>>0]|0)==0){k=j;break}else{k=j}}}h=h+1|0;j=a[k>>0]|0;if(j<<24>>24==0){e=14;break}}}}while(0);if((e|0)==14){h=f<<24>>24==0?h:0}if((h|0)!=0){l=g;i=d;return l|0}while(1){b=b+1|0;l=c[162]|0;c[162]=l+1;a[l>>0]=f;if(f<<24>>24==0){break}f=a[b>>0]|0}a[c[162]>>0]=0;l=c[160]|0;i=d;return l|0}function Za(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,n=0;g=i;i=i+16|0;k=g;j=d;h=0;do{n=za(a|0,b+h|0,j|0)|0;if((n|0)==-1){l=3;break}h=n+h|0;j=d-h|0}while((n|0)>0&(j|0)>0);if((l|0)==3){n=c[m>>2]|0;b=Ka(c[(Aa()|0)>>2]|0)|0;c[k>>2]=f;c[k+4>>2]=e;c[k+8>>2]=b;Ja(n|0,840,k|0)|0;n=-1;i=g;return n|0}if((h|0)>=(d|0)){n=h;i=g;return n|0}n=c[m>>2]|0;c[k>>2]=f;c[k+4>>2]=d;c[k+8>>2]=e;Ja(n|0,872,k|0)|0;n=-1;i=g;return n|0}function _a(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,n=0,o=0,p=0,q=0;f=i;i=i+80|0;h=f;k=f+16|0;l=0;n=b;while(1){o=a[n>>0]|0;if(o<<24>>24==47){l=l+1|0}else if(o<<24>>24==0){break}n=n+1|0}if((l|0)>0){n=0}else{p=0;i=f;return p|0}while(1){p=0;o=0;while(1){q=a[b+o>>0]|0;a[k+o>>0]=q;p=(q<<24>>24==47)+p|0;if((p|0)>(n|0)){break}else{o=o+1|0}}a[k+o>>0]=0;if((Ma(k|0,d|0)|0)==-1?(j=c[(Aa()|0)>>2]|0,(j|0)!=17):0){break}n=n+1|0;if((n|0)>=(l|0)){e=0;g=12;break}}if((g|0)==12){i=f;return e|0}q=c[m>>2]|0;p=Ka(j|0)|0;c[h>>2]=e;c[h+4>>2]=k;c[h+8>>2]=p;Ja(q|0,912,h|0)|0;q=-1;i=f;return q|0}function $a(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,n=0,o=0,p=0,q=0,r=0;h=i;i=i+32|0;g=h;l=h+16|0;if((b|0)==0){r=-1;i=h;return r|0}a[b+0>>0]=a[952>>0]|0;a[b+1>>0]=a[953>>0]|0;a[b+2>>0]=a[954>>0]|0;a[b+3>>0]=a[955>>0]|0;a[b+4>>0]=a[956>>0]|0;o=b+8|0;c[o>>2]=12;n=b+12|0;c[n>>2]=0;k=b+16|0;c[k>>2]=12;c[g>>2]=438;j=ma(e|0,0,g|0)|0;if((j|0)==-1){r=c[m>>2]|0;q=Ka(c[(Aa()|0)>>2]|0)|0;c[g>>2]=f;c[g+4>>2]=e;c[g+8>>2]=696;c[g+12>>2]=q;Ja(r|0,656,g|0)|0;r=-1;i=h;return r|0}else{q=12;p=0}while(1){q=Fa(j|0,l+p|0,q|0)|0;if((q|0)==-1){q=5;break}p=q+p|0;r=12-p|0;if((q|0)>0&(r|0)>0){q=r}else{q=7;break}}do{if((q|0)==5){k=c[m>>2]|0;r=Ka(c[(Aa()|0)>>2]|0)|0;c[g>>2]=f;c[g+4>>2]=e;c[g+8>>2]=r;Ja(k|0,808,g|0)|0;k=-1}else if((q|0)==7){if((p|0)<12){if(!((p|0)>-1)){k=-1;break}k=c[m>>2]|0;c[g>>2]=f;c[g+4>>2]=e;Ja(k|0,960,g|0)|0;k=-1;break}r=c[l>>2]|0;a[b>>0]=r;a[b+1>>0]=r>>8;a[b+2>>0]=r>>16;a[b+3>>0]=r>>24;c[o>>2]=(d[l+5>>0]|0)<<8|(d[l+4>>0]|0)|(d[l+6>>0]|0)<<16|(d[l+7>>0]|0)<<24;c[n>>2]=(d[l+9>>0]|0)<<8|(d[l+8>>0]|0)|(d[l+10>>0]|0)<<16|(d[l+11>>0]|0)<<24;l=ga(j|0,0,2)|0;if((l|0)==-1){k=c[m>>2]|0;r=Ka(c[(Aa()|0)>>2]|0)|0;c[g>>2]=f;c[g+4>>2]=e;c[g+8>>2]=r;Ja(k|0,776,g|0)|0;k=-1;break}else{c[k>>2]=l;k=0;break}}}while(0);j=(sa(j|0)|0)==-1;if(j){r=c[m>>2]|0;q=Ka(c[(Aa()|0)>>2]|0)|0;c[g>>2]=f;c[g+4>>2]=e;c[g+8>>2]=q;Ja(r|0,728,g|0)|0}r=j?-1:k;i=h;return r|0}function ab(b,e,f,g){b=b|0;e=e|0;f=f|0;g=g|0;var h=0,j=0,k=0,l=0;j=i;i=i+32|0;h=j;k=j+16|0;if((b|0)==0){l=-1;i=j;return l|0}e=e|65;c[h>>2]=438;l=ma(f|0,e|0,h|0)|0;if((l|0)==-1){b=c[m>>2]|0;k=Ka(c[(Aa()|0)>>2]|0)|0;c[h>>2]=g;c[h+4>>2]=f;c[h+8>>2]=(e&3|0)==1?704:712;c[h+12>>2]=k;Ja(b|0,656,h|0)|0;l=-1;i=j;return l|0}c[k>>2]=d[b>>0]|d[b+1>>0]<<8|d[b+2>>0]<<16|d[b+3>>0]<<24;e=c[b+8>>2]|0;a[k+4>>0]=e;a[k+5>>0]=e>>>8;a[k+6>>0]=e>>>16;a[k+7>>0]=e>>>24;e=c[b+12>>2]|0;a[k+8>>0]=e;a[k+9>>0]=e>>>8;a[k+10>>0]=e>>>16;a[k+11>>0]=e>>>24;e=((Za(l,k,12,f,g)|0)==-1)<<31>>31;if(!((sa(l|0)|0)==-1)){l=e;i=j;return l|0}l=c[m>>2]|0;b=Ka(c[(Aa()|0)>>2]|0)|0;c[h>>2]=g;c[h+4>>2]=f;c[h+8>>2]=b;Ja(l|0,728,h|0)|0;l=e;i=j;return l|0}function bb(a,b,d){a=a|0;b=b|0;d=d|0;var e=0,f=0,g=0,j=0;e=i;i=i+16|0;f=e;if((qb(a,952)|0)!=0){j=c[m>>2]|0;c[f>>2]=d;c[f+4>>2]=b;c[f+8>>2]=1064;Ja(j|0,1016,f|0)|0;j=-1;i=e;return j|0}g=c[a+8>>2]|0;if((g|0)<12){j=c[m>>2]|0;c[f>>2]=d;c[f+4>>2]=b;c[f+8>>2]=g;Ja(j|0,1088,f|0)|0;j=-1;i=e;return j|0}j=c[a+12>>2]|0;if((j|0)<0){g=c[m>>2]|0;c[f>>2]=d;c[f+4>>2]=b;c[f+8>>2]=j;Ja(g|0,1144,f|0)|0;j=-1;i=e;return j|0}if((c[a+16>>2]|0)!=(j+g|0)){j=c[m>>2]|0;c[f>>2]=d;c[f+4>>2]=b;c[f+8>>2]=1232;Ja(j|0,1192,f|0)|0;j=-1;i=e;return j|0}if((j&63|0)==0){j=(j|0)/64|0;i=e;return j|0}else{g=c[m>>2]|0;c[f>>2]=d;c[f+4>>2]=b;a=f+8|0;h[k>>3]=+(j|0)*.015625;c[a>>2]=c[k>>2];c[a+4>>2]=c[k+4>>2];Ja(g|0,1272,f|0)|0;j=-1;i=e;return j|0}return 0}function cb(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;h=i;i=i+80|0;g=h;l=h+16|0;r=c[b+12>>2]|0;k=(r|0)/64|0;if(!((r+63|0)>>>0<127)){n=k*68|0;q=nb(0,n)|0;if((q|0)==0){A=c[m>>2]|0;c[g>>2]=f;c[g+4>>2]=n;Ja(A|0,1336,g|0)|0;A=0;i=h;return A|0}}else{q=0}t=c[332]|0;if((t|0)>=(k|0)){c[332]=k;if((q|0)==0){A=0;i=h;return A|0}}else{s=k-t|0;n=0;u=t;while(1){p=q+((n+t|0)*68|0)+0|0;o=p+57|0;do{a[p>>0]=0;p=p+1|0}while((p|0)<(o|0));c[q+(u*68|0)+60>>2]=0;c[q+(u*68|0)+64>>2]=0;n=n+1|0;if((n|0)==(s|0)){break}else{u=u+1|0}}c[332]=k}c[g>>2]=438;n=ma(e|0,0,g|0)|0;a:do{if(!((n|0)==-1)){if((ga(n|0,c[b+8>>2]|0,0)|0)==-1){j=c[m>>2]|0;A=Ka(c[(Aa()|0)>>2]|0)|0;c[g>>2]=f;c[g+4>>2]=e;c[g+8>>2]=A;Ja(j|0,776,g|0)|0;j=24;break}b:do{if((r|0)>63){u=l+56|0;w=l+57|0;t=l+58|0;s=l+59|0;x=l+60|0;y=l+61|0;v=l+62|0;b=l+63|0;r=0;c:while(1){A=q+(r*68|0)|0;z=64;o=0;do{p=Fa(n|0,l+o|0,z|0)|0;if((p|0)==-1){j=17;break c}o=p+o|0;z=64-o|0}while((p|0)>0&(z|0)>0);if((o|0)<64){break}p=A+0|0;z=l+0|0;o=p+56|0;do{a[p>>0]=a[z>>0]|0;p=p+1|0;z=z+1|0}while((p|0)<(o|0));c[q+(r*68|0)+60>>2]=(d[w>>0]|0)<<8|(d[u>>0]|0)|(d[t>>0]|0)<<16|(d[s>>0]|0)<<24;c[q+(r*68|0)+64>>2]=(d[y>>0]|0)<<8|(d[x>>0]|0)|(d[v>>0]|0)<<16|(d[b>>0]|0)<<24;r=r+1|0;if((r|0)>=(k|0)){break b}}if((j|0)==17){A=c[m>>2]|0;z=Ka(c[(Aa()|0)>>2]|0)|0;c[g>>2]=f;c[g+4>>2]=e;c[g+8>>2]=z;Ja(A|0,808,g|0)|0;j=24;break a}if(!((o|0)>-1)){j=24;break a}j=c[m>>2]|0;c[g>>2]=f;c[g+4>>2]=e;c[g+8>>2]=1376;Ja(j|0,1192,g|0)|0;j=24;break a}}while(0);if((q|0)==0){j=24}}else{j=c[m>>2]|0;A=Ka(c[(Aa()|0)>>2]|0)|0;c[g>>2]=f;c[g+4>>2]=e;c[g+8>>2]=696;c[g+12>>2]=A;Ja(j|0,656,g|0)|0;j=24}}while(0);if((j|0)==24){j=c[332]|0;if((j|0)<0){k=0-j|0;q=0;b=j;while(1){l=0+((q+j|0)*68|0)|0;p=l+0|0;o=p+56|0;do{c[p>>2]=0;p=p+4|0}while((p|0)<(o|0));a[l+56>>0]=0;c[60+(b*68|0)>>2]=0;c[64+(b*68|0)>>2]=0;q=q+1|0;if((q|0)==(k|0)){break}else{b=b+1|0}}}c[332]=0;q=0}j=(sa(n|0)|0)==-1;if(j){A=c[m>>2]|0;z=Ka(c[(Aa()|0)>>2]|0)|0;c[g>>2]=f;c[g+4>>2]=e;c[g+8>>2]=z;Ja(A|0,728,g|0)|0}A=j?0:q;i=h;return A|0}function db(b,d,e,f){b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,j=0,k=0,l=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;g=i;i=i+80|0;h=g;k=g+16|0;c[h>>2]=438;j=ma(e|0,1,h|0)|0;if((j|0)==-1){w=c[m>>2]|0;v=Ka(c[(Aa()|0)>>2]|0)|0;c[h>>2]=f;c[h+4>>2]=e;c[h+8>>2]=704;c[h+12>>2]=v;Ja(w|0,656,h|0)|0;w=-1;i=g;return w|0}a:do{if(!((ga(j|0,c[b+8>>2]|0,0)|0)==-1)){w=c[b+12>>2]|0;b=(w|0)/64|0;if((w|0)>63){n=k+56|0;t=k+57|0;p=k+58|0;q=k+59|0;r=k+60|0;s=k+61|0;l=k+62|0;o=k+63|0;w=0;while(1){u=k+0|0;v=u+56|0;do{a[u>>0]=0;u=u+1|0}while((u|0)<(v|0));vb(k|0,d+(w*68|0)|0)|0;v=c[d+(w*68|0)+60>>2]|0;a[n>>0]=v;a[t>>0]=v>>>8;a[p>>0]=v>>>16;a[q>>0]=v>>>24;v=c[d+(w*68|0)+64>>2]|0;a[r>>0]=v;a[s>>0]=v>>>8;a[l>>0]=v>>>16;a[o>>0]=v>>>24;w=w+1|0;if((Za(j,k,64,e,f)|0)==-1){k=-1;break a}if((w|0)>=(b|0)){k=0;break}}}else{k=0}}else{k=c[m>>2]|0;w=Ka(c[(Aa()|0)>>2]|0)|0;c[h>>2]=f;c[h+4>>2]=e;c[h+8>>2]=w;Ja(k|0,776,h|0)|0;k=-1}}while(0);j=(sa(j|0)|0)==-1;if(j){w=c[m>>2]|0;v=Ka(c[(Aa()|0)>>2]|0)|0;c[h>>2]=f;c[h+4>>2]=e;c[h+8>>2]=v;Ja(w|0,728,h|0)|0}w=j?-1:k;i=g;return w|0}function eb(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0;l=i;i=i+16|0;k=l;r=a[e>>0]|0;t=r<<24>>24==0;if(!t){n=r;q=1;o=e;do{if(n<<24>>24==0){break}o=o+1|0;do{F=o;o=o+1|0}while((a[F>>0]|0)!=0);q=q+1|0;n=a[o>>0]|0}while(!(n<<24>>24==0));n=q+ -1|0;if((n|0)!=0){o=lb(n)|0;if((o|0)==0){F=c[m>>2]|0;c[k>>2]=j;c[k+4>>2]=n;Ja(F|0,1448,k|0)|0;i=l;return-1}if((n|0)>0){sb(o|0,0,n|0)|0;q=1}else{q=1}}else{q=0;n=0;o=0}}else{q=0;n=0;o=0}u=(d|0)>0;if(u){if((n|0)==0){r=0;s=0;do{t=tb(b+(r*68|0)|0)|0;s=t>>>0>s>>>0?t:s;r=r+1|0}while((r|0)!=(d|0))}else{v=0;s=0;do{w=b+(v*68|0)|0;x=a[w>>0]|0;a:do{if(t){y=1;p=23}else{A=r;y=1;z=e;while(1){if(A<<24>>24==x<<24>>24){A=x;B=w;do{if(A<<24>>24==0){break a}z=z+1|0;B=B+1|0;A=a[z>>0]|0}while(A<<24>>24==(a[B>>0]|0))}z=z+1|0;if(!(A<<24>>24==0)){while(1){A=z+1|0;if((a[z>>0]|0)==0){z=A;break}else{z=A}}}y=y+1|0;A=a[z>>0]|0;if(A<<24>>24==0){p=23;break}}}}while(0);if((p|0)==23){p=0;y=x<<24>>24==0?y:0}if((y|0)!=0){w=tb(w|0)|0;s=w>>>0>s>>>0?w:s}v=v+1|0}while((v|0)!=(d|0))}if(u){u=(n|0)==0;t=(f|0)==0;v=0;z=0;y=0;r=0;do{x=b+(v*68|0)|0;w=b+(v*68|0)+64|0;A=c[w>>2]|0;r=A+r|0;if(!u){D=a[e>>0]|0;B=a[x>>0]|0;b:do{if(D<<24>>24==0){C=1;p=35}else{C=1;E=e;while(1){if(D<<24>>24==B<<24>>24){D=B;F=x;do{if(D<<24>>24==0){break b}E=E+1|0;F=F+1|0;D=a[E>>0]|0}while(D<<24>>24==(a[F>>0]|0))}E=E+1|0;if(!(D<<24>>24==0)){while(1){D=E+1|0;if((a[E>>0]|0)==0){E=D;break}else{E=D}}}C=C+1|0;D=a[E>>0]|0;if(D<<24>>24==0){p=35;break}}}}while(0);if((p|0)==35){p=0;C=B<<24>>24==0?C:0}if((C|0)!=0){p=37}}else{p=37}if((p|0)==37){p=0;y=y+1|0;z=A+z|0;if(q){D=a[e>>0]|0;A=a[x>>0]|0;c:do{if(D<<24>>24==0){B=1;p=45}else{B=1;C=e;while(1){if(D<<24>>24==A<<24>>24){D=A;E=x;do{if(D<<24>>24==0){break c}C=C+1|0;E=E+1|0;D=a[C>>0]|0}while(D<<24>>24==(a[E>>0]|0))}C=C+1|0;if(!(D<<24>>24==0)){while(1){D=C+1|0;if((a[C>>0]|0)==0){C=D;break}else{C=D}}}B=B+1|0;D=a[C>>0]|0;if(D<<24>>24==0){p=45;break}}}}while(0);if((p|0)==45){p=0;B=A<<24>>24==0?B:0}a[o+(B+ -1)>>0]=1}c[k>>2]=x;wa(1488,k|0)|0;if(!t){x=tb(x|0)|0;if((x|0)<(s|0)){do{ua(32)|0;x=x+1|0}while((x|0)!=(s|0))}c[k>>2]=c[w>>2];wa(1496,k|0)|0}ua(10)|0}v=v+1|0}while((v|0)!=(d|0))}else{z=0;y=0;r=0}}else{z=0;y=0;r=0}g=(g|0)==0;d:do{if(q&g&(n|0)>0){p=c[m>>2]|0;if((e|0)==0){e=0;while(1){if((a[o+e>>0]|0)==0){c[k>>2]=j;c[k+4>>2]=0;Ja(p|0,1504,k|0)|0}e=e+1|0;if((e|0)==(n|0)){break d}}}else{b=0}do{if((a[o+b>>0]|0)==0){s=a[e>>0]|0;if(s<<24>>24!=0&(b|0)>0){q=0;t=e;do{t=t+1|0;if(!(s<<24>>24==0)){while(1){s=t+1|0;if((a[t>>0]|0)==0){t=s;break}else{t=s}}}q=q+1|0;s=a[t>>0]|0}while(s<<24>>24!=0&(q|0)<(b|0))}else{t=e}c[k>>2]=j;c[k+4>>2]=t;Ja(p|0,1504,k|0)|0}b=b+1|0}while((b|0)!=(n|0))}}while(0);if((f|0)==0){mb(o);F=(y|0)<(n|0);F=F&g;F=F?-1:y;i=l;return F|0}c[k>>2]=h;wa(1544,k|0)|0;c[k>>2]=y;c[k+4>>2]=(y|0)>1?1608:1440;c[k+8>>2]=z;wa(1576,k|0)|0;c[k>>2]=d;c[k+4>>2]=(d|0)>1?1608:1440;c[k+8>>2]=r;wa(1616,k|0)|0;mb(o);F=(y|0)<(n|0);F=F&g;F=F?-1:y;i=l;return F|0}function fb(b,d,e,f,g,h,j){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;j=j|0;var k=0,l=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;l=i;i=i+1040|0;k=l;r=l+16|0;n=a[e>>0]|0;if(!(n<<24>>24==0)){p=1;o=e;do{if(n<<24>>24==0){break}o=o+1|0;do{H=o;o=o+1|0}while((a[H>>0]|0)!=0);p=p+1|0;n=a[o>>0]|0}while(!(n<<24>>24==0));n=p+ -1|0;if((n|0)!=0){o=lb(n)|0;if((o|0)==0){H=c[m>>2]|0;c[k>>2]=j;c[k+4>>2]=n;Ja(H|0,1448,k|0)|0;i=l;return-1}if((n|0)>0){sb(o|0,0,n|0)|0;s=1}else{s=1}}else{s=0;n=0;o=0}}else{s=0;n=0;o=0}c[k>>2]=438;p=ma(h|0,0,k|0)|0;a:do{if(!((p|0)==-1)){b:do{if((d|0)>0){w=(n|0)==0;v=(f|0)==0;u=c[m>>2]|0;x=0;y=0;z=0;t=0;c:while(1){B=b+(x*68|0)|0;C=c[b+(x*68|0)+60>>2]|0;A=c[b+(x*68|0)+64>>2]|0;t=A+t|0;if(!w){G=a[e>>0]|0;D=a[B>>0]|0;d:do{if(G<<24>>24==0){E=1;q=23}else{E=1;F=e;while(1){if(G<<24>>24==D<<24>>24){G=D;H=B;do{if(G<<24>>24==0){break d}F=F+1|0;H=H+1|0;G=a[F>>0]|0}while(G<<24>>24==(a[H>>0]|0))}F=F+1|0;if(!(G<<24>>24==0)){while(1){G=F+1|0;if((a[F>>0]|0)==0){F=G;break}else{F=G}}}E=E+1|0;G=a[F>>0]|0;if(G<<24>>24==0){q=23;break}}}}while(0);if((q|0)==23){q=0;E=D<<24>>24==0?E:0}if((E|0)!=0){q=25}}else{q=25}if((q|0)==25){q=0;if(!v){c[k>>2]=B;c[k+4>>2]=A;wa(1648,k|0)|0}if((ga(p|0,C|0,0)|0)==-1){q=28;break}if((_a(B,511,j)|0)==-1){z=-1;break a}c[k>>2]=438;C=ma(B|0,577,k|0)|0;if((C|0)==-1){q=32;break}if((A|0)>0){E=A;do{D=(E|0)>1024?1024:E;G=D;F=0;while(1){G=Fa(p|0,r+F|0,G|0)|0;if((G|0)==-1){q=36;break}F=G+F|0;H=D-F|0;if((G|0)>0&(H|0)>0){G=H}else{break}}if((q|0)==36){q=0;F=Ka(c[(Aa()|0)>>2]|0)|0;c[k>>2]=j;c[k+4>>2]=B;c[k+8>>2]=F;Ja(u|0,808,k|0)|0;F=-1}if((F|0)<(D|0)){q=39;break c}E=E-F|0;if((Za(C,r,F,B,j)|0)==-1){q=44;break c}}while((E|0)>0)}if((sa(C|0)|0)==-1){q=47;break}if(s){F=a[e>>0]|0;C=a[B>>0]|0;e:do{if(F<<24>>24==0){D=1;q=56}else{D=1;E=e;while(1){if(F<<24>>24==C<<24>>24){F=C;G=B;do{if(F<<24>>24==0){break e}E=E+1|0;G=G+1|0;F=a[E>>0]|0}while(F<<24>>24==(a[G>>0]|0))}E=E+1|0;if(!(F<<24>>24==0)){while(1){F=E+1|0;if((a[E>>0]|0)==0){E=F;break}else{E=F}}}D=D+1|0;F=a[E>>0]|0;if(F<<24>>24==0){q=56;break}}}}while(0);if((q|0)==56){q=0;D=C<<24>>24==0?D:0}a[o+(D+ -1)>>0]=1}y=A+y|0;z=z+1|0}x=x+1|0;if((x|0)>=(d|0)){break b}}if((q|0)==28){z=Ka(c[(Aa()|0)>>2]|0)|0;c[k>>2]=j;c[k+4>>2]=h;c[k+8>>2]=z;Ja(u|0,776,k|0)|0;z=-1;break a}else if((q|0)==32){z=Ka(c[(Aa()|0)>>2]|0)|0;c[k>>2]=j;c[k+4>>2]=B;c[k+8>>2]=704;c[k+12>>2]=z;Ja(u|0,656,k|0)|0;z=-1;break a}else if((q|0)==39){if((F|0)>-1){c[k>>2]=j;c[k+4>>2]=h;c[k+8>>2]=1664;Ja(u|0,1192,k|0)|0}if(!((sa(C|0)|0)==-1)){z=-1;break a}z=Ka(c[(Aa()|0)>>2]|0)|0;c[k>>2]=j;c[k+4>>2]=B;c[k+8>>2]=z;Ja(u|0,728,k|0)|0;z=-1;break a}else if((q|0)==44){if(!((sa(C|0)|0)==-1)){z=-1;break a}z=Ka(c[(Aa()|0)>>2]|0)|0;c[k>>2]=j;c[k+4>>2]=B;c[k+8>>2]=z;Ja(u|0,728,k|0)|0;z=-1;break a}else if((q|0)==47){z=Ka(c[(Aa()|0)>>2]|0)|0;c[k>>2]=j;c[k+4>>2]=B;c[k+8>>2]=z;Ja(u|0,728,k|0)|0;z=-1;break a}}else{y=0;z=0;t=0}}while(0);if(s&(g|0)==0&(n|0)>0){b=c[m>>2]|0;r=(e|0)==0;q=0;do{if((a[o+q>>0]|0)==0){if(!r){u=a[e>>0]|0;if(u<<24>>24!=0&(q|0)>0){s=0;v=e;do{v=v+1|0;if(!(u<<24>>24==0)){while(1){u=v+1|0;if((a[v>>0]|0)==0){v=u;break}else{v=u}}}s=s+1|0;u=a[v>>0]|0}while(u<<24>>24!=0&(s|0)<(q|0))}else{v=e}}else{v=0}c[k>>2]=j;c[k+4>>2]=v;Ja(b|0,1504,k|0)|0}q=q+1|0}while((q|0)!=(n|0))}if((f|0)!=0){c[k>>2]=h;wa(1544,k|0)|0;c[k>>2]=z;c[k+4>>2]=(z|0)>1?1608:1440;c[k+8>>2]=y;wa(1680,k|0)|0;c[k>>2]=d;c[k+4>>2]=(d|0)>1?1608:1440;c[k+8>>2]=t;wa(1720,k|0)|0}}else{z=c[m>>2]|0;H=Ka(c[(Aa()|0)>>2]|0)|0;c[k>>2]=j;c[k+4>>2]=h;c[k+8>>2]=696;c[k+12>>2]=H;Ja(z|0,656,k|0)|0;z=-1}}while(0);mb(o);if(!((sa(p|0)|0)==-1)){G=(z|0)<(n|0);H=(g|0)==0;H=G&H;H=H?-1:z;i=l;return H|0}G=c[m>>2]|0;H=Ka(c[(Aa()|0)>>2]|0)|0;c[k>>2]=j;c[k+4>>2]=h;c[k+8>>2]=H;Ja(G|0,728,k|0)|0;G=(z|0)<(n|0);H=(g|0)==0;H=G&H;H=H?-1:z;i=l;return H|0}function gb(b,d,e,f,g,h){b=b|0;d=d|0;e=e|0;f=f|0;g=g|0;h=h|0;var j=0,k=0,l=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0;k=i;i=i+1040|0;j=k;n=k+16|0;o=a[d>>0]|0;a:do{if(o<<24>>24==0){q=1}else{q=1;p=d;do{if(o<<24>>24==0){break a}p=p+1|0;do{E=p;p=p+1|0}while((a[E>>0]|0)!=0);q=q+1|0;o=a[p>>0]|0}while(!(o<<24>>24==0))}}while(0);q=q+ -1|0;o=b+12|0;c[o>>2]=q<<6;if((q|0)!=0){r=q*68|0;p=nb(0,r)|0;if((p|0)==0){E=c[m>>2]|0;c[j>>2]=h;c[j+4>>2]=r;Ja(E|0,1336,j|0)|0;E=0;i=k;return E|0}}else{p=0}w=c[332]|0;if((w|0)>=(q|0)){c[332]=q;if((p|0)==0){E=0;i=k;return E|0}}else{r=q-w|0;u=0;v=w;while(1){s=p+((u+w|0)*68|0)+0|0;t=s+57|0;do{a[s>>0]=0;s=s+1|0}while((s|0)<(t|0));c[p+(v*68|0)+60>>2]=0;c[p+(v*68|0)+64>>2]=0;u=u+1|0;if((u|0)==(r|0)){break}else{v=v+1|0}}c[332]=q}c[j>>2]=438;r=ma(g|0,1,j|0)|0;b:do{if((r|0)==-1){b=c[m>>2]|0;E=Ka(c[(Aa()|0)>>2]|0)|0;c[j>>2]=h;c[j+4>>2]=g;c[j+8>>2]=704;c[j+12>>2]=E;Ja(b|0,656,j|0)|0;b=0}else{w=ga(r|0,12,0)|0;if((w|0)==-1){b=c[m>>2]|0;E=Ka(c[(Aa()|0)>>2]|0)|0;c[j>>2]=h;c[j+4>>2]=g;c[j+8>>2]=E;Ja(b|0,776,j|0)|0;b=0;break}c:do{if((q|0)>0){s=(d|0)==0;t=(f|0)==0;f=c[m>>2]|0;e=(e|0)==0;u=0;v=0;d:while(1){if(!s){z=a[d>>0]|0;if(z<<24>>24!=0&(u|0)>0){x=0;y=d;do{y=y+1|0;if(!(z<<24>>24==0)){while(1){z=y+1|0;if((a[y>>0]|0)==0){y=z;break}else{y=z}}}x=x+1|0;z=a[y>>0]|0}while(z<<24>>24!=0&(x|0)<(u|0))}else{y=d}}else{y=0}do{if(!(((tb(y|0)|0)+1|0)>>>0>56)){x=ma(y|0,0,j|0)|0;if((x|0)==-1){if(t){l=31;break d}c[o>>2]=(c[o>>2]|0)+ -64;break}z=ga(x|0,0,2)|0;if((z|0)==-1){l=34;break d}if((ga(x|0,0,0)|0)==-1){E=Ka(c[(Aa()|0)>>2]|0)|0;c[j>>2]=h;c[j+4>>2]=y;c[j+8>>2]=E;Ja(f|0,776,j|0)|0}if(!e){c[j>>2]=y;c[j+4>>2]=z;wa(1648,j|0)|0}if((z|0)>0){A=z;do{B=(A|0)>1024?1024:A;E=B;D=0;do{C=Fa(x|0,n+D|0,E|0)|0;if((C|0)==-1){l=44;break}D=C+D|0;E=B-D|0}while((C|0)>0&(E|0)>0);if((l|0)==44){l=0;D=Ka(c[(Aa()|0)>>2]|0)|0;c[j>>2]=h;c[j+4>>2]=y;c[j+8>>2]=D;Ja(f|0,808,j|0)|0;D=-1}if((D|0)<(B|0)){l=47;break d}A=A-D|0;if((Za(r,n,D,g,h)|0)==-1){l=52;break d}}while((A|0)>0)}vb(p+(v*68|0)|0,y|0)|0;c[p+(v*68|0)+60>>2]=w;c[p+(v*68|0)+64>>2]=z;if((sa(x|0)|0)==-1){l=55;break d}else{v=v+1|0;w=z+w|0}}else{if(t){b=0;break b}c[o>>2]=(c[o>>2]|0)+ -64}}while(0);u=u+1|0;if((u|0)>=(q|0)){break c}}if((l|0)==31){c[j>>2]=438;if(!((ma(y|0,0,j|0)|0)==-1)){b=0;break b}b=Ka(c[(Aa()|0)>>2]|0)|0;c[j>>2]=h;c[j+4>>2]=y;c[j+8>>2]=696;c[j+12>>2]=b;Ja(f|0,656,j|0)|0;b=0;break b}else if((l|0)==34){b=Aa()|0;E=Ka(c[b>>2]|0)|0;c[j>>2]=h;c[j+4>>2]=y;c[j+8>>2]=E;Ja(f|0,776,j|0)|0;if(!((sa(x|0)|0)==-1)){b=0;break b}b=Ka(c[b>>2]|0)|0;c[j>>2]=h;c[j+4>>2]=y;c[j+8>>2]=b;Ja(f|0,728,j|0)|0;b=0;break b}else if((l|0)==47){if((D|0)>-1){c[j>>2]=h;c[j+4>>2]=y;c[j+8>>2]=1376;Ja(f|0,1760,j|0)|0}if(!((sa(x|0)|0)==-1)){b=0;break b}b=Ka(c[(Aa()|0)>>2]|0)|0;c[j>>2]=h;c[j+4>>2]=y;c[j+8>>2]=b;Ja(f|0,728,j|0)|0;b=0;break b}else if((l|0)==52){if(!((sa(x|0)|0)==-1)){b=0;break b}b=Ka(c[(Aa()|0)>>2]|0)|0;c[j>>2]=h;c[j+4>>2]=y;c[j+8>>2]=b;Ja(f|0,728,j|0)|0;b=0;break b}else if((l|0)==55){b=Ka(c[(Aa()|0)>>2]|0)|0;c[j>>2]=h;c[j+4>>2]=y;c[j+8>>2]=b;Ja(f|0,728,j|0)|0;b=0;break b}}else{v=0}}while(0);c[b+8>>2]=w;c[o>>2]=v<<6;b=p}}while(0);if((sa(r|0)|0)==-1){E=c[m>>2]|0;D=Ka(c[(Aa()|0)>>2]|0)|0;c[j>>2]=h;c[j+4>>2]=g;c[j+8>>2]=D;Ja(E|0,728,j|0)|0}if((b|0)!=0){E=b;i=k;return E|0}mb(p);E=0;i=k;return E|0}function hb(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;f=i;i=i+160|0;e=f;l=f+16|0;p=f+104|0;f=f+40|0;v=Ya(1440)|0;k=c[d>>2]|0;g=k;while(1){if((a[g>>0]|0)==0){break}else{g=g+1|0}}while(1){if(!(g>>>0>k>>>0)){break}h=g+ -1|0;if((a[h>>0]|0)==47){break}else{g=h}}c[d>>2]=g;r=0;j=0;q=0;h=0;a:while(1){b:while(1){c:while(1){d:while(1){switch(jb(b,d,1800)|0){case 108:{if((r|0)==0){r=1;continue d}else{o=14;break a}};case 116:{q=1;continue c};case 102:{j=1;continue b};case 120:{if((r|0)==0){r=2;continue d}else{o=17;break a}};case 86:{o=18;break a};case-1:{o=21;break a};case 99:{if((r|0)==0){r=3;continue d}else{o=11;break a}};case 104:{o=12;break a};case 118:{break b};case 63:{o=19;break a};default:{o=20;break a}}}}}h=h+1|0}e:do{if((o|0)==11){k=c[m>>2]|0;c[e>>2]=g;Ja(k|0,1816,e|0)|0;k=0;l=0;g=2;q=0}else if((o|0)==12){Xa(g)|0;k=0;l=0;g=0;q=0}else if((o|0)==14){k=c[m>>2]|0;c[e>>2]=g;Ja(k|0,1816,e|0)|0;k=0;l=0;g=2;q=0}else if((o|0)==17){k=c[m>>2]|0;c[e>>2]=g;Ja(k|0,1816,e|0)|0;k=0;l=0;g=2;q=0}else if((o|0)==18){k=c[n>>2]|0;c[e>>2]=g;c[e+4>>2]=24;c[e+8>>2]=32;Ja(k|0,616,e|0)|0;k=0;l=0;g=0;q=0}else if((o|0)==19){l=c[m>>2]|0;c[e>>2]=g;c[e+4>>2]=k;Ja(l|0,1864,e|0)|0;k=0;l=0;g=2;q=0}else if((o|0)==20){k=c[m>>2]|0;c[e>>2]=g;c[e+4>>2]=112;Ja(k|0,1904,e|0)|0;k=0;l=0;g=1;q=0}else if((o|0)==21){if((r|0)==0){r=c[m>>2]|0;c[e>>2]=g;Ja(r|0,1944,e|0)|0;r=0;k=0;l=0;g=2;q=0;break}t=c[554]|0;if((t|0)==(b|0)){k=c[m>>2]|0;c[e>>2]=g;Ja(k|0,1992,e|0)|0;k=0;l=0;g=2;q=0;break}k=c[d+(t<<2)>>2]|0;s=(q|0)==0;q=0;f:while(1){if(s){o=27;break}t=t+1|0;if((t|0)>=(b|0)){break}u=c[d+(t<<2)>>2]|0;c[e>>2]=438;q=ma(u|0,0,e|0)|0;if((q|0)==-1){o=32;break}else{x=0}while(1){if((x|0)==0){w=0}else{continue f}while(1){x=p+w|0;z=1;A=0;do{y=Fa(q|0,p+(A+w)|0,z|0)|0;if((y|0)==-1){o=37;break f}A=y+A|0;z=1-A|0}while((y|0)>0&(z|0)>0);if((A|0)==-1){l=0;g=2;break e}else if((A|0)==0){o=40;break}y=w+1|0;if((a[x>>0]|0)==10){o=42;break}if((y|0)<56){w=y}else{x=0;w=y;break}}if((o|0)==40){o=0;a[x>>0]=0;x=1}else if((o|0)==42){o=0;a[x>>0]=0;x=0}if((w|0)==56){o=44;break f}v=Ya(p)|0;if((v|0)==0){o=46;break f}}}g:do{if((o|0)==27){while(1){t=t+1|0;if((t|0)>=(b|0)){break g}p=c[d+(t<<2)>>2]|0;if((tb(p|0)|0)>>>0>55){o=47;break}v=Ya(p)|0;if((v|0)==0){o=48;break}else{o=27}}if((o|0)==47){l=c[m>>2]|0;c[e>>2]=g;c[e+4>>2]=p;Ja(l|0,2104,e|0)|0;l=0;g=2;break e}else if((o|0)==48){v=c[m>>2]|0;c[e>>2]=g;Ja(v|0,2072,e|0)|0;v=0;l=0;g=2;break e}}else if((o|0)==32){l=c[m>>2]|0;q=Ka(c[(Aa()|0)>>2]|0)|0;c[e>>2]=g;c[e+4>>2]=u;c[e+8>>2]=696;c[e+12>>2]=q;Ja(l|0,656,e|0)|0;l=0;g=1;q=-1;break e}else if((o|0)==37){l=c[m>>2]|0;A=Ka(c[(Aa()|0)>>2]|0)|0;c[e>>2]=g;c[e+4>>2]=u;c[e+8>>2]=A;Ja(l|0,808,e|0)|0;l=0;g=2;break e}else if((o|0)==44){a[p+55>>0]=0;l=c[m>>2]|0;c[e>>2]=g;c[e+4>>2]=p;c[e+8>>2]=u;Ja(l|0,2024,e|0)|0;l=0;g=2;break e}else if((o|0)==46){v=c[m>>2]|0;c[e>>2]=g;Ja(v|0,2072,e|0)|0;v=0;l=0;g=2;break e}}while(0);if((r|0)==2){if(($a(l,k,g)|0)==-1){r=2;l=0;g=2;break}b=bb(l,k,g)|0;if((b|0)==-1){r=2;l=0;g=2;break}l=cb(l,k,g)|0;if(!((l|0)!=0|(b|0)==0)){r=2;l=0;g=2;break}h:do{if((l|0)!=0){if((c[l+60>>2]|0)!=12){r=c[m>>2]|0;c[e>>2]=g;c[e+4>>2]=k;c[e+8>>2]=0;Ja(r|0,1392,e|0)|0;r=2;g=2;break e}if((b|0)>1){o=12;d=1;while(1){A=o;o=c[l+(d*68|0)+60>>2]|0;p=d+1|0;if((o|0)<((c[l+((d+ -1|0)*68|0)+64>>2]|0)+A|0)){break}if((p|0)>=(b|0)){break h}else{d=p}}r=c[m>>2]|0;c[e>>2]=g;c[e+4>>2]=k;c[e+8>>2]=d;Ja(r|0,1392,e|0)|0;r=2;g=2;break e}}}while(0);A=(fb(l,b,v,h,j,k,g)|0)==-1;r=2;g=A?2:0;break}else if((r|0)==1){if(($a(l,k,g)|0)==-1){r=1;l=0;g=2;break}b=bb(l,k,g)|0;if((b|0)==-1){r=1;l=0;g=2;break}l=cb(l,k,g)|0;if(!((l|0)!=0|(b|0)==0)){r=1;l=0;g=2;break}i:do{if((l|0)!=0){if((c[l+60>>2]|0)!=12){r=c[m>>2]|0;c[e>>2]=g;c[e+4>>2]=k;c[e+8>>2]=0;Ja(r|0,1392,e|0)|0;r=1;g=2;break e}if((b|0)>1){d=12;o=1;while(1){A=d;d=c[l+(o*68|0)+60>>2]|0;p=o+1|0;if((d|0)<((c[l+((o+ -1|0)*68|0)+64>>2]|0)+A|0)){break}if((p|0)>=(b|0)){break i}else{o=p}}r=c[m>>2]|0;c[e>>2]=g;c[e+4>>2]=k;c[e+8>>2]=o;Ja(r|0,1392,e|0)|0;r=1;g=2;break e}}}while(0);A=(eb(l,b,v,h,j,k,g)|0)==-1;r=1;g=A?2:0;break}else if((r|0)==3){a[l+0>>0]=a[952>>0]|0;a[l+1>>0]=a[953>>0]|0;a[l+2>>0]=a[954>>0]|0;a[l+3>>0]=a[955>>0]|0;a[l+4>>0]=a[956>>0]|0;c[l+8>>2]=12;b=l+12|0;c[b>>2]=0;c[l+16>>2]=12;if((ab(l,512,k,g)|0)==-1){r=3;l=0;g=2;break}h=gb(l,v,h,j,k,g)|0;if((h|0)==0?(c[b>>2]|0)!=0:0){r=3;l=0;g=2;break}if((db(l,h,k,g)|0)==-1){r=3;l=h;g=2;break}A=(ab(l,0,k,g)|0)==-1;r=3;l=h;g=A?2:0;break}else{l=c[m>>2]|0;c[e>>2]=g;c[e+4>>2]=r;c[e+8>>2]=112;Ja(l|0,2136,e|0)|0;l=0;g=1;break}}}while(0);mb(l);mb(v);sa(0)|0;sa(q|0)|0;if((g|0)!=2|(r|0)!=3|(k|0)==0){Na(g|0)}c[e>>2]=k;xa(f|0,2184,e|0)|0;ia(f|0)|0;Na(g|0);return 0}function ib(a){a=a|0;var b=0;b=i;i=i+16|0;c[b>>2]=2200;c[b+4>>2]=2208;c[b+8>>2]=a;hb(3,b)|0;return 0}function jb(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0;f=i;i=i+16|0;g=f+4|0;h=f;m=c[554]|0;if((m|0)==0|(c[558]|0)!=0){c[558]=0;c[560]=0;c[554]=1;m=1}if((m|0)>=(b|0)){m=-1;i=f;return m|0}j=c[d+(m<<2)>>2]|0;if((j|0)==0){m=-1;i=f;return m|0}if((a[j>>0]|0)!=45){m=-1;i=f;return m|0}l=a[j+1>>0]|0;if(l<<24>>24==45){k=7}else if(l<<24>>24==0){m=-1;i=f;return m|0}if((k|0)==7?(a[j+2>>0]|0)==0:0){c[554]=m+1;m=-1;i=f;return m|0}k=c[560]|0;if((k|0)==0){c[560]=1;k=1}k=kb(g,j+k|0,4)|0;if((k|0)<0){c[g>>2]=65533;l=65533;k=1}else{l=c[g>>2]|0}m=c[554]|0;n=c[d+(m<<2)>>2]|0;o=c[560]|0;j=n+o|0;c[562]=l;l=o+k|0;c[560]=l;if((a[n+l>>0]|0)==0){c[554]=m+1;c[560]=0}l=kb(h,e,4)|0;a:do{if((l|0)==0){m=0}else{m=0;do{if((c[h>>2]|0)==(c[g>>2]|0)){break a}m=((l|0)<1?1:l)+m|0;l=kb(h,e+m|0,4)|0}while((l|0)!=0)}}while(0);h=c[h>>2]|0;if((h|0)!=(c[g>>2]|0)){if(!((a[e>>0]|0)!=58&(c[556]|0)!=0)){o=63;i=f;return o|0}o=c[d>>2]|0;za(2,o|0,tb(o|0)|0)|0;za(2,2256,18)|0;za(2,j|0,k|0)|0;za(2,2280,1)|0;o=63;i=f;return o|0}if((a[e+(m+1)>>0]|0)!=58){o=h;i=f;return o|0}g=c[554]|0;if((g|0)<(b|0)){c[554]=g+1;c[580]=(c[d+(g<<2)>>2]|0)+(c[560]|0);c[560]=0;o=h;i=f;return o|0}if((a[e>>0]|0)==58){o=58;i=f;return o|0}if((c[556]|0)==0){o=63;i=f;return o|0}o=c[d>>2]|0;za(2,o|0,tb(o|0)|0)|0;za(2,2288,31)|0;za(2,j|0,k|0)|0;za(2,2280,1)|0;o=63;i=f;return o|0}function kb(b,e,f){b=b|0;e=e|0;f=f|0;var g=0,h=0,j=0;g=i;i=i+16|0;h=g;c[h>>2]=b;if((e|0)==0){j=0;i=g;return j|0}do{if((f|0)!=0){if((b|0)==0){c[h>>2]=h}else{h=b}b=a[e>>0]|0;j=b&255;if(b<<24>>24>-1){c[h>>2]=j;j=b<<24>>24!=0|0;i=g;return j|0}j=j+ -194|0;if(!(j>>>0>50)){b=e+1|0;j=c[2328+(j<<2)>>2]|0;if(f>>>0<4?(j&-2147483648>>>((f*6|0)+ -6|0)|0)!=0:0){break}f=d[b>>0]|0;b=f>>>3;if(!((b+ -16|b+(j>>26))>>>0>7)){f=f+ -128|j<<6;if((f|0)>=0){c[h>>2]=f;j=2;i=g;return j|0}b=(d[e+2>>0]|0)+ -128|0;if(!(b>>>0>63)){f=b|f<<6;if((f|0)>=0){c[h>>2]=f;j=3;i=g;return j|0}e=(d[e+3>>0]|0)+ -128|0;if(!(e>>>0>63)){c[h>>2]=e|f<<6;j=4;i=g;return j|0}}}}}}while(0);c[(Aa()|0)>>2]=84;j=-1;i=g;return j|0}function lb(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0;b=i;do{if(a>>>0<245){if(a>>>0<11){a=16}else{a=a+11&-8}v=a>>>3;r=c[634]|0;w=r>>>v;if((w&3|0)!=0){j=(w&1^1)+v|0;h=j<<1;f=2576+(h<<2)|0;h=2576+(h+2<<2)|0;d=c[h>>2]|0;e=d+8|0;g=c[e>>2]|0;do{if((f|0)!=(g|0)){if(g>>>0<(c[2552>>2]|0)>>>0){Ga()}k=g+12|0;if((c[k>>2]|0)==(d|0)){c[k>>2]=f;c[h>>2]=g;break}else{Ga()}}else{c[634]=r&~(1<<j)}}while(0);H=j<<3;c[d+4>>2]=H|3;H=d+(H|4)|0;c[H>>2]=c[H>>2]|1;H=e;i=b;return H|0}if(a>>>0>(c[2544>>2]|0)>>>0){if((w|0)!=0){f=2<<v;f=w<<v&(f|0-f);f=(f&0-f)+ -1|0;d=f>>>12&16;f=f>>>d;e=f>>>5&8;f=f>>>e;g=f>>>2&4;f=f>>>g;j=f>>>1&2;f=f>>>j;h=f>>>1&1;h=(e|d|g|j|h)+(f>>>h)|0;f=h<<1;j=2576+(f<<2)|0;f=2576+(f+2<<2)|0;g=c[f>>2]|0;d=g+8|0;e=c[d>>2]|0;do{if((j|0)!=(e|0)){if(e>>>0<(c[2552>>2]|0)>>>0){Ga()}k=e+12|0;if((c[k>>2]|0)==(g|0)){c[k>>2]=j;c[f>>2]=e;break}else{Ga()}}else{c[634]=r&~(1<<h)}}while(0);h=h<<3;f=h-a|0;c[g+4>>2]=a|3;e=g+a|0;c[g+(a|4)>>2]=f|1;c[g+h>>2]=f;h=c[2544>>2]|0;if((h|0)!=0){g=c[2556>>2]|0;l=h>>>3;j=l<<1;h=2576+(j<<2)|0;k=c[634]|0;l=1<<l;if((k&l|0)!=0){j=2576+(j+2<<2)|0;k=c[j>>2]|0;if(k>>>0<(c[2552>>2]|0)>>>0){Ga()}else{D=j;C=k}}else{c[634]=k|l;D=2576+(j+2<<2)|0;C=h}c[D>>2]=g;c[C+12>>2]=g;c[g+8>>2]=C;c[g+12>>2]=h}c[2544>>2]=f;c[2556>>2]=e;H=d;i=b;return H|0}r=c[2540>>2]|0;if((r|0)!=0){d=(r&0-r)+ -1|0;G=d>>>12&16;d=d>>>G;F=d>>>5&8;d=d>>>F;H=d>>>2&4;d=d>>>H;h=d>>>1&2;d=d>>>h;e=d>>>1&1;e=c[2840+((F|G|H|h|e)+(d>>>e)<<2)>>2]|0;d=(c[e+4>>2]&-8)-a|0;h=e;while(1){g=c[h+16>>2]|0;if((g|0)==0){g=c[h+20>>2]|0;if((g|0)==0){break}}h=(c[g+4>>2]&-8)-a|0;f=h>>>0<d>>>0;d=f?h:d;h=g;e=f?g:e}h=c[2552>>2]|0;if(e>>>0<h>>>0){Ga()}f=e+a|0;if(!(e>>>0<f>>>0)){Ga()}g=c[e+24>>2]|0;k=c[e+12>>2]|0;do{if((k|0)==(e|0)){k=e+20|0;j=c[k>>2]|0;if((j|0)==0){k=e+16|0;j=c[k>>2]|0;if((j|0)==0){B=0;break}}while(1){l=j+20|0;m=c[l>>2]|0;if((m|0)!=0){j=m;k=l;continue}l=j+16|0;m=c[l>>2]|0;if((m|0)==0){break}else{j=m;k=l}}if(k>>>0<h>>>0){Ga()}else{c[k>>2]=0;B=j;break}}else{j=c[e+8>>2]|0;if(j>>>0<h>>>0){Ga()}h=j+12|0;if((c[h>>2]|0)!=(e|0)){Ga()}l=k+8|0;if((c[l>>2]|0)==(e|0)){c[h>>2]=k;c[l>>2]=j;B=k;break}else{Ga()}}}while(0);do{if((g|0)!=0){j=c[e+28>>2]|0;h=2840+(j<<2)|0;if((e|0)==(c[h>>2]|0)){c[h>>2]=B;if((B|0)==0){c[2540>>2]=c[2540>>2]&~(1<<j);break}}else{if(g>>>0<(c[2552>>2]|0)>>>0){Ga()}h=g+16|0;if((c[h>>2]|0)==(e|0)){c[h>>2]=B}else{c[g+20>>2]=B}if((B|0)==0){break}}if(B>>>0<(c[2552>>2]|0)>>>0){Ga()}c[B+24>>2]=g;g=c[e+16>>2]|0;do{if((g|0)!=0){if(g>>>0<(c[2552>>2]|0)>>>0){Ga()}else{c[B+16>>2]=g;c[g+24>>2]=B;break}}}while(0);g=c[e+20>>2]|0;if((g|0)!=0){if(g>>>0<(c[2552>>2]|0)>>>0){Ga()}else{c[B+20>>2]=g;c[g+24>>2]=B;break}}}}while(0);if(d>>>0<16){H=d+a|0;c[e+4>>2]=H|3;H=e+(H+4)|0;c[H>>2]=c[H>>2]|1}else{c[e+4>>2]=a|3;c[e+(a|4)>>2]=d|1;c[e+(d+a)>>2]=d;h=c[2544>>2]|0;if((h|0)!=0){g=c[2556>>2]|0;j=h>>>3;k=j<<1;h=2576+(k<<2)|0;l=c[634]|0;j=1<<j;if((l&j|0)!=0){k=2576+(k+2<<2)|0;j=c[k>>2]|0;if(j>>>0<(c[2552>>2]|0)>>>0){Ga()}else{z=k;A=j}}else{c[634]=l|j;z=2576+(k+2<<2)|0;A=h}c[z>>2]=g;c[A+12>>2]=g;c[g+8>>2]=A;c[g+12>>2]=h}c[2544>>2]=d;c[2556>>2]=f}H=e+8|0;i=b;return H|0}}}else{if(!(a>>>0>4294967231)){z=a+11|0;a=z&-8;B=c[2540>>2]|0;if((B|0)!=0){A=0-a|0;z=z>>>8;if((z|0)!=0){if(a>>>0>16777215){C=31}else{G=(z+1048320|0)>>>16&8;H=z<<G;F=(H+520192|0)>>>16&4;H=H<<F;C=(H+245760|0)>>>16&2;C=14-(F|G|C)+(H<<C>>>15)|0;C=a>>>(C+7|0)&1|C<<1}}else{C=0}F=c[2840+(C<<2)>>2]|0;a:do{if((F|0)==0){D=0;z=0}else{if((C|0)==31){z=0}else{z=25-(C>>>1)|0}D=0;E=a<<z;z=0;while(1){H=c[F+4>>2]&-8;G=H-a|0;if(G>>>0<A>>>0){if((H|0)==(a|0)){A=G;D=F;z=F;break a}else{A=G;z=F}}G=c[F+20>>2]|0;F=c[F+(E>>>31<<2)+16>>2]|0;D=(G|0)==0|(G|0)==(F|0)?D:G;if((F|0)==0){break}else{E=E<<1}}}}while(0);if((D|0)==0&(z|0)==0){H=2<<C;B=B&(H|0-H);if((B|0)==0){break}H=(B&0-B)+ -1|0;E=H>>>12&16;H=H>>>E;C=H>>>5&8;H=H>>>C;F=H>>>2&4;H=H>>>F;G=H>>>1&2;H=H>>>G;D=H>>>1&1;D=c[2840+((C|E|F|G|D)+(H>>>D)<<2)>>2]|0}if((D|0)!=0){while(1){C=(c[D+4>>2]&-8)-a|0;B=C>>>0<A>>>0;A=B?C:A;z=B?D:z;B=c[D+16>>2]|0;if((B|0)!=0){D=B;continue}D=c[D+20>>2]|0;if((D|0)==0){break}}}if((z|0)!=0?A>>>0<((c[2544>>2]|0)-a|0)>>>0:0){f=c[2552>>2]|0;if(z>>>0<f>>>0){Ga()}d=z+a|0;if(!(z>>>0<d>>>0)){Ga()}e=c[z+24>>2]|0;g=c[z+12>>2]|0;do{if((g|0)==(z|0)){h=z+20|0;g=c[h>>2]|0;if((g|0)==0){h=z+16|0;g=c[h>>2]|0;if((g|0)==0){x=0;break}}while(1){j=g+20|0;k=c[j>>2]|0;if((k|0)!=0){g=k;h=j;continue}j=g+16|0;k=c[j>>2]|0;if((k|0)==0){break}else{g=k;h=j}}if(h>>>0<f>>>0){Ga()}else{c[h>>2]=0;x=g;break}}else{h=c[z+8>>2]|0;if(h>>>0<f>>>0){Ga()}j=h+12|0;if((c[j>>2]|0)!=(z|0)){Ga()}f=g+8|0;if((c[f>>2]|0)==(z|0)){c[j>>2]=g;c[f>>2]=h;x=g;break}else{Ga()}}}while(0);do{if((e|0)!=0){g=c[z+28>>2]|0;f=2840+(g<<2)|0;if((z|0)==(c[f>>2]|0)){c[f>>2]=x;if((x|0)==0){c[2540>>2]=c[2540>>2]&~(1<<g);break}}else{if(e>>>0<(c[2552>>2]|0)>>>0){Ga()}f=e+16|0;if((c[f>>2]|0)==(z|0)){c[f>>2]=x}else{c[e+20>>2]=x}if((x|0)==0){break}}if(x>>>0<(c[2552>>2]|0)>>>0){Ga()}c[x+24>>2]=e;e=c[z+16>>2]|0;do{if((e|0)!=0){if(e>>>0<(c[2552>>2]|0)>>>0){Ga()}else{c[x+16>>2]=e;c[e+24>>2]=x;break}}}while(0);e=c[z+20>>2]|0;if((e|0)!=0){if(e>>>0<(c[2552>>2]|0)>>>0){Ga()}else{c[x+20>>2]=e;c[e+24>>2]=x;break}}}}while(0);b:do{if(!(A>>>0<16)){c[z+4>>2]=a|3;c[z+(a|4)>>2]=A|1;c[z+(A+a)>>2]=A;f=A>>>3;if(A>>>0<256){g=f<<1;e=2576+(g<<2)|0;h=c[634]|0;f=1<<f;if((h&f|0)!=0){f=2576+(g+2<<2)|0;g=c[f>>2]|0;if(g>>>0<(c[2552>>2]|0)>>>0){Ga()}else{w=f;v=g}}else{c[634]=h|f;w=2576+(g+2<<2)|0;v=e}c[w>>2]=d;c[v+12>>2]=d;c[z+(a+8)>>2]=v;c[z+(a+12)>>2]=e;break}e=A>>>8;if((e|0)!=0){if(A>>>0>16777215){e=31}else{G=(e+1048320|0)>>>16&8;H=e<<G;F=(H+520192|0)>>>16&4;H=H<<F;e=(H+245760|0)>>>16&2;e=14-(F|G|e)+(H<<e>>>15)|0;e=A>>>(e+7|0)&1|e<<1}}else{e=0}f=2840+(e<<2)|0;c[z+(a+28)>>2]=e;c[z+(a+20)>>2]=0;c[z+(a+16)>>2]=0;h=c[2540>>2]|0;g=1<<e;if((h&g|0)==0){c[2540>>2]=h|g;c[f>>2]=d;c[z+(a+24)>>2]=f;c[z+(a+12)>>2]=d;c[z+(a+8)>>2]=d;break}f=c[f>>2]|0;if((e|0)==31){e=0}else{e=25-(e>>>1)|0}c:do{if((c[f+4>>2]&-8|0)!=(A|0)){e=A<<e;g=f;while(1){h=g+(e>>>31<<2)+16|0;f=c[h>>2]|0;if((f|0)==0){break}if((c[f+4>>2]&-8|0)==(A|0)){r=f;break c}else{e=e<<1;g=f}}if(h>>>0<(c[2552>>2]|0)>>>0){Ga()}else{c[h>>2]=d;c[z+(a+24)>>2]=g;c[z+(a+12)>>2]=d;c[z+(a+8)>>2]=d;break b}}else{r=f}}while(0);f=r+8|0;e=c[f>>2]|0;g=c[2552>>2]|0;if(r>>>0<g>>>0){Ga()}if(e>>>0<g>>>0){Ga()}else{c[e+12>>2]=d;c[f>>2]=d;c[z+(a+8)>>2]=e;c[z+(a+12)>>2]=r;c[z+(a+24)>>2]=0;break}}else{H=A+a|0;c[z+4>>2]=H|3;H=z+(H+4)|0;c[H>>2]=c[H>>2]|1}}while(0);H=z+8|0;i=b;return H|0}}}else{a=-1}}}while(0);r=c[2544>>2]|0;if(!(a>>>0>r>>>0)){e=r-a|0;d=c[2556>>2]|0;if(e>>>0>15){c[2556>>2]=d+a;c[2544>>2]=e;c[d+(a+4)>>2]=e|1;c[d+r>>2]=e;c[d+4>>2]=a|3}else{c[2544>>2]=0;c[2556>>2]=0;c[d+4>>2]=r|3;H=d+(r+4)|0;c[H>>2]=c[H>>2]|1}H=d+8|0;i=b;return H|0}r=c[2548>>2]|0;if(a>>>0<r>>>0){G=r-a|0;c[2548>>2]=G;H=c[2560>>2]|0;c[2560>>2]=H+a;c[H+(a+4)>>2]=G|1;c[H+4>>2]=a|3;H=H+8|0;i=b;return H|0}do{if((c[752]|0)==0){r=ra(30)|0;if((r+ -1&r|0)==0){c[3016>>2]=r;c[3012>>2]=r;c[3020>>2]=-1;c[3024>>2]=-1;c[3028>>2]=0;c[2980>>2]=0;c[752]=(Ia(0)|0)&-16^1431655768;break}else{Ga()}}}while(0);w=a+48|0;A=c[3016>>2]|0;x=a+47|0;z=A+x|0;A=0-A|0;v=z&A;if(!(v>>>0>a>>>0)){H=0;i=b;return H|0}r=c[2976>>2]|0;if((r|0)!=0?(G=c[2968>>2]|0,H=G+v|0,H>>>0<=G>>>0|H>>>0>r>>>0):0){H=0;i=b;return H|0}d:do{if((c[2980>>2]&4|0)==0){B=c[2560>>2]|0;e:do{if((B|0)!=0){r=2984|0;while(1){C=c[r>>2]|0;if(!(C>>>0>B>>>0)?(y=r+4|0,(C+(c[y>>2]|0)|0)>>>0>B>>>0):0){break}r=c[r+8>>2]|0;if((r|0)==0){o=182;break e}}if((r|0)!=0){A=z-(c[2548>>2]|0)&A;if(A>>>0<2147483647){o=na(A|0)|0;B=(o|0)==((c[r>>2]|0)+(c[y>>2]|0)|0);y=o;z=A;r=B?o:-1;A=B?A:0;o=191}else{A=0}}else{o=182}}else{o=182}}while(0);do{if((o|0)==182){r=na(0)|0;if((r|0)!=(-1|0)){A=r;y=c[3012>>2]|0;z=y+ -1|0;if((z&A|0)==0){A=v}else{A=v-A+(z+A&0-y)|0}B=c[2968>>2]|0;z=B+A|0;if(A>>>0>a>>>0&A>>>0<2147483647){y=c[2976>>2]|0;if((y|0)!=0?z>>>0<=B>>>0|z>>>0>y>>>0:0){A=0;break}y=na(A|0)|0;o=(y|0)==(r|0);z=A;r=o?r:-1;A=o?A:0;o=191}else{A=0}}else{A=0}}}while(0);f:do{if((o|0)==191){o=0-z|0;if((r|0)!=(-1|0)){p=A;o=202;break d}do{if((y|0)!=(-1|0)&z>>>0<2147483647&z>>>0<w>>>0?(u=c[3016>>2]|0,u=x-z+u&0-u,u>>>0<2147483647):0){if((na(u|0)|0)==(-1|0)){na(o|0)|0;break f}else{z=u+z|0;break}}}while(0);if((y|0)!=(-1|0)){r=y;p=z;o=202;break d}}}while(0);c[2980>>2]=c[2980>>2]|4;o=199}else{A=0;o=199}}while(0);if((((o|0)==199?v>>>0<2147483647:0)?(s=na(v|0)|0,t=na(0)|0,(t|0)!=(-1|0)&(s|0)!=(-1|0)&s>>>0<t>>>0):0)?(p=t-s|0,q=p>>>0>(a+40|0)>>>0,q):0){r=s;p=q?p:A;o=202}if((o|0)==202){q=(c[2968>>2]|0)+p|0;c[2968>>2]=q;if(q>>>0>(c[2972>>2]|0)>>>0){c[2972>>2]=q}q=c[2560>>2]|0;g:do{if((q|0)!=0){v=2984|0;while(1){w=c[v>>2]|0;t=v+4|0;u=c[t>>2]|0;if((r|0)==(w+u|0)){o=214;break}s=c[v+8>>2]|0;if((s|0)==0){break}else{v=s}}if(((o|0)==214?(c[v+12>>2]&8|0)==0:0)?q>>>0>=w>>>0&q>>>0<r>>>0:0){c[t>>2]=u+p;d=(c[2548>>2]|0)+p|0;e=q+8|0;if((e&7|0)==0){e=0}else{e=0-e&7}H=d-e|0;c[2560>>2]=q+e;c[2548>>2]=H;c[q+(e+4)>>2]=H|1;c[q+(d+4)>>2]=40;c[2564>>2]=c[3024>>2];break}if(r>>>0<(c[2552>>2]|0)>>>0){c[2552>>2]=r}t=r+p|0;s=2984|0;while(1){if((c[s>>2]|0)==(t|0)){o=224;break}u=c[s+8>>2]|0;if((u|0)==0){break}else{s=u}}if((o|0)==224?(c[s+12>>2]&8|0)==0:0){c[s>>2]=r;h=s+4|0;c[h>>2]=(c[h>>2]|0)+p;h=r+8|0;if((h&7|0)==0){h=0}else{h=0-h&7}j=r+(p+8)|0;if((j&7|0)==0){n=0}else{n=0-j&7}o=r+(n+p)|0;j=h+a|0;k=r+j|0;m=o-(r+h)-a|0;c[r+(h+4)>>2]=a|3;h:do{if((o|0)!=(c[2560>>2]|0)){if((o|0)==(c[2556>>2]|0)){H=(c[2544>>2]|0)+m|0;c[2544>>2]=H;c[2556>>2]=k;c[r+(j+4)>>2]=H|1;c[r+(H+j)>>2]=H;break}q=p+4|0;t=c[r+(q+n)>>2]|0;if((t&3|0)==1){a=t&-8;s=t>>>3;do{if(!(t>>>0<256)){l=c[r+((n|24)+p)>>2]|0;v=c[r+(p+12+n)>>2]|0;do{if((v|0)==(o|0)){u=n|16;t=r+(q+u)|0;s=c[t>>2]|0;if((s|0)==0){t=r+(u+p)|0;s=c[t>>2]|0;if((s|0)==0){g=0;break}}while(1){v=s+20|0;u=c[v>>2]|0;if((u|0)!=0){s=u;t=v;continue}v=s+16|0;u=c[v>>2]|0;if((u|0)==0){break}else{s=u;t=v}}if(t>>>0<(c[2552>>2]|0)>>>0){Ga()}else{c[t>>2]=0;g=s;break}}else{s=c[r+((n|8)+p)>>2]|0;if(s>>>0<(c[2552>>2]|0)>>>0){Ga()}t=s+12|0;if((c[t>>2]|0)!=(o|0)){Ga()}u=v+8|0;if((c[u>>2]|0)==(o|0)){c[t>>2]=v;c[u>>2]=s;g=v;break}else{Ga()}}}while(0);if((l|0)!=0){s=c[r+(p+28+n)>>2]|0;t=2840+(s<<2)|0;if((o|0)==(c[t>>2]|0)){c[t>>2]=g;if((g|0)==0){c[2540>>2]=c[2540>>2]&~(1<<s);break}}else{if(l>>>0<(c[2552>>2]|0)>>>0){Ga()}s=l+16|0;if((c[s>>2]|0)==(o|0)){c[s>>2]=g}else{c[l+20>>2]=g}if((g|0)==0){break}}if(g>>>0<(c[2552>>2]|0)>>>0){Ga()}c[g+24>>2]=l;l=n|16;o=c[r+(l+p)>>2]|0;do{if((o|0)!=0){if(o>>>0<(c[2552>>2]|0)>>>0){Ga()}else{c[g+16>>2]=o;c[o+24>>2]=g;break}}}while(0);l=c[r+(q+l)>>2]|0;if((l|0)!=0){if(l>>>0<(c[2552>>2]|0)>>>0){Ga()}else{c[g+20>>2]=l;c[l+24>>2]=g;break}}}}else{q=c[r+((n|8)+p)>>2]|0;g=c[r+(p+12+n)>>2]|0;t=2576+(s<<1<<2)|0;if((q|0)!=(t|0)){if(q>>>0<(c[2552>>2]|0)>>>0){Ga()}if((c[q+12>>2]|0)!=(o|0)){Ga()}}if((g|0)==(q|0)){c[634]=c[634]&~(1<<s);break}if((g|0)!=(t|0)){if(g>>>0<(c[2552>>2]|0)>>>0){Ga()}s=g+8|0;if((c[s>>2]|0)==(o|0)){l=s}else{Ga()}}else{l=g+8|0}c[q+12>>2]=g;c[l>>2]=q}}while(0);o=r+((a|n)+p)|0;m=a+m|0}g=o+4|0;c[g>>2]=c[g>>2]&-2;c[r+(j+4)>>2]=m|1;c[r+(m+j)>>2]=m;g=m>>>3;if(m>>>0<256){l=g<<1;d=2576+(l<<2)|0;m=c[634]|0;g=1<<g;if((m&g|0)!=0){l=2576+(l+2<<2)|0;g=c[l>>2]|0;if(g>>>0<(c[2552>>2]|0)>>>0){Ga()}else{f=l;e=g}}else{c[634]=m|g;f=2576+(l+2<<2)|0;e=d}c[f>>2]=k;c[e+12>>2]=k;c[r+(j+8)>>2]=e;c[r+(j+12)>>2]=d;break}e=m>>>8;if((e|0)!=0){if(m>>>0>16777215){e=31}else{G=(e+1048320|0)>>>16&8;H=e<<G;F=(H+520192|0)>>>16&4;H=H<<F;e=(H+245760|0)>>>16&2;e=14-(F|G|e)+(H<<e>>>15)|0;e=m>>>(e+7|0)&1|e<<1}}else{e=0}f=2840+(e<<2)|0;c[r+(j+28)>>2]=e;c[r+(j+20)>>2]=0;c[r+(j+16)>>2]=0;l=c[2540>>2]|0;g=1<<e;if((l&g|0)==0){c[2540>>2]=l|g;c[f>>2]=k;c[r+(j+24)>>2]=f;c[r+(j+12)>>2]=k;c[r+(j+8)>>2]=k;break}f=c[f>>2]|0;if((e|0)==31){e=0}else{e=25-(e>>>1)|0}i:do{if((c[f+4>>2]&-8|0)!=(m|0)){e=m<<e;while(1){g=f+(e>>>31<<2)+16|0;l=c[g>>2]|0;if((l|0)==0){break}if((c[l+4>>2]&-8|0)==(m|0)){d=l;break i}else{e=e<<1;f=l}}if(g>>>0<(c[2552>>2]|0)>>>0){Ga()}else{c[g>>2]=k;c[r+(j+24)>>2]=f;c[r+(j+12)>>2]=k;c[r+(j+8)>>2]=k;break h}}else{d=f}}while(0);f=d+8|0;e=c[f>>2]|0;g=c[2552>>2]|0;if(d>>>0<g>>>0){Ga()}if(e>>>0<g>>>0){Ga()}else{c[e+12>>2]=k;c[f>>2]=k;c[r+(j+8)>>2]=e;c[r+(j+12)>>2]=d;c[r+(j+24)>>2]=0;break}}else{H=(c[2548>>2]|0)+m|0;c[2548>>2]=H;c[2560>>2]=k;c[r+(j+4)>>2]=H|1}}while(0);H=r+(h|8)|0;i=b;return H|0}e=2984|0;while(1){d=c[e>>2]|0;if(!(d>>>0>q>>>0)?(n=c[e+4>>2]|0,m=d+n|0,m>>>0>q>>>0):0){break}e=c[e+8>>2]|0}e=d+(n+ -39)|0;if((e&7|0)==0){e=0}else{e=0-e&7}d=d+(n+ -47+e)|0;d=d>>>0<(q+16|0)>>>0?q:d;e=d+8|0;f=r+8|0;if((f&7|0)==0){f=0}else{f=0-f&7}H=p+ -40-f|0;c[2560>>2]=r+f;c[2548>>2]=H;c[r+(f+4)>>2]=H|1;c[r+(p+ -36)>>2]=40;c[2564>>2]=c[3024>>2];c[d+4>>2]=27;c[e+0>>2]=c[2984>>2];c[e+4>>2]=c[2988>>2];c[e+8>>2]=c[2992>>2];c[e+12>>2]=c[2996>>2];c[2984>>2]=r;c[2988>>2]=p;c[2996>>2]=0;c[2992>>2]=e;e=d+28|0;c[e>>2]=7;if((d+32|0)>>>0<m>>>0){do{H=e;e=e+4|0;c[e>>2]=7}while((H+8|0)>>>0<m>>>0)}if((d|0)!=(q|0)){d=d-q|0;e=q+(d+4)|0;c[e>>2]=c[e>>2]&-2;c[q+4>>2]=d|1;c[q+d>>2]=d;e=d>>>3;if(d>>>0<256){f=e<<1;d=2576+(f<<2)|0;g=c[634]|0;e=1<<e;if((g&e|0)!=0){f=2576+(f+2<<2)|0;e=c[f>>2]|0;if(e>>>0<(c[2552>>2]|0)>>>0){Ga()}else{k=f;j=e}}else{c[634]=g|e;k=2576+(f+2<<2)|0;j=d}c[k>>2]=q;c[j+12>>2]=q;c[q+8>>2]=j;c[q+12>>2]=d;break}e=d>>>8;if((e|0)!=0){if(d>>>0>16777215){e=31}else{G=(e+1048320|0)>>>16&8;H=e<<G;F=(H+520192|0)>>>16&4;H=H<<F;e=(H+245760|0)>>>16&2;e=14-(F|G|e)+(H<<e>>>15)|0;e=d>>>(e+7|0)&1|e<<1}}else{e=0}j=2840+(e<<2)|0;c[q+28>>2]=e;c[q+20>>2]=0;c[q+16>>2]=0;f=c[2540>>2]|0;g=1<<e;if((f&g|0)==0){c[2540>>2]=f|g;c[j>>2]=q;c[q+24>>2]=j;c[q+12>>2]=q;c[q+8>>2]=q;break}f=c[j>>2]|0;if((e|0)==31){e=0}else{e=25-(e>>>1)|0}j:do{if((c[f+4>>2]&-8|0)!=(d|0)){e=d<<e;while(1){j=f+(e>>>31<<2)+16|0;g=c[j>>2]|0;if((g|0)==0){break}if((c[g+4>>2]&-8|0)==(d|0)){h=g;break j}else{e=e<<1;f=g}}if(j>>>0<(c[2552>>2]|0)>>>0){Ga()}else{c[j>>2]=q;c[q+24>>2]=f;c[q+12>>2]=q;c[q+8>>2]=q;break g}}else{h=f}}while(0);f=h+8|0;e=c[f>>2]|0;d=c[2552>>2]|0;if(h>>>0<d>>>0){Ga()}if(e>>>0<d>>>0){Ga()}else{c[e+12>>2]=q;c[f>>2]=q;c[q+8>>2]=e;c[q+12>>2]=h;c[q+24>>2]=0;break}}}else{H=c[2552>>2]|0;if((H|0)==0|r>>>0<H>>>0){c[2552>>2]=r}c[2984>>2]=r;c[2988>>2]=p;c[2996>>2]=0;c[2572>>2]=c[752];c[2568>>2]=-1;d=0;do{H=d<<1;G=2576+(H<<2)|0;c[2576+(H+3<<2)>>2]=G;c[2576+(H+2<<2)>>2]=G;d=d+1|0}while((d|0)!=32);d=r+8|0;if((d&7|0)==0){d=0}else{d=0-d&7}H=p+ -40-d|0;c[2560>>2]=r+d;c[2548>>2]=H;c[r+(d+4)>>2]=H|1;c[r+(p+ -36)>>2]=40;c[2564>>2]=c[3024>>2]}}while(0);d=c[2548>>2]|0;if(d>>>0>a>>>0){G=d-a|0;c[2548>>2]=G;H=c[2560>>2]|0;c[2560>>2]=H+a;c[H+(a+4)>>2]=G|1;c[H+4>>2]=a|3;H=H+8|0;i=b;return H|0}}c[(Aa()|0)>>2]=12;H=0;i=b;return H|0}function mb(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;b=i;if((a|0)==0){i=b;return}q=a+ -8|0;r=c[2552>>2]|0;if(q>>>0<r>>>0){Ga()}o=c[a+ -4>>2]|0;n=o&3;if((n|0)==1){Ga()}j=o&-8;h=a+(j+ -8)|0;do{if((o&1|0)==0){u=c[q>>2]|0;if((n|0)==0){i=b;return}q=-8-u|0;o=a+q|0;n=u+j|0;if(o>>>0<r>>>0){Ga()}if((o|0)==(c[2556>>2]|0)){d=a+(j+ -4)|0;if((c[d>>2]&3|0)!=3){d=o;m=n;break}c[2544>>2]=n;c[d>>2]=c[d>>2]&-2;c[a+(q+4)>>2]=n|1;c[h>>2]=n;i=b;return}t=u>>>3;if(u>>>0<256){d=c[a+(q+8)>>2]|0;m=c[a+(q+12)>>2]|0;p=2576+(t<<1<<2)|0;if((d|0)!=(p|0)){if(d>>>0<r>>>0){Ga()}if((c[d+12>>2]|0)!=(o|0)){Ga()}}if((m|0)==(d|0)){c[634]=c[634]&~(1<<t);d=o;m=n;break}if((m|0)!=(p|0)){if(m>>>0<r>>>0){Ga()}p=m+8|0;if((c[p>>2]|0)==(o|0)){s=p}else{Ga()}}else{s=m+8|0}c[d+12>>2]=m;c[s>>2]=d;d=o;m=n;break}s=c[a+(q+24)>>2]|0;t=c[a+(q+12)>>2]|0;do{if((t|0)==(o|0)){u=a+(q+20)|0;t=c[u>>2]|0;if((t|0)==0){u=a+(q+16)|0;t=c[u>>2]|0;if((t|0)==0){p=0;break}}while(1){w=t+20|0;v=c[w>>2]|0;if((v|0)!=0){t=v;u=w;continue}v=t+16|0;w=c[v>>2]|0;if((w|0)==0){break}else{t=w;u=v}}if(u>>>0<r>>>0){Ga()}else{c[u>>2]=0;p=t;break}}else{u=c[a+(q+8)>>2]|0;if(u>>>0<r>>>0){Ga()}r=u+12|0;if((c[r>>2]|0)!=(o|0)){Ga()}v=t+8|0;if((c[v>>2]|0)==(o|0)){c[r>>2]=t;c[v>>2]=u;p=t;break}else{Ga()}}}while(0);if((s|0)!=0){t=c[a+(q+28)>>2]|0;r=2840+(t<<2)|0;if((o|0)==(c[r>>2]|0)){c[r>>2]=p;if((p|0)==0){c[2540>>2]=c[2540>>2]&~(1<<t);d=o;m=n;break}}else{if(s>>>0<(c[2552>>2]|0)>>>0){Ga()}r=s+16|0;if((c[r>>2]|0)==(o|0)){c[r>>2]=p}else{c[s+20>>2]=p}if((p|0)==0){d=o;m=n;break}}if(p>>>0<(c[2552>>2]|0)>>>0){Ga()}c[p+24>>2]=s;r=c[a+(q+16)>>2]|0;do{if((r|0)!=0){if(r>>>0<(c[2552>>2]|0)>>>0){Ga()}else{c[p+16>>2]=r;c[r+24>>2]=p;break}}}while(0);q=c[a+(q+20)>>2]|0;if((q|0)!=0){if(q>>>0<(c[2552>>2]|0)>>>0){Ga()}else{c[p+20>>2]=q;c[q+24>>2]=p;d=o;m=n;break}}else{d=o;m=n}}else{d=o;m=n}}else{d=q;m=j}}while(0);if(!(d>>>0<h>>>0)){Ga()}n=a+(j+ -4)|0;o=c[n>>2]|0;if((o&1|0)==0){Ga()}if((o&2|0)==0){if((h|0)==(c[2560>>2]|0)){w=(c[2548>>2]|0)+m|0;c[2548>>2]=w;c[2560>>2]=d;c[d+4>>2]=w|1;if((d|0)!=(c[2556>>2]|0)){i=b;return}c[2556>>2]=0;c[2544>>2]=0;i=b;return}if((h|0)==(c[2556>>2]|0)){w=(c[2544>>2]|0)+m|0;c[2544>>2]=w;c[2556>>2]=d;c[d+4>>2]=w|1;c[d+w>>2]=w;i=b;return}m=(o&-8)+m|0;n=o>>>3;do{if(!(o>>>0<256)){l=c[a+(j+16)>>2]|0;q=c[a+(j|4)>>2]|0;do{if((q|0)==(h|0)){o=a+(j+12)|0;n=c[o>>2]|0;if((n|0)==0){o=a+(j+8)|0;n=c[o>>2]|0;if((n|0)==0){k=0;break}}while(1){p=n+20|0;q=c[p>>2]|0;if((q|0)!=0){n=q;o=p;continue}p=n+16|0;q=c[p>>2]|0;if((q|0)==0){break}else{n=q;o=p}}if(o>>>0<(c[2552>>2]|0)>>>0){Ga()}else{c[o>>2]=0;k=n;break}}else{o=c[a+j>>2]|0;if(o>>>0<(c[2552>>2]|0)>>>0){Ga()}p=o+12|0;if((c[p>>2]|0)!=(h|0)){Ga()}n=q+8|0;if((c[n>>2]|0)==(h|0)){c[p>>2]=q;c[n>>2]=o;k=q;break}else{Ga()}}}while(0);if((l|0)!=0){n=c[a+(j+20)>>2]|0;o=2840+(n<<2)|0;if((h|0)==(c[o>>2]|0)){c[o>>2]=k;if((k|0)==0){c[2540>>2]=c[2540>>2]&~(1<<n);break}}else{if(l>>>0<(c[2552>>2]|0)>>>0){Ga()}n=l+16|0;if((c[n>>2]|0)==(h|0)){c[n>>2]=k}else{c[l+20>>2]=k}if((k|0)==0){break}}if(k>>>0<(c[2552>>2]|0)>>>0){Ga()}c[k+24>>2]=l;h=c[a+(j+8)>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[2552>>2]|0)>>>0){Ga()}else{c[k+16>>2]=h;c[h+24>>2]=k;break}}}while(0);h=c[a+(j+12)>>2]|0;if((h|0)!=0){if(h>>>0<(c[2552>>2]|0)>>>0){Ga()}else{c[k+20>>2]=h;c[h+24>>2]=k;break}}}}else{k=c[a+j>>2]|0;a=c[a+(j|4)>>2]|0;j=2576+(n<<1<<2)|0;if((k|0)!=(j|0)){if(k>>>0<(c[2552>>2]|0)>>>0){Ga()}if((c[k+12>>2]|0)!=(h|0)){Ga()}}if((a|0)==(k|0)){c[634]=c[634]&~(1<<n);break}if((a|0)!=(j|0)){if(a>>>0<(c[2552>>2]|0)>>>0){Ga()}j=a+8|0;if((c[j>>2]|0)==(h|0)){l=j}else{Ga()}}else{l=a+8|0}c[k+12>>2]=a;c[l>>2]=k}}while(0);c[d+4>>2]=m|1;c[d+m>>2]=m;if((d|0)==(c[2556>>2]|0)){c[2544>>2]=m;i=b;return}}else{c[n>>2]=o&-2;c[d+4>>2]=m|1;c[d+m>>2]=m}h=m>>>3;if(m>>>0<256){a=h<<1;e=2576+(a<<2)|0;j=c[634]|0;h=1<<h;if((j&h|0)!=0){h=2576+(a+2<<2)|0;a=c[h>>2]|0;if(a>>>0<(c[2552>>2]|0)>>>0){Ga()}else{f=h;g=a}}else{c[634]=j|h;f=2576+(a+2<<2)|0;g=e}c[f>>2]=d;c[g+12>>2]=d;c[d+8>>2]=g;c[d+12>>2]=e;i=b;return}f=m>>>8;if((f|0)!=0){if(m>>>0>16777215){f=31}else{v=(f+1048320|0)>>>16&8;w=f<<v;u=(w+520192|0)>>>16&4;w=w<<u;f=(w+245760|0)>>>16&2;f=14-(u|v|f)+(w<<f>>>15)|0;f=m>>>(f+7|0)&1|f<<1}}else{f=0}g=2840+(f<<2)|0;c[d+28>>2]=f;c[d+20>>2]=0;c[d+16>>2]=0;a=c[2540>>2]|0;h=1<<f;a:do{if((a&h|0)!=0){g=c[g>>2]|0;if((f|0)==31){f=0}else{f=25-(f>>>1)|0}b:do{if((c[g+4>>2]&-8|0)!=(m|0)){f=m<<f;a=g;while(1){h=a+(f>>>31<<2)+16|0;g=c[h>>2]|0;if((g|0)==0){break}if((c[g+4>>2]&-8|0)==(m|0)){e=g;break b}else{f=f<<1;a=g}}if(h>>>0<(c[2552>>2]|0)>>>0){Ga()}else{c[h>>2]=d;c[d+24>>2]=a;c[d+12>>2]=d;c[d+8>>2]=d;break a}}else{e=g}}while(0);g=e+8|0;f=c[g>>2]|0;h=c[2552>>2]|0;if(e>>>0<h>>>0){Ga()}if(f>>>0<h>>>0){Ga()}else{c[f+12>>2]=d;c[g>>2]=d;c[d+8>>2]=f;c[d+12>>2]=e;c[d+24>>2]=0;break}}else{c[2540>>2]=a|h;c[g>>2]=d;c[d+24>>2]=g;c[d+12>>2]=d;c[d+8>>2]=d}}while(0);w=(c[2568>>2]|0)+ -1|0;c[2568>>2]=w;if((w|0)==0){d=2992|0}else{i=b;return}while(1){d=c[d>>2]|0;if((d|0)==0){break}else{d=d+8|0}}c[2568>>2]=-1;i=b;return}function nb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0;d=i;do{if((a|0)!=0){if(b>>>0>4294967231){c[(Aa()|0)>>2]=12;e=0;break}if(b>>>0<11){e=16}else{e=b+11&-8}e=ob(a+ -8|0,e)|0;if((e|0)!=0){e=e+8|0;break}e=lb(b)|0;if((e|0)==0){e=0}else{f=c[a+ -4>>2]|0;f=(f&-8)-((f&3|0)==0?8:4)|0;ub(e|0,a|0,(f>>>0<b>>>0?f:b)|0)|0;mb(a)}}else{e=lb(b)|0}}while(0);i=d;return e|0}function ob(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;d=i;e=a+4|0;g=c[e>>2]|0;j=g&-8;f=a+j|0;l=c[2552>>2]|0;if(a>>>0<l>>>0){Ga()}n=g&3;if(!((n|0)!=1&a>>>0<f>>>0)){Ga()}h=a+(j|4)|0;o=c[h>>2]|0;if((o&1|0)==0){Ga()}if((n|0)==0){if(b>>>0<256){q=0;i=d;return q|0}if(!(j>>>0<(b+4|0)>>>0)?!((j-b|0)>>>0>c[3016>>2]<<1>>>0):0){q=a;i=d;return q|0}q=0;i=d;return q|0}if(!(j>>>0<b>>>0)){f=j-b|0;if(!(f>>>0>15)){q=a;i=d;return q|0}c[e>>2]=g&1|b|2;c[a+(b+4)>>2]=f|3;c[h>>2]=c[h>>2]|1;pb(a+b|0,f);q=a;i=d;return q|0}if((f|0)==(c[2560>>2]|0)){f=(c[2548>>2]|0)+j|0;if(!(f>>>0>b>>>0)){q=0;i=d;return q|0}q=f-b|0;c[e>>2]=g&1|b|2;c[a+(b+4)>>2]=q|1;c[2560>>2]=a+b;c[2548>>2]=q;q=a;i=d;return q|0}if((f|0)==(c[2556>>2]|0)){h=(c[2544>>2]|0)+j|0;if(h>>>0<b>>>0){q=0;i=d;return q|0}f=h-b|0;if(f>>>0>15){c[e>>2]=g&1|b|2;c[a+(b+4)>>2]=f|1;c[a+h>>2]=f;q=a+(h+4)|0;c[q>>2]=c[q>>2]&-2;b=a+b|0}else{c[e>>2]=g&1|h|2;b=a+(h+4)|0;c[b>>2]=c[b>>2]|1;b=0;f=0}c[2544>>2]=f;c[2556>>2]=b;q=a;i=d;return q|0}if((o&2|0)!=0){q=0;i=d;return q|0}h=(o&-8)+j|0;if(h>>>0<b>>>0){q=0;i=d;return q|0}g=h-b|0;n=o>>>3;do{if(!(o>>>0<256)){m=c[a+(j+24)>>2]|0;o=c[a+(j+12)>>2]|0;do{if((o|0)==(f|0)){o=a+(j+20)|0;n=c[o>>2]|0;if((n|0)==0){o=a+(j+16)|0;n=c[o>>2]|0;if((n|0)==0){k=0;break}}while(1){q=n+20|0;p=c[q>>2]|0;if((p|0)!=0){n=p;o=q;continue}q=n+16|0;p=c[q>>2]|0;if((p|0)==0){break}else{n=p;o=q}}if(o>>>0<l>>>0){Ga()}else{c[o>>2]=0;k=n;break}}else{n=c[a+(j+8)>>2]|0;if(n>>>0<l>>>0){Ga()}p=n+12|0;if((c[p>>2]|0)!=(f|0)){Ga()}l=o+8|0;if((c[l>>2]|0)==(f|0)){c[p>>2]=o;c[l>>2]=n;k=o;break}else{Ga()}}}while(0);if((m|0)!=0){l=c[a+(j+28)>>2]|0;n=2840+(l<<2)|0;if((f|0)==(c[n>>2]|0)){c[n>>2]=k;if((k|0)==0){c[2540>>2]=c[2540>>2]&~(1<<l);break}}else{if(m>>>0<(c[2552>>2]|0)>>>0){Ga()}l=m+16|0;if((c[l>>2]|0)==(f|0)){c[l>>2]=k}else{c[m+20>>2]=k}if((k|0)==0){break}}if(k>>>0<(c[2552>>2]|0)>>>0){Ga()}c[k+24>>2]=m;f=c[a+(j+16)>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[2552>>2]|0)>>>0){Ga()}else{c[k+16>>2]=f;c[f+24>>2]=k;break}}}while(0);f=c[a+(j+20)>>2]|0;if((f|0)!=0){if(f>>>0<(c[2552>>2]|0)>>>0){Ga()}else{c[k+20>>2]=f;c[f+24>>2]=k;break}}}}else{k=c[a+(j+8)>>2]|0;j=c[a+(j+12)>>2]|0;o=2576+(n<<1<<2)|0;if((k|0)!=(o|0)){if(k>>>0<l>>>0){Ga()}if((c[k+12>>2]|0)!=(f|0)){Ga()}}if((j|0)==(k|0)){c[634]=c[634]&~(1<<n);break}if((j|0)!=(o|0)){if(j>>>0<l>>>0){Ga()}l=j+8|0;if((c[l>>2]|0)==(f|0)){m=l}else{Ga()}}else{m=j+8|0}c[k+12>>2]=j;c[m>>2]=k}}while(0);if(g>>>0<16){c[e>>2]=h|c[e>>2]&1|2;q=a+(h|4)|0;c[q>>2]=c[q>>2]|1;q=a;i=d;return q|0}else{c[e>>2]=c[e>>2]&1|b|2;c[a+(b+4)>>2]=g|3;q=a+(h|4)|0;c[q>>2]=c[q>>2]|1;pb(a+b|0,g);q=a;i=d;return q|0}return 0}function pb(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;d=i;h=a+b|0;l=c[a+4>>2]|0;do{if((l&1|0)==0){p=c[a>>2]|0;if((l&3|0)==0){i=d;return}l=a+(0-p)|0;m=p+b|0;q=c[2552>>2]|0;if(l>>>0<q>>>0){Ga()}if((l|0)==(c[2556>>2]|0)){e=a+(b+4)|0;if((c[e>>2]&3|0)!=3){e=l;n=m;break}c[2544>>2]=m;c[e>>2]=c[e>>2]&-2;c[a+(4-p)>>2]=m|1;c[h>>2]=m;i=d;return}s=p>>>3;if(p>>>0<256){e=c[a+(8-p)>>2]|0;n=c[a+(12-p)>>2]|0;o=2576+(s<<1<<2)|0;if((e|0)!=(o|0)){if(e>>>0<q>>>0){Ga()}if((c[e+12>>2]|0)!=(l|0)){Ga()}}if((n|0)==(e|0)){c[634]=c[634]&~(1<<s);e=l;n=m;break}if((n|0)!=(o|0)){if(n>>>0<q>>>0){Ga()}o=n+8|0;if((c[o>>2]|0)==(l|0)){r=o}else{Ga()}}else{r=n+8|0}c[e+12>>2]=n;c[r>>2]=e;e=l;n=m;break}r=c[a+(24-p)>>2]|0;t=c[a+(12-p)>>2]|0;do{if((t|0)==(l|0)){u=16-p|0;t=a+(u+4)|0;s=c[t>>2]|0;if((s|0)==0){t=a+u|0;s=c[t>>2]|0;if((s|0)==0){o=0;break}}while(1){u=s+20|0;v=c[u>>2]|0;if((v|0)!=0){s=v;t=u;continue}v=s+16|0;u=c[v>>2]|0;if((u|0)==0){break}else{s=u;t=v}}if(t>>>0<q>>>0){Ga()}else{c[t>>2]=0;o=s;break}}else{s=c[a+(8-p)>>2]|0;if(s>>>0<q>>>0){Ga()}u=s+12|0;if((c[u>>2]|0)!=(l|0)){Ga()}q=t+8|0;if((c[q>>2]|0)==(l|0)){c[u>>2]=t;c[q>>2]=s;o=t;break}else{Ga()}}}while(0);if((r|0)!=0){q=c[a+(28-p)>>2]|0;s=2840+(q<<2)|0;if((l|0)==(c[s>>2]|0)){c[s>>2]=o;if((o|0)==0){c[2540>>2]=c[2540>>2]&~(1<<q);e=l;n=m;break}}else{if(r>>>0<(c[2552>>2]|0)>>>0){Ga()}q=r+16|0;if((c[q>>2]|0)==(l|0)){c[q>>2]=o}else{c[r+20>>2]=o}if((o|0)==0){e=l;n=m;break}}if(o>>>0<(c[2552>>2]|0)>>>0){Ga()}c[o+24>>2]=r;p=16-p|0;q=c[a+p>>2]|0;do{if((q|0)!=0){if(q>>>0<(c[2552>>2]|0)>>>0){Ga()}else{c[o+16>>2]=q;c[q+24>>2]=o;break}}}while(0);p=c[a+(p+4)>>2]|0;if((p|0)!=0){if(p>>>0<(c[2552>>2]|0)>>>0){Ga()}else{c[o+20>>2]=p;c[p+24>>2]=o;e=l;n=m;break}}else{e=l;n=m}}else{e=l;n=m}}else{e=a;n=b}}while(0);l=c[2552>>2]|0;if(h>>>0<l>>>0){Ga()}m=a+(b+4)|0;o=c[m>>2]|0;if((o&2|0)==0){if((h|0)==(c[2560>>2]|0)){v=(c[2548>>2]|0)+n|0;c[2548>>2]=v;c[2560>>2]=e;c[e+4>>2]=v|1;if((e|0)!=(c[2556>>2]|0)){i=d;return}c[2556>>2]=0;c[2544>>2]=0;i=d;return}if((h|0)==(c[2556>>2]|0)){v=(c[2544>>2]|0)+n|0;c[2544>>2]=v;c[2556>>2]=e;c[e+4>>2]=v|1;c[e+v>>2]=v;i=d;return}n=(o&-8)+n|0;m=o>>>3;do{if(!(o>>>0<256)){k=c[a+(b+24)>>2]|0;m=c[a+(b+12)>>2]|0;do{if((m|0)==(h|0)){o=a+(b+20)|0;m=c[o>>2]|0;if((m|0)==0){o=a+(b+16)|0;m=c[o>>2]|0;if((m|0)==0){j=0;break}}while(1){q=m+20|0;p=c[q>>2]|0;if((p|0)!=0){m=p;o=q;continue}p=m+16|0;q=c[p>>2]|0;if((q|0)==0){break}else{m=q;o=p}}if(o>>>0<l>>>0){Ga()}else{c[o>>2]=0;j=m;break}}else{o=c[a+(b+8)>>2]|0;if(o>>>0<l>>>0){Ga()}l=o+12|0;if((c[l>>2]|0)!=(h|0)){Ga()}p=m+8|0;if((c[p>>2]|0)==(h|0)){c[l>>2]=m;c[p>>2]=o;j=m;break}else{Ga()}}}while(0);if((k|0)!=0){l=c[a+(b+28)>>2]|0;m=2840+(l<<2)|0;if((h|0)==(c[m>>2]|0)){c[m>>2]=j;if((j|0)==0){c[2540>>2]=c[2540>>2]&~(1<<l);break}}else{if(k>>>0<(c[2552>>2]|0)>>>0){Ga()}l=k+16|0;if((c[l>>2]|0)==(h|0)){c[l>>2]=j}else{c[k+20>>2]=j}if((j|0)==0){break}}if(j>>>0<(c[2552>>2]|0)>>>0){Ga()}c[j+24>>2]=k;h=c[a+(b+16)>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[2552>>2]|0)>>>0){Ga()}else{c[j+16>>2]=h;c[h+24>>2]=j;break}}}while(0);h=c[a+(b+20)>>2]|0;if((h|0)!=0){if(h>>>0<(c[2552>>2]|0)>>>0){Ga()}else{c[j+20>>2]=h;c[h+24>>2]=j;break}}}}else{j=c[a+(b+8)>>2]|0;a=c[a+(b+12)>>2]|0;b=2576+(m<<1<<2)|0;if((j|0)!=(b|0)){if(j>>>0<l>>>0){Ga()}if((c[j+12>>2]|0)!=(h|0)){Ga()}}if((a|0)==(j|0)){c[634]=c[634]&~(1<<m);break}if((a|0)!=(b|0)){if(a>>>0<l>>>0){Ga()}b=a+8|0;if((c[b>>2]|0)==(h|0)){k=b}else{Ga()}}else{k=a+8|0}c[j+12>>2]=a;c[k>>2]=j}}while(0);c[e+4>>2]=n|1;c[e+n>>2]=n;if((e|0)==(c[2556>>2]|0)){c[2544>>2]=n;i=d;return}}else{c[m>>2]=o&-2;c[e+4>>2]=n|1;c[e+n>>2]=n}a=n>>>3;if(n>>>0<256){b=a<<1;h=2576+(b<<2)|0;j=c[634]|0;a=1<<a;if((j&a|0)!=0){b=2576+(b+2<<2)|0;a=c[b>>2]|0;if(a>>>0<(c[2552>>2]|0)>>>0){Ga()}else{g=b;f=a}}else{c[634]=j|a;g=2576+(b+2<<2)|0;f=h}c[g>>2]=e;c[f+12>>2]=e;c[e+8>>2]=f;c[e+12>>2]=h;i=d;return}f=n>>>8;if((f|0)!=0){if(n>>>0>16777215){f=31}else{u=(f+1048320|0)>>>16&8;v=f<<u;t=(v+520192|0)>>>16&4;v=v<<t;f=(v+245760|0)>>>16&2;f=14-(t|u|f)+(v<<f>>>15)|0;f=n>>>(f+7|0)&1|f<<1}}else{f=0}a=2840+(f<<2)|0;c[e+28>>2]=f;c[e+20>>2]=0;c[e+16>>2]=0;h=c[2540>>2]|0;g=1<<f;if((h&g|0)==0){c[2540>>2]=h|g;c[a>>2]=e;c[e+24>>2]=a;c[e+12>>2]=e;c[e+8>>2]=e;i=d;return}g=c[a>>2]|0;if((f|0)==31){f=0}else{f=25-(f>>>1)|0}a:do{if((c[g+4>>2]&-8|0)!=(n|0)){f=n<<f;a=g;while(1){h=a+(f>>>31<<2)+16|0;g=c[h>>2]|0;if((g|0)==0){break}if((c[g+4>>2]&-8|0)==(n|0)){break a}else{f=f<<1;a=g}}if(h>>>0<(c[2552>>2]|0)>>>0){Ga()}c[h>>2]=e;c[e+24>>2]=a;c[e+12>>2]=e;c[e+8>>2]=e;i=d;return}}while(0);f=g+8|0;a=c[f>>2]|0;h=c[2552>>2]|0;if(g>>>0<h>>>0){Ga()}if(a>>>0<h>>>0){Ga()}c[a+12>>2]=e;c[f>>2]=e;c[e+8>>2]=a;c[e+12>>2]=g;c[e+24>>2]=0;i=d;return}function qb(b,c){b=b|0;c=c|0;var d=0,e=0,f=0;d=i;f=a[b>>0]|0;e=a[c>>0]|0;if(f<<24>>24!=e<<24>>24|f<<24>>24==0|e<<24>>24==0){b=f;f=e;b=b&255;f=f&255;f=b-f|0;i=d;return f|0}do{b=b+1|0;c=c+1|0;f=a[b>>0]|0;e=a[c>>0]|0}while(!(f<<24>>24!=e<<24>>24|f<<24>>24==0|e<<24>>24==0));b=f&255;f=e&255;f=b-f|0;i=d;return f|0}function rb(){}function sb(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0,i=0;f=b+e|0;if((e|0)>=20){d=d&255;i=b&3;h=d|d<<8|d<<16|d<<24;g=f&~3;if(i){i=b+4-i|0;while((b|0)<(i|0)){a[b>>0]=d;b=b+1|0}}while((b|0)<(g|0)){c[b>>2]=h;b=b+4|0}}while((b|0)<(f|0)){a[b>>0]=d;b=b+1|0}return b-e|0}function tb(b){b=b|0;var c=0;c=b;while(a[c>>0]|0){c=c+1|0}return c-b|0}function ub(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;if((e|0)>=4096)return pa(b|0,d|0,e|0)|0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b>>0]=a[d>>0]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b>>0]=a[d>>0]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function vb(b,c){b=b|0;c=c|0;var d=0;do{a[b+d>>0]=a[c+d>>0];d=d+1|0}while(a[c+(d-1)>>0]|0);return b|0}




// EMSCRIPTEN_END_FUNCS
return{_strlen:tb,_free:mb,_main:hb,_realloc:nb,_memset:sb,_malloc:lb,_memcpy:ub,_jsextract:ib,_strcpy:vb,runPostSets:rb,stackAlloc:Pa,stackSave:Qa,stackRestore:Ra,setThrew:Sa,setTempRet0:Va,getTempRet0:Wa}})


// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "_send": _send, "_lseek": _lseek, "___setErrNo": ___setErrNo, "_system": _system, "_fflush": _fflush, "_pwrite": _pwrite, "_strerror_r": _strerror_r, "_open": _open, "_sbrk": _sbrk, "_snprintf": _snprintf, "_emscripten_memcpy_big": _emscripten_memcpy_big, "_fileno": _fileno, "_sysconf": _sysconf, "_close": _close, "__formatString": __formatString, "_putchar": _putchar, "_pread": _pread, "_printf": _printf, "_sprintf": _sprintf, "__reallyNegative": __reallyNegative, "_write": _write, "___errno_location": ___errno_location, "_recv": _recv, "_fputc": _fputc, "_mkport": _mkport, "__exit": __exit, "_read": _read, "_abort": _abort, "_fwrite": _fwrite, "_time": _time, "_fprintf": _fprintf, "_strerror": _strerror, "_mknod": _mknod, "_mkdir": _mkdir, "_exit": _exit, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity, "_stderr": _stderr, "_stdout": _stdout }, buffer);
var _strlen = Module["_strlen"] = asm["_strlen"];
var _free = Module["_free"] = asm["_free"];
var _main = Module["_main"] = asm["_main"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _jsextract = Module["_jsextract"] = asm["_jsextract"];
var _strcpy = Module["_strcpy"] = asm["_strcpy"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];

Runtime.stackAlloc = asm['stackAlloc'];
Runtime.stackSave = asm['stackSave'];
Runtime.stackRestore = asm['stackRestore'];
Runtime.setTempRet0 = asm['setTempRet0'];
Runtime.getTempRet0 = asm['getTempRet0'];


// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;

// === Auto-generated postamble setup entry stuff ===

if (memoryInitializer) {
  if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
    var data = Module['readBinary'](memoryInitializer);
    HEAPU8.set(data, STATIC_BASE);
  } else {
    addRunDependency('memory initializer');
    Browser.asyncLoad(memoryInitializer, function(data) {
      HEAPU8.set(data, STATIC_BASE);
      removeRunDependency('memory initializer');
    }, function(data) {
      throw 'could not load memory initializer ' + memoryInitializer;
    });
  }
}

function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
};
ExitStatus.prototype = new Error();
ExitStatus.prototype.constructor = ExitStatus;

var initialStackTop;
var preloadStartTime = null;
var calledMain = false;

dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!Module['calledRun'] && shouldRunNow) run();
  if (!Module['calledRun']) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
}

Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');

  args = args || [];

  ensureInitRuntime();

  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);

  initialStackTop = STACKTOP;

  try {

    var ret = Module['_main'](argc, argv, 0);


    // if we're not running an evented main loop, it's time to exit
    if (!Module['noExitRuntime']) {
      exit(ret);
    }
  }
  catch(e) {
    if (e instanceof ExitStatus) {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      return;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
      return;
    } else {
      if (e && typeof e === 'object' && e.stack) Module.printErr('exception thrown: ' + [e, e.stack]);
      throw e;
    }
  } finally {
    calledMain = true;
  }
}




function run(args) {
  args = args || Module['arguments'];

  if (preloadStartTime === null) preloadStartTime = Date.now();

  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }

  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later
  if (Module['calledRun']) return; // run may have just been called through dependencies being fulfilled just in this very frame

  function doRun() {
    if (Module['calledRun']) return; // run may have just been called while the async setStatus time below was happening
    Module['calledRun'] = true;

    ensureInitRuntime();

    preMain();

    if (ENVIRONMENT_IS_WEB && preloadStartTime !== null) {
      Module.printErr('pre-main prep time: ' + (Date.now() - preloadStartTime) + ' ms');
    }

    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;

function exit(status) {
  ABORT = true;
  EXITSTATUS = status;
  STACKTOP = initialStackTop;

  // exit the runtime
  exitRuntime();

  // TODO We should handle this differently based on environment.
  // In the browser, the best we can do is throw an exception
  // to halt execution, but in node we could process.exit and
  // I'd imagine SM shell would have something equivalent.
  // This would let us set a proper exit status (which
  // would be great for checking test exit statuses).
  // https://github.com/kripken/emscripten/issues/1371

  // throw an exception to halt the current execution
  throw new ExitStatus(status);
}
Module['exit'] = Module.exit = exit;

function abort(text) {
  if (text) {
    Module.print(text);
    Module.printErr(text);
  }

  ABORT = true;
  EXITSTATUS = 1;

  var extra = '\nIf this abort() is unexpected, build with -s ASSERTIONS=1 which can give more information.';

  throw 'abort() at ' + stackTrace() + extra;
}
Module['abort'] = Module.abort = abort;

// {{PRE_RUN_ADDITIONS}}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}


run();

// {{POST_RUN_ADDITIONS}}






// {{MODULE_ADDITIONS}}






