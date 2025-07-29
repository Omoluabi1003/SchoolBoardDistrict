// This file is a simple script loader.
// In a real application, you would likely use a more robust module loader like Webpack or RequireJS.
(function() {
  var scripts = [
    'init.js'
    // Add other scripts to load here
  ];

  function loadScript(url, callback) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    if (script.readyState) { //IE
      script.onreadystatechange = function() {
        if (script.readyState === 'loaded' || script.readyState === 'complete') {
          script.onreadystatechange = null;
          callback();
        }
      };
    } else { //Others
      script.onload = function() {
        callback();
      };
    }

    document.getElementsByTagName('head')[0].appendChild(script);
  }

  function loadScriptsSequentially(scripts, index) {
    if (index < scripts.length) {
      loadScript(scripts[index], function() {
        loadScriptsSequentially(scripts, index + 1);
      });
    }
  }

  loadScriptsSequentially(scripts, 0);
})();
