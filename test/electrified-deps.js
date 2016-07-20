describe('[desktop] .electrified dependencies', function(){

  this.timeout(60 * 60 * 1000); // 60mins

  var _ = require('lodash');
  var fs = require('fs');
  var path = require('path');
  var spawn = require('child_process').spawn;

  var should = require('should');
  var shell  = require('shelljs');

  var stdio_config = 'inherit';

  var meteor_bin = 'meteor' + (process.platform == 'win32' ? '.bat' : '');
  
  var Desktop = require('../lib');

  var tests_dir  = path.join(require('os').tmpdir(), 'desktop-tests');

  var root_dir = path.join(__dirname, '..');
  var npm_dir  = path.join(root_dir, '.npm', 'node_modules', 'desktop');

  var meteor_app_dir    = path.join(tests_dir, 'leaderboard');
  var packages_dir      = path.join(meteor_app_dir, 'packages');
  var desktop_pkg_dir = path.join(packages_dir, 'arboleya-desktop');
  
  var desktop_dir = path.join(meteor_app_dir, '.desktop');

  var desktop;

  before(function(done){
    console.log('preparing test environment');

    process.env.DEVDESKTOP = true;

    // reset tests dir
    shell.rm('-rf', npm_dir);
    shell.rm('-rf', tests_dir);

    shell.mkdir('-p', tests_dir);
    shell.mkdir('-p', desktop_dir);

    desktop = Desktop(desktop_dir);

    shell.rm('-rf', desktop.env.core.root);

    // crates a sample app and add the package
    spawn(meteor_bin, ['create', '--example', 'leaderboard'], {
      cwd: tests_dir,
      stdio: stdio_config
    }).on('exit', function(){

      // creates internal folder and link it with the package
      shell.mkdir('-p', packages_dir);
      shell.ln('-s', path.join(__dirname, '..'), desktop_pkg_dir);

      // remove mobile platforms
      spawn(meteor_bin, ['remove-platform', 'android', 'ios'], {
        cwd: meteor_app_dir,
        stdio: stdio_config
      }).on('exit', function(){
        // add desktop package
        spawn(meteor_bin, ['add', 'arboleya:desktop'], {
          cwd: meteor_app_dir,
          stdio: stdio_config,
          env: _.extend({DEVDESKTOP: true}, process.env)
        }).on('exit', done);
      });
    });
  });

  it('should ensure .desktop dependencies', function(done) {

    process.env.DEVDESKTOP = false;
    desktop = Desktop(desktop_dir);

    desktop.scaffold.prepare();

    var node_mods           = path.join(desktop_dir, 'node_modules');
    var node_mods_desktop = path.join(node_mods, 'desktop');

    // sets a previous version already published to ensure its being
    // installed at least
    var pkg_path = path.join(desktop_dir, 'package.json');
    var pkg      = require(pkg_path);

    pkg.dependencies.desktop = '1.2.2';
    fs.writeFileSync(pkg_path, JSON.stringify(pkg, null, 2));

    desktop.app.ensure_deps(function(){
      should(fs.existsSync(node_mods_desktop)).be.ok();
      done();
    });

  });

});
