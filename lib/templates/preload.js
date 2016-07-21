var _process = process;
var _require = require;
process.once('loaded', function () {
    global.desktopApp = {process: _process, require: _require};
});
