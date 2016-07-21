var app = require('app');
var browser = require('browser-window');
var desktop = require('universe-desktop-app')(__dirname);

var window = null;

app.on('ready', function () {
    // electrify start
    electrify.start(function (meteor_root_url) {
        // creates a new electron window
        window = new browser({
            width: 1280, height: 800,
            'node-integration': false, // node integration must to be off
            preload: path.join(__dirname, 'preload.js')
        });
        // open up meteor root url
        window.loadURL(meteor_root_url);
    });
});


app.on('window-all-closed', function () {
    app.quit();
});


app.on('will-quit', function terminate_and_quit (event) {

    // if desktop is up, cancel exiting with `preventDefault`,
    // so we can terminate desktop gracefully without leaving child
    // processes hanging in background
    if (desktop.isup() && event) {

        // holds electron termination
        event.preventDefault();

        // gracefully stops desktop
        desktop.stop(function () {

            // and then finally quit app
            app.quit();
        });
    }
});

