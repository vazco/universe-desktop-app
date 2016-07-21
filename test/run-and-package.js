describe('[desktop] run and package', function(){
  
  this.timeout(60 * 60 * 1000); // 60mins
  
  var fs = require('fs');
  var path = require('path');
  var spawn = require('child_process').spawn;
  var http  = require('http');

  var should = require('should');
  var shell  = require('shelljs');

  var stdio_config;

  var Desktop;

  var tests_dir;

  var root_dir;
  var npm_dir;

  var node_mods_dir;
  var meteor_app_dir;
  var packages_dir;
  var desktop_dir;
  var meteor_electrified_dir;
  
  var desktop;
  var pkg_app_dir;

  var meteor_bin = 'meteor' + (process.platform == 'win32' ? '.bat' : '');

  before(function(done){

    stdio_config = 'inherit';

    Desktop = require('../lib');

    process.env.DEVDESKTOP = true;

    tests_dir  = path.join(require('os').tmpdir(), 'desktop-tests');

    root_dir = path.join(__dirname, '..');
    npm_dir  = path.join(root_dir, '.npm', 'node_modules', 'desktop');

    node_mods_dir          = path.join(tests_dir, 'node_modules');
    meteor_app_dir         = path.join(tests_dir, 'leaderboard');
    meteor_electrified_dir = path.join(meteor_app_dir, '.desktop');
    packages_dir           = path.join(meteor_app_dir, 'packages');
    desktop_dir          = path.join(packages_dir, 'universe-desktop');
    
    var name = 'my-electrified-app';
    var plat = process.platform;
    var arch = process.arch;
    
    var dist_dir  = name + '-' + plat + '-' + arch;

    pkg_app_dir = path.join(meteor_app_dir, '.desktop', '.dist', dist_dir);

    console.log('preparing test environment');

    // reset tests dir
    shell.rm('-rf', npm_dir);
    shell.rm('-rf', tests_dir);

    shell.mkdir('-p', node_mods_dir);
    shell.ln('-s', root_dir, path.join(node_mods_dir, 'desktop'));

    shell.mkdir('-p', meteor_electrified_dir);
    desktop = Desktop(meteor_electrified_dir);
    shell.rm('-rf', desktop.env.core.root);

    desktop.app.init(function(){

      // crates a sample app and add the package
      spawn(meteor_bin, ['create', '--example', 'leaderboard'], {
        cwd: tests_dir,
        stdio: stdio_config
      }).on('exit', function(){

        // creates internal folder and link it with the package
        shell.mkdir('-p', packages_dir);
        shell.ln('-s', path.join(__dirname, '..'), desktop_dir);

        // remove mobile platforms
        spawn(meteor_bin, ['remove-platform', 'android', 'ios'], {
          cwd: meteor_app_dir,
          stdio: stdio_config
        }).on('exit', function(){

          // // add desktop package
          // spawn(meteor_bin, ['add', 'universe:desktop'], {
          //   cwd: meteor_app_dir,
          //   stdio: stdio_config,
          //   env: process.env
          // }).on('exit', done);
        });
      });
      
    });

  });


  it('should run & terminate the app', function(done) {
    desktop.start(function(){
      desktop.stop(function(){
        setTimeout(done, 2500);
      });
    });
  });


  it('should package the app', function(done){
    desktop.app.package({}, function(){
      // give some time for the disk to refresh its state
      setTimeout(function(){
        should(fs.existsSync(pkg_app_dir)).be.ok();
        done();
      }, 5000);
    });
  });


  it('should start / stop the app, in development', function(done){

    var meteor_app    = path.join(meteor_app_dir, '.desktop');
    var new_desktop = Desktop(meteor_app);

    new_desktop.start(function() {
      new_desktop.stop();
      setTimeout(done, 2500);
    });

  });


  it('should start / stop the app, in production', function(done){

    var entry_point = shell.find(pkg_app_dir).filter(function(file) {
      return /app(\\|\/)index\.js$/m.test(file);
    });
    
    var base_dir = path.dirname(entry_point);

    var new_desktop  = Desktop(base_dir);
    new_desktop.start(function(meteor_url){

      // validates if page is responding
      http.get(meteor_url, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(body) {

          // test if body has the meteor config object declared
          /__meteor_runtime_config__/.test(body).should.be.ok();

          new_desktop.stop();

          // give sometime before proceeding, so next tests
          // will have a good time on slow windows machines
          setTimeout(done, 1000);
        });
      });
    });
  });

  // this test is exactly the same as the above one, it's needed to assure
  // subsequent startups
  it('should start / stop the app, in production, AGAIN', function(done){

    var entry_point = shell.find(pkg_app_dir).filter(function(file) {
      return /app(\\|\/)index\.js$/m.test(file);
    });
    
    var base_dir = path.dirname(entry_point);

    var new_desktop  = Desktop(base_dir);
    new_desktop.start(function(meteor_url){

      // validates if page is responding
      http.get(meteor_url, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(body) {

          // test if body has the meteor config object declared
          /__meteor_runtime_config__/.test(body).should.be.ok();

          new_desktop.stop();

          // give sometime before the final analysys, so next tests
          // will have a good time on slow windows machines
          setTimeout(done, 1000);
        });
      });
    });
  });

  // test the methods execution between meteor and electron
  it('should execute methods between Electron <-> Meteor', function(done) {

    var method_sum_path =  path.join(meteor_app_dir, '..', 'method_sum.txt');
    var method_err_path =  path.join(meteor_app_dir, '..', 'method_err.txt');

    // fix paths for windows
    method_sum_path = method_sum_path.replace(/\\/g, '\\\\');
    method_err_path = method_err_path.replace(/\\/g, '\\\\');

    var leaderboard         = path.join(meteor_app_dir, 'leaderboard.js');
    var leaderboard_content = fs.readFileSync(leaderboard, 'utf8');
    var leaderboard_call    = [
      "Desktop.startup(function() {",
      "  if(Meteor.isClient) return;",
      "  var fs = Npm.require('fs');",
      "  var path = Npm.require('path');",
      "  Desktop.call('sum', [4, 2], function(err, res) {",
      "    console.log(arguments);",
      "    console.log('>>', '"+ method_sum_path +"');",
      "    fs.writeFileSync('"+ method_sum_path +"', res);",
      "  });",
      "  Desktop.call('yellow.elephant', [4, 2], function(err, res) {",
      "    console.log(arguments);",
      "    console.log('>>', '"+ method_err_path +"');",
      "    fs.writeFileSync('"+ method_err_path +"', err.message);",
      "  });",
      "});"
    ].join('\n');

    fs.writeFileSync(leaderboard, leaderboard_content + leaderboard_call);

    var new_desktop = Desktop(meteor_electrified_dir);

    new_desktop.methods({
      'sum': function(a, b, _done){
        _done(null, a + b);
      }
    });

    new_desktop.start(function(){

      new_desktop.isup().should.equal(true);

      setTimeout(function(){
        var sum = fs.readFileSync(method_sum_path, 'utf8');
        var error = fs.readFileSync(method_err_path, 'utf8');

        sum.should.equal('6');
        error.should.equal('method `yellow.elephant` was not defined');

        new_desktop.stop(function(){
          setTimeout(done, 500);
        });
      }, 1000);
    });
  });
});
