// View alerts for the Peterbox prank pages (/hellopeter, /petersux).
// Posts a one-line message to a private ntfy.sh topic; subscribe to it in the ntfy app.
// Only runs in a real browser, so link previews (iMessage, Slack) never trigger it.
// Visit any of these pages with ?me once per device to stop your own visits alerting.
// To take it all down: delete this file and the two page folders.
(function () {
  var TOPIC = 'https://ntfy.sh/peterbox-ab188e1696c07a85';
  var mine = false;
  try {
    if (/[?&]me\b/.test(location.search)) localStorage.setItem('peterbox-me', '1');
    mine = localStorage.getItem('peterbox-me') === '1';
  } catch (e) {}
  var ua = navigator.userAgent;
  var device = /iPhone/.test(ua) ? 'an iPhone' : /iPad/.test(ua) ? 'an iPad' : /Android/.test(ua) ? 'an Android phone'
    : /Macintosh/.test(ua) ? 'a Mac' : /Windows/.test(ua) ? 'a Windows PC' : 'an unknown device';

  window.peterboxNotify = function (title, message, tags) {
    if (mine) return;
    try {
      // Plain-text POST with query-string options: a simple CORS request, no preflight.
      fetch(TOPIC + '?title=' + encodeURIComponent(title) + '&tags=' + encodeURIComponent(tags),
        { method: 'POST', body: message + ' (' + device + ')', keepalive: true }).catch(function () {});
    } catch (e) {}
  };
})();
