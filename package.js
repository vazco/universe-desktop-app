var VERSION = '1.0.0';

Package.describe({
  name: 'universe:desktop-app',
  version: VERSION,
  summary: 'Package your Meteor apps with Electron, and butter. Updated version',
  git: 'https://github.com/arboleya/desktop',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.3');

  api.use(['random', 'ecmascript']);
  api.addFiles('meteor/index.js', ['server', 'client']);
  api.export('Desktop');
});
