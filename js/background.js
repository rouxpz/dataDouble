//background script running in the extension.

let updatedData = [['commerce', 0], ['search', 0], ['social', 0], ['finance', 0], ['info', 0], ['adult', 0], ['confounder', 0]];
let keyLog = '';
let words = [];
let topTen = [];
let infoLinks = [];

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({updatedData: updatedData}, function() {
    console.log("initial data refreshed");
  });

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({})],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.cmd == "update") { //categorization
    newData = request.data;
    console.log("Data updated!");

    for (var i = 0; i < updatedData.length; i++) {
      if (newData.search(updatedData[i][0]) != -1) {
        console.log(updatedData[i][0] + " matches!");
        updatedData[i][1] += 1;
        console.log(updatedData[i]);
      }
    }
  } else if (request.msg == 'new keystrokes'){ //keystroke logger
    newKeyData = request.keystrokes.replace('Enter', '\n').replace('Shift', '');
    keyLog += newKeyData;
    lines = keyLog.split('\n');
    for (var i = 0; i < lines.length; i++) {
      splitLines = lines[i].split(' ');
      for (var j = 0; j < splitLines.length; j++) {
        if (splitLines[j] != '') {
          words.push(splitLines[j]);
        }
      }
    }
    console.log(words);
    keyLog = '';
  } else if (request.msg === "new email") { //including words from written emails
    emailData = request.data;
    emailData = emailData.replace('\n', ' ').replace('.', '').replace(',', '').replace('!', '').replace('?', '');
    emailWords = emailData.split(' ');
    for (var i = 0; i < emailWords.length; i++) {
      words.push(emailWords[i]);
    }
  } else if (request.msg === "info link update") {
    newInfoLink = request.data;
    // console.log(newInfoLink);
    if (infoLinks.indexOf(newInfoLink) === -1) {
      infoLinks.push(newInfoLink);
      // console.log(infoLinks);
      // console.log(infoLinks.length);
    } else {
      console.log("no new links");
    }
  } else if (request.msg === "new search") {
    newSearchData = request.data; //search logger
    newSearchData = newSearchData.split(' ');

    for (var i = 0; i < newSearchData.length; i++) {
      if (newSearchData[i] != "") {
        words.push(newSearchData[i]);
      }
    }
    console.log(words);
  } else if (request.msg === "send data to popup") { //send everything to popup
    //get top 10 keywords to send to popup
    var sorted = [];
    var count = {};

    words.forEach(function(i) {
      count[i] = (count[i]||0) + 1;
    });

    for (var c in count) {
      sorted.push([c, count[c]]);
    }

    sorted = sorted.sort(function(a, b){
      return b[1] - a[1];
    });

    sorted.length = 10;
    console.log(sorted);

    //send everything to popup
    chrome.runtime.sendMessage({
      msg: "here is the new data",
      data: updatedData,
      keys: words,
      linkNumber: infoLinks.length
    });
    console.log("new data sent to popup");
  }
});
