// This file is used to display a message to users with unsupported browsers.
(function() {
    var unsupportedBrowserMessage = document.getElementById('unsupported-browser-message');
    var closeButton = unsupportedBrowserMessage.querySelector('button');

    function showUnsupportedBrowserMessage() {
      unsupportedBrowserMessage.style.display = 'flex';
    }

    function hideUnsupportedBrowserMessage() {
      unsupportedBrowserMessage.style.display = 'none';
    }

    // Example of browser detection (not comprehensive)
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    var isEdge = !isIE && !!window.StyleMedia;

    // In a real application, you would have more robust browser detection.
    // For this example, let's assume we don't support IE.
    if (isIE) {
      showUnsupportedBrowserMessage();
    }

    closeButton.addEventListener('click', hideUnsupportedBrowserMessage);

    // You can customize the messages dynamically
    var messageTitle = document.getElementById('message-title');
    var messageContent1 = document.getElementById('message-content-1');
    var messageContent2 = document.getElementById('message-content-2');
    var messageContent3 = document.getElementById('message-content-3');

    messageTitle.textContent = 'Browser Not Supported';
    messageContent1.textContent = 'Your browser is not fully supported. For the best experience, please use one of the following browsers:';

  })();
