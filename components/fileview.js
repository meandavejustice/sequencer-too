var tree = require('tree-view');

var browser = tree()

browser.on('directory', function(p, entry) {
  console.log('You clicked on a directory (%s)', p)
  getDirectory(p);
})

browser.on('file', function(p, entry) {
  console.log('You clicked on a file (%s)', p)
  debugger;
})

function getDirectory(p) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://localhost:8441' + p);
  xhr.onloadend = function(ev) {
    var resp = JSON.parse(ev.target.response);
    browser.directory(p, resp);
  }
  xhr.send();
}

browser.appendTo(document.body)

browser.directory('/', [{
  path: '/samples/industrial',
  type: 'directory'
}])


getDirectory('/samples');
