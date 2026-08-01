var fs = new ActiveXObject("Scripting.FileSystemObject");
var ForReading = 1, ForWriting = 2;
var path = "c:\\Users\\rustava\\Downloads\\Проекты\\tetis-blue-calc\\index.html";
var ts = fs.OpenTextFile(path, ForReading, false, -1); // -1 = Unicode (UTF-16), but wait, it's UTF-8!
var html = ts.ReadAll();
ts.Close();
