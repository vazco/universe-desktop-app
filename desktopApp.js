module.exports.isDesktopApp = function () {
    if (typeof window === 'object') {
        return window.desktopApp;
    }
    return process.env.UNIVERSE_DESKTOP_APP || false;
}
