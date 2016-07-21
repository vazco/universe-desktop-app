import SockJS from 'sockjs-client/lib/main';

if (Meteor.isClient) {
    Meteor.isElectron = window.process && window.process.versions && !!window.process.versions.electron;
} else {
    Meteor.isElectron = global.process && global.process.versions && !!global.process.versions.electron;
}
// Desktop = {};
//
// var callbacks = {};
// var socket;
// var where;
//
// Meteor.startup(function () {
//     if (Meteor.isServer) {
//         where = 'server';
//         Meteor.methods({
//             'desktop.get.socket.port': function () {
//                 return process.env.SOCKET_PORT || null;
//             }
//         });
//
//         connect(process.env.SOCKET_PORT);
//     }
//
//     if (Meteor.isClient) {
//         where = 'client';
//         console.log('process.env.SOCKET_PORT', process.env.SOCKET_PORT);
//         Meteor.call('desktop.get.socket.port', [], function (error, port) {
//             connect(port);
//         });
//     }
//
// });
//
// function log () {
//     var args = Array.prototype.slice.call(arguments);
//     console.log('desktop:index@' + where + ':', args.join(' '));
// }
//
// function connect (port) {
//
//     if (!port) {
//         log([
//             'cannot initialize connection. Did you `npm install --save-dev universe-desktop-app`?'
//         ].join('\n'));
//         return;
//     }
//
//     socket = new SockJS('http://127.0.0.1:' + port + '/desktop');
//
//     socket.onopen = function () {
//         log('connection is open');
//         fire_ready_callbacks();
//     };
//
//     socket.onmessage = function (e) {
//         var packet = JSON.parse(e.data);
//         var done;
//
//         if ((done = callbacks[packet.handshake])) {
//             callbacks[packet.handshake] = null;
//             delete callbacks[packet.handshake];
//             done.apply(null, [].concat(packet.error, packet.args));
//         }
//         else
//             done.apply(null, [
//                 'No callback defined for handshake `' + packet.handshake + '`'
//             ]);
//     };
//
//     socket.onclose = function () {
//         log('closing socket connection');
//     };
// }
//
// var startup_callbacks = {
//     server: [],
//     client: []
// };
//
// Desktop.startup = function (ready) {
//     var where = Meteor.isServer ? 'server' : 'client';
//     startup_callbacks[where].push(ready);
// };
//
// function fire_ready_callbacks () {
//     var where = Meteor.isServer ? 'server' : 'client';
//     _.each(startup_callbacks[where], function (ready) {
//         ready();
//     });
//     startup_callbacks[where] = [];
// }
//
// Desktop.call = function (method, args, done) {
//
//     if (!(done instanceof Function))
//         throw new Error('Third argument to `Desktop.call()` must be a funciton');
//
//     if (!socket) {
//         var msg = 'Cannot call methods, socket connection not initialized';
//         console.warn(msg);
//         Meteor.setTimeout(() => {
//             done(new Error(msg));
//         }, 1);
//         return;
//     }
//
//     var packet = {
//         handshake: Random.id(),
//         method: method,
//         args: args
//     };
//
//     callbacks[packet.handshake] = done;
//     socket.send(JSON.stringify(packet));
// };
