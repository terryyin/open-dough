// Stored inline by the Open Dough notification sender: a click survives
// sender/server exit and checkout retirement. Only the destination argument
// varies; no page JS runs.
export const notificationActivationSource = String.raw`
function run(argv) {
  try {
    ObjC.import('AppKit');
    function dashboardDocument(value) {
      try {
        var url = $.NSURL.URLWithString(String(value));
        var scheme = ObjC.unwrap(url.scheme);
        var host = ObjC.unwrap(url.host);
        var port = ObjC.unwrap(url.port);
        var path = ObjC.unwrap(url.path);
        if ((scheme !== 'http' && scheme !== 'https') || typeof host !== 'string' || (path !== '/' && path !== '')) return null;
        return scheme.toLowerCase() + '://' + host.toLowerCase() + ':' + String(port === undefined || port === null ? (scheme === 'http' ? 80 : 443) : port);
      } catch (_) { return null; }
    }
    var destination = argv[0];
    var expected = dashboardDocument(destination);
    if (expected === null) throw new Error('Invalid dashboard destination');
    var target = $.NSURL.URLWithString(destination);
    var applicationURL = $.NSWorkspace.sharedWorkspace.URLForApplicationToOpenURL(target);
    var bundle = ObjC.unwrap($.NSBundle.bundleWithURL(applicationURL).bundleIdentifier);
    if (bundle !== 'com.apple.Safari' && bundle !== 'com.google.Chrome') throw new Error('Unsupported default browser');
    var browser = Application(bundle);
    var safari = bundle === 'com.apple.Safari';
    var windows = browser.running() ? browser.windows() : [];
    var chosenWindow = null;
    var chosenTab = null;
    var chosenIndex = 0;
    for (var w = 0; w < windows.length; w++) {
      var tabs = windows[w].tabs();
      for (var t = 0; t < tabs.length; t++) {
        // An Apple Event failure must stop, never masquerade as an absent tab.
        var tabURL = tabs[t].url();
        if (dashboardDocument(tabURL) === expected && chosenTab === null) {
          chosenWindow = windows[w];
          chosenTab = tabs[t];
          chosenIndex = t + 1;
        }
      }
    }
    if (chosenTab !== null) {
      chosenTab.url = destination;
    } else if (windows.length > 0) {
      chosenWindow = windows[0];
      chosenWindow.tabs.push(browser.Tab({url:destination}));
      var tabs = chosenWindow.tabs();
      chosenIndex = tabs.length;
      chosenTab = tabs[chosenIndex - 1];
    } else {
      if (!$.NSWorkspace.sharedWorkspace.openURL(target)) throw new Error('URL opening failed');
      for (var attempt = 0; attempt < 50 && chosenTab === null; attempt++) {
        windows = browser.running() ? browser.windows() : [];
        for (var w = 0; w < windows.length; w++) {
          var tabs = windows[w].tabs();
          for (var t = 0; t < tabs.length; t++) {
            if (tabs[t].url() === destination) { chosenWindow = windows[w]; chosenIndex = t + 1; chosenTab = tabs[t]; break; }
          }
          if (chosenTab !== null) break;
        }
        if (chosenTab === null) delay(0.1);
      }
      if (chosenTab === null) throw new Error('Dashboard tab did not open');
    }
    if (safari) chosenWindow.currentTab = chosenTab;
    else chosenWindow.activeTabIndex = chosenIndex;
    if (safari) chosenWindow.miniaturized = false;
    else chosenWindow.minimized = false;
    chosenWindow.index = 1;
    browser.activate();
  } catch (_) {
    var application = Application.currentApplication();
    application.includeStandardAdditions = true;
    application.displayAlert('Dashboard story could not be opened', {message:'Open the dashboard manually. For future alerts, use Safari or Google Chrome as your default browser and allow the alert sender to control it in System Settings → Privacy & Security → Automation.'});
  }
}
`;
