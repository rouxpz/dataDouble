let clickedLinks = [];

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({clickedLinks: clickedLinks}, function() {
    console.log(clickedLinks);
  });

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({})],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.cmd == "newLink") {
    clickedLinks.push(request.url);
    console.log("New link added");
  } else if (request.msg === "update data") {
    // console.log(clickedLinks);
    chrome.runtime.sendMessage({
      msg: "new link added",
      data: clickedLinks
    });
    console.log("links sent");
  }
});
