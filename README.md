# Universe Desktop App

Easily package your Meteor apps with Electron.
Using this package you can build one project which can be both regular meteor app and a offline application for desktop

## Installation locally

````shell
cd /your/meteor/app
meteor npm install --save universe-desktop-app
````

Now, You should add to your package.json on the end of section `scripts` following line:
```
"desktop": "desktop-app"
```

So, everything should look like this example: 
```json
...
"scripts": {
    "start": "meteor --settings=settings.json"
    "desktop": "desktop-app --settings=settings.json"
  },
...
```


## Compatibility

Works on all Meteor's supported [platforms](https://github.com/meteor/meteor/wiki/Supported-Platforms).

## Help

````bash
$ meteor npm run desktop -- --help

  Usage: desktop-app [command] [options]

  Commands:

    run       (default) start meteor app within desktop context
    bundle    bundle meteor app at `.desktop` dir
    package   bundle and package app to `--output` dir

  Options:

    -h, --help             output usage information
    -V, --version          output the version number
    -i, --input    <path>  meteor app dir       | default = .
    -o, --output   <path>  output dir           | default = .desktop/.dist
    -s, --settings <path>  meteor settings file | default = null (optional)

  Examples:

    # cd into meteor dir first
    cd /your/meteor/app

    desktop-app
    desktop-app run
    desktop-app package
    desktop-app package -o /dist/dir
    desktop-app package -o /dist/dir -s file.json
    desktop-app package -i /app/dir -o /dist/dir -s dev.json
    desktop-app package -- <electron-packager-options>

    # more info about electron packager options:
    # ~> https://www.npmjs.com/package/electron-packager
````

### Running app

````shell
cd /your/meteor/app
meteor npm run desktop
````

## Packaging

You should add to your package.json on the end of section `scripts` following line:
```
"build-desktop": "desktop-app package"
```
So, everything should look like this example: 
```json
...
"scripts": {
    "start": "meteor --settings=settings.json",
    "desktop": "desktop-app --settings=settings.json",
    "build-desktop": "desktop-app package --settings=settings.json"
  },
...
```

### Launch build
````shell
cd /your/meteor/app
npm run build-desktop
````

The packaging process is done under the hood using `electron-packager`
npm package. The following variables are automatically set:

  * `--out` -- *comes from cli option [-o, --out]*
  * `--arch` -- *comes from system [current arch]*
  * `--platform` -- *comes from system [current platform]*
  * `--version` -- *comes from .desktop/package.json [current app version]*

You can overwrite these default values and also set others by passing custom
arguments directly to `electron-packager` after `--`, i.e:

````shell
cd /your/meteor/app
desktop-app package -- --icon=/folder/x/img/icon.png --version=x.y.z
````

All the available options for `electron-packager` can be found here:
https://www.npmjs.com/package/electron-packager

### Notes

The output app will match your current operational system and arch type.

  * To get an **OSX** app, run it from a **Osx** machine.
  * To get an **Linux 32bit** app, run it from a **32bit Linux** machine.
  * To get an **Linux 64bit** app, run it from a **64bit Linux** machine.
  * To get an **Windows 32bit** app, run it from a **32bit Windows** machine.
  * To get an **Windows 64bit** app, run it from a **64bit Windows** machine.

Due to NodeJS native bindings of such libraries such as Fibers -- *which are
mandatory for Meteor*, you'll need to have your Meteor app fully working on the
desired platform before installing this plugin and packaging your app.

So, at this time, you cannot package your app in a cross-platform fashion from
one single OS.

Perhaps you can live with it? :)

> **DO NOT** use options to output for multiple arch/platforms at once, such as
`--arch=all`. It won't work, Desktop can bundle Meteor apps only for the
platform you're running on.


## Options

1. `-i, --input` - Meteor app folder, default is current directory (`process.cwd()`).
1. `-o, --output` - Sets output folder for your packaged app, default is
`/your/meteor/app/.dist`
1. `-s, --settings` Sets path for Meteor
[settings](http://docs.meteor.com/#/full/meteor_settings) file, this will be
available inside your Meteor code both in development and after being packaged.

## Structure

You'll notice a new folder called `.desktop` in your meteor app dir, its
structure will be like this:

````
/your/meteor/app
├── .desktop
│   ├── .gitignore
│   ├── desktop.json
│   ├── index.js
│   └── package.json
├── .meteor
└── ...
````

This is a pure Electron project, so you can use the whole Electron API from JS
files in this folder. Also, you can install electron dependencies and store them
in the `package.json` file. Note that the `desktop` package is itself a
dependency.

See this folder as the `desktop layer` for your Meteor app. Remember to check
out the `index.js` file, it constains the desktop start/stop usage.

The `desktop.json` file will hold specific preferences for Desktop, such as
plugins and so on. It's still a WIP, but you can get around it.

### Config (`desktop.json`)

For now there's only one option here: `preserve_db`.

Set it to true to preserve database between installs. It works by saving the
mongo data dir inside user's data folder, instead of being self contained within
the app folder (which gets deleted when new version is installed).

# Customizing

Let's see how one would be able to do a simple SplashScreen:

````javascript
var app       = require('app');
var browser   = require('browser-window');
var desktop = require('universe-desktop-app')(__dirname);

var window = null;
var splash = null; // splash variable

app.on('ready', function() {
  splash = new browser({ // starts splash window
    // >>> your configs here
  });
  splash.loadUrl('./splash.html'); // create the ".desktop/splash.html" file
  
  // then move along and start desktop
  desktop.start(function(meteor_root_url) {

    // before opening a new window with your app, destroy the splash window
    splash.close(); // >>> or .destroy(), check what works for you


    // from here on, well, nothing changes..


    window = new browser({
      width: 1200, height: 900,
      'node-integration': false // node integration must to be off
    });
    window.loadUrl(meteor_root_url);
  });
});


// ....
```

## Upgrading

When upgrading to newer versions, it's **important** to know that:

### ~> templates

Once these files exists on disk, they *will not* be overwritten.
 * `.desktop/index.js`
 * `.desktop/package.json`
 * `.desktop/desktop.json`
 * `.desktop/.gitignore.json`

## License

The MIT License (MIT)
This package is forked from desktop package by Anderson Arboleya, (provided under MIT)
