let clickedLinks = [];

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({color: '#3aa757', clickedLinks: clickedLinks}, function() {
      console.log("The color is green.");
      console.log(clickedLinks);
    });

    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
          // pageUrl: {hostEquals: "http://*/*"},
        })
        ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });
  });

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.cmd == "newLink") {
    clickedLinks.push(request.url);
    console.log("New link added");
    console.log(clickedLinks.length);
  }
});
