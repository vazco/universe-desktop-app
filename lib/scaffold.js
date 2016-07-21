var fs = require('fs');
var path = require('path');
var shell = require('shelljs');

module.exports = function ($) {
    return new Scaffold($);
};

function Scaffold ($) {
    this.$ = $;
    this.log = require('./log')($, 'desktop:scaffold');
}

Scaffold.prototype.prepare = function () {

    this.log.info('ensuring basic structure');

    shell.mkdir('-p', this.$.env.app.bin);
    shell.mkdir('-p', this.$.env.core.tmp);
    shell.mkdir('-p', this.$.env.core.root);

    var index = path.join(this.$.env.app.root, 'index.js');
    var preload = path.join(this.$.env.app.root, 'preload.js');
    var package = path.join(this.$.env.app.root, 'package.json');
    var config = path.join(this.$.env.app.root, 'desktop.json');
    var gitignore = path.join(this.$.env.app.root, '.gitignore');

    var index_tmpl = path.join(__dirname, 'templates', 'index.js');

    // in development mode we overwrite this file everytime
    if (!fs.existsSync(index) || this.$.env.in_development_mode) {
        fs.writeFileSync(index, fs.readFileSync(index_tmpl, 'utf8'));
    }

    var preload_tmpl = path.join(__dirname, 'templates', 'preload.js');

    // in development mode we overwrite this file everytime
    if (!fs.existsSync(preload) || this.$.env.in_development_mode) {
        fs.writeFileSync(preload, fs.readFileSync(preload_tmpl, 'utf8'));
    }

    if (!fs.existsSync(package)) {
        fs.writeFileSync(package, JSON.stringify({
            name: 'myDesktopApp',
            main: 'index.js',
            dependencies: {"universe-desktop-app": this.$.env.version}
        }, null, 2));
    }

    if (!fs.existsSync(config)) {
        fs.writeFileSync(config, JSON.stringify({
            "plugins": [],
            "port": 3000
        }, null, 2));
    }

    if (!fs.existsSync(gitignore)) {
        fs.writeFileSync(gitignore, [
            '.DS_Store', '.dist', 'app',
            'bin', 'db', 'node_modules'
        ].join('\n'));
    }
};
