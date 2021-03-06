var net = require('net');
var spawn = require('child_process').spawn;

module.exports = function (input, output, settings, cli) {
    return new Desktop(input, output, settings, cli);
};

function Desktop (input, output, settings, cli) {
    this.log = require('./log')(this, 'desktop:index');

    this.log.info('initializing');

    if (!input)
        throw new Error('Root param must to be informed!');

    this.env = require('./env')(input, output, settings, cli);

    this.scaffold = require('./scaffold')(this);
    this.electron = require('./electron')(this);
    this.app = require('./app')(this);
    this.plugins = require('./plugins')(this);

    this.plugins.use(require('./plugins/mongodb'));
    this.plugins.use(require('./plugins/nodejs'));
}

Desktop.prototype.isup = function () {
    return this.plugins.isup();
};

Desktop.prototype.start = function (done) {
    this.log.info('start');

    var self = this;

    if (this.env.app.is_packaged)
        this.plugins.start(function () {
            if (done)
                done(self.plugins.get('nodejs').config.ROOT_URL);
        });

    else
        this.app.run(function () {
            if (done)
                done(self.plugins.get('nodejs').config.ROOT_URL);
        });
};

Desktop.prototype.stop = function (done) {
    this.app.terminate(done);
};

Desktop.prototype.waterfal = function (methods) {
    var self = this, method = methods.shift();
    method[0].apply(method[1], [function () {
        if (methods.length)
            self.waterfal(methods);
    }]);
};

Desktop.prototype._kill = function (process) {
    if (this.env.os.is_windows)
        spawn("taskkill", ["/pid", process.pid, '/f', '/t']);
    else
        process.kill();
};

Desktop.prototype.freeport = function (start, done) {
    var self = this;
    start = start || 3500;
    var socket = new net.Socket()
        .once('connect', function () {
            socket.destroy();
            self.freeport(++start, done);
        })
        .once('error', function (/* err */) {
            socket.destroy();
            done(start);
        })
        .connect(start, '127.0.0.1');
};
