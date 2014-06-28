var a = new Int32Array(32);
console.log(a.__proto__.constructor(8));
var COM = {};

COM.argv = [];

COM.standard_quake = true;

COM.DefaultExtension = function(path, extension)
{
	var i, src;
	for (i = path.length - 1; i >= 0; --i)
	{
		src = path.charCodeAt(i);
		if (src === 47)
			break;
		if (src === 46)
			return path;
	}
	return path + extension;
};

COM.Parse = function(data)
{
	COM.token = '';
	var i = 0, c;
	if (data.length === 0)
		return;
		
	var skipwhite = true;
	for (;;)
	{
		if (skipwhite !== true)
			break;
		skipwhite = false;
		for (;;)
		{
			if (i >= data.length)
				return;
			c = data.charCodeAt(i);
			if (c > 32)
				break;
			++i;
		}
		if ((c === 47) && (data.charCodeAt(i + 1) == 47))
		{
			for (;;)
			{
				if ((i >= data.length) || (data.charCodeAt(i) === 10))
					break;
				++i;
			}
			skipwhite = true;
		}
	}

	if (c === 34)
	{
		++i;
		for (;;)
		{
			c = data.charCodeAt(i);
			++i;
			if ((i >= data.length) || (c === 34))
				return data.substring(i);
			COM.token += String.fromCharCode(c);
		}
	}

	for (;;)
	{
		if ((i >= data.length) || (c <= 32))
			break;
		COM.token += String.fromCharCode(c);
		++i;
		c = data.charCodeAt(i);
	}

	return data.substring(i);
};

COM.CheckParm = function(parm)
{
	var i;
	for (i = 1; i < COM.argv.length; ++i)
	{
		if (COM.argv[i] === parm)
			return i;
	}
};

COM.CheckRegistered = function()
{
	var h = COM.LoadFile('gfx/pop.lmp');
	if (h == null)
	{
		Con.Print('Playing shareware version.\n');
		if (COM.modified === true)
			Sys.Error('You must have the registered version to use modified games');
		return;
	}
	var check = new Uint8Array(h);
	var pop =
	new Uint8Array([
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00, 0x66, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x66, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x66, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x67, 0x00, 0x00,
		0x00, 0x00, 0x66, 0x65, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x65, 0x66, 0x00,
		0x00, 0x63, 0x65, 0x61, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x61, 0x65, 0x63,
		0x00, 0x64, 0x65, 0x61, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x61, 0x65, 0x64,
		0x00, 0x64, 0x65, 0x64, 0x00, 0x00, 0x64, 0x69, 0x69, 0x69, 0x64, 0x00, 0x00, 0x64, 0x65, 0x64,
		0x00, 0x63, 0x65, 0x68, 0x62, 0x00, 0x00, 0x64, 0x68, 0x64, 0x00, 0x00, 0x62, 0x68, 0x65, 0x63,
		0x00, 0x00, 0x65, 0x67, 0x69, 0x63, 0x00, 0x64, 0x67, 0x64, 0x00, 0x63, 0x69, 0x67, 0x65, 0x00,
		0x00, 0x00, 0x62, 0x66, 0x67, 0x69, 0x6A, 0x68, 0x67, 0x68, 0x6A, 0x69, 0x67, 0x66, 0x62, 0x00,
		0x00, 0x00, 0x00, 0x62, 0x65, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x65, 0x62, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00, 0x00, 0x62, 0x63, 0x64, 0x66, 0x64, 0x63, 0x62, 0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x62, 0x66, 0x62, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x61, 0x66, 0x61, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x65, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x64, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
	]);
	var i;
	for (i = 0; i < 256; ++i)
	{
		if (check[i] !== pop[i])
			Sys.Error('Corrupted data file.');
	}
	Cvar.Set('registered', '1');
	Con.Print('Playing registered version.\n');
};

COM.InitArgv = function(argv)
{
	COM.cmdline = (argv.join(' ') + ' ').substring(0, 256);
	var i;
	for (i = 0; i < argv.length; ++i)
		COM.argv[i] = argv[i];	
	if (COM.CheckParm('-safe') != null)
	{
		COM.argv[COM.argv.length] = '-nosound';
		COM.argv[COM.argv.length] = '-nocdaudio';
		COM.argv[COM.argv.length] = '-nomouse';
	}
	if (COM.CheckParm('-rogue') != null)
	{
		COM.rogue = true;
		COM.standard_quake = false;
	}
	else if (COM.CheckParm('-hipnotic') != null)
	{
		COM.hipnotic = true;
		COM.standard_quake = false;
	}
};

COM.Init = function()
{
	var swaptest = new ArrayBuffer(2);
	var swaptestview = new Uint8Array(swaptest);
	swaptestview[0] = 1;
	swaptestview[1] = 0;
	if ((new Uint16Array(swaptest))[0] === 1)
		COM.LittleLong = (function(l) {return l;});
	else
		COM.LittleLong = (function(l) {return (l >>> 24) + ((l & 0xff0000) >>> 8) + (((l & 0xff00) << 8) >>> 0) + ((l << 24) >>> 0);});

	COM.registered = Cvar.RegisterVariable('registered', '0');
	Cvar.RegisterVariable('cmdline', COM.cmdline, false, true);
	Cmd.AddCommand('path', COM.Path_f);
	COM.InitFilesystem();
	COM.CheckRegistered();
};

COM.searchpaths = [];

COM.Path_f = function()
{
	Con.Print('Current search path:\n');
	var i = COM.searchpaths.length, j, s;
	for (i = COM.searchpaths.length - 1; i >= 0; --i)
	{
		s = COM.searchpaths[i];
		for (j = s.pack.length - 1; j >= 0; --j)
			Con.Print(s.filename + '/' + 'pak' + j + '.pak (' + s.pack[j].length + ' files)\n');
		Con.Print(s.filename + '\n');
	}
};

COM.WriteFile = function(filename, data, len)
{
	filename = filename.toLowerCase();
	var dest = [], i;
	for (i = 0; i < len; ++i)
		dest[i] = String.fromCharCode(data[i]);
	try
	{
		localStorage.setItem('Quake.' + COM.searchpaths[COM.searchpaths.length - 1].filename + '/' + filename, dest.join(''));
	}
	catch (e)
	{
		Sys.Print('COM.WriteFile: failed on ' + filename + '\n');
		return;
	}
	Sys.Print('COM.WriteFile: ' + filename + '\n');
	return true;
};

COM.WriteTextFile = function(filename, data)
{
	filename = filename.toLowerCase();
	try
	{
		localStorage.setItem('Quake.' + COM.searchpaths[COM.searchpaths.length - 1].filename + '/' + filename, data);
	}
	catch (e)
	{
		Sys.Print('COM.WriteTextFile: failed on ' + filename + '\n');
		return;
	}
	Sys.Print('COM.WriteTextFile: ' + filename + '\n');
	return true;
};

COM.files = {};

COM.ReadFileEFS = function(filename){
    for(var i=0; i<COM.searchpaths[0].pack.length; i++){
        if(COM.searchpaths[0].pack[i].files[filename]){
            //console.log(filename+" found in pak");
            var file = COM.searchpaths[0]
                          .pack[i]
                          .files[filename];
            var buf = COM.searchpaths[0]
                         .pack[i]
                         .pak
                         .buffer
                         .slice(file.filepos, file.filepos+file.filelen);
            return buf;
        }
    }
    /*if(COM.files[filename]){
        console.log(filename+" already readed");
        var buf = COM.files[filename];
    } else {
        console.log(filename+" still not readed");
        var stat = FS.stat(filename);
        var stream = FS.open(filename, 'r');
        var buf = new ArrayBuffer(stat.size);
        var dest = new Uint8Array(buf);
        FS.read(stream, dest, 0, stat.size, 0);
        FS.close(stream);
        COM.files[filename] = buf;
    }*/
    console.warn("Failed to read "+filename+" from pak");
    console.log(COM.searchpaths);
    return null;
};

COM.LoadFile = function(filename)
{
    console.log(filename+" requested");//NFP
    //console.log("COM.searchpaths.length = "+COM.searchpaths.length);//NFP
	filename = filename.toLowerCase();
	Draw.BeginDisc();
    return COM.ReadFileEFS(filename);
	Sys.Print('FindFile: can\'t find ' + filename + '\n');
	Draw.EndDisc();
};

COM.LoadTextFile = function(filename)
{
	var buf = COM.LoadFile(filename);
	if (buf == null)
		return;
	var bufview = new Uint8Array(buf);
	var f = [];
	var i;
	for (i = 0; i < bufview.length; ++i)
	{
		if (bufview[i] !== 13)
			f[f.length] = String.fromCharCode(bufview[i]);
	}
	return f.join('');
};

COM.LoadPackFile = function(pakbuf)
{
    console.log("COM.LoadPackFile start");
	var header = new DataView(pakbuf);
	if (header.getUint32(0, true) !== 0x4b434150)
		Sys.Error(packfile + ' is not a packfile');
	var dirofs = header.getUint32(4, true);
	var dirlen = header.getUint32(8, true);
	var numpackfiles = dirlen >> 6;
	if (numpackfiles !== 339)
		COM.modified = true;
	var pack = {}; var name = '';
    console.log("COM.LoadPackFile numpackfiles is "+numpackfiles);
	if (numpackfiles !== 0)
	{
		var info = pakbuf;
		if (CRC.Block(new Uint8Array(info)) !== 32981)
			COM.modified = true;
        var dvinfo = new DataView(info, dirofs);
		var i;
		for (i = 0; i < numpackfiles; ++i)
		{
		    name = Q.memstr(new Uint8Array(info, dirofs + (i << 6), 56)).toLowerCase();
			pack[name] =
			{
				filepos: dvinfo.getUint32((i << 6) + 56, true),
				filelen: dvinfo.getUint32((i << 6) + 60, true)
			}
		}
	}
	Con.Print('Added packfile (' + numpackfiles + ' files)\n');
	return pack;
};

COM.AddGameDirectory = function(dir, callback)
{
    //"QUAKE/ID1"
    console.log("Sync is present?"+navigator.getDeviceStorageSync||navigator.getDeviceStoragesync);
    var retst = new RegExp(dir+'\/?pak\\d?\.pak', "i");
    var paks = navigator.getDeviceStorage('sdcard');
    // Let's browse all the files available
    var cursor = paks.enumerate(dir);
	var search = {filename: dir, pack: []};
	var pak, i = 0;
    var readed = false;
    cursor.onsuccess = function () {
      var file = this.result;
      function totalsuccess(){
        readed = true;
        //console.log(search.pack.length+" pak files readed in the end");//NFP
        //console.log(JSON.stringify(FS.stat("gfx.wad")));
        COM.searchpaths.push(search);
        // COM.searchpaths[0].pack[i]
        callback();
      }
      if(file && retst.test(file.name)){
          console.log("Pak file found: " + file.name);
          var reader = new FileReader();
          reader.addEventListener("loadend", function() {
                console.log("Loaded pak file: " + file.name);
                var array = new Uint8Array(reader.result);
                (function(_array){
                    search.pack.push({pak: _array, files: COM.LoadPackFile(array.buffer)});
                 }(array));
             //FS.deleteFile(file.name);
             if(search.pack.length>1) totalsuccess();
          });
          var request = paks.get(file.name);
          request.onsuccess = function(){
                    console.log("Succes on open "+file.name);//NFP
                    reader.readAsArrayBuffer(file);
              };
          request.onerror = function () { console.warn("Unable to get the file: " + fnm + "got error: '\n    "+this.error); };
      } else console.log("Non-pak file found: " + file ? file.name : "no file");
      // Once we found a file we check if there is other results
      if (!this.done || this.result===undefined) {
        // Then we move to the next result, which call the cursor
        // success with the next file as result.
        console.log(search.pack.length+" pak files readed in process");//NFP 
        this.continue();
      } else {
        totalsuccess();
        return;
      }
    }

    cursor.onerror = function () {
      console.warn("No file found: " + this.error);
    }
    alert("Pause1.. Press when done, please.");
	/*for (;;)
	{
		pak = COM.LoadPackFile(dir + '/' + 'pak' + i + '.pak');
		if (pak == null)
			break;
		search.pack[search.pack.length] = pak;
		++i;
	}
	COM.searchpaths[COM.searchpaths.length] = search;*/
};

COM.InitFilesystem = function()
{
	var i, search;
    /*if(!FS.init.initialized){
        console.log("init emscriptens FS");//NFP
        FS.init();//emscriptens FS
    } else {
        console.log("emscriptens FS already initialized. So test:");//NFP
        FS.writeFile('file', 'foobar');
        FS.symlink('file', 'link');
        console.log(FS.readlink('link'));
    }*/
	i = COM.CheckParm('-basedir');
	if (i != null)
		search = COM.argv[i + 1];
	if (search != null)
		COM.AddGameDirectory(search, additionsadd);
	else
		COM.AddGameDirectory('id1', additionsadd);
	function additionsadd(){
        console.log("COM.InitFilesystem additionsadd()");//NFP
        if (COM.rogue === true)
            COM.AddGameDirectory('rogue', gameadd);
        else if (COM.hipnotic === true)
            COM.AddGameDirectory('hipnotic', gameadd);
        else gameadd();
	}
	function gameadd(){
        console.log("COM.InitFilesystem gameadd()");//NFP
        i = COM.CheckParm('-game');
        if (i != null)
        {
            search = COM.argv[i + 1];
            if (search != null)
            {
                COM.modified = true;
                COM.AddGameDirectory(search, end);
            }
        }
        if(!null || !search) end();
        console.log("COM.InitFilesystem gameadd(), "+i+", "+search);//NFP
    }
    function end(){
        console.log("COM.InitFilesystem end()");//NFP
	    COM.gamedir = [COM.searchpaths[COM.searchpaths.length - 1]];
    }
    alert("Pause2.. Press when done, please.");
};
