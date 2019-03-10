//dataDouble
//a project by roopa vasudevan
//browser extension for chrome
//special thanks to wendy chun, jessa lingel, and the members of the critical data studies (f18) and doing internet studies (s19) courses at upenn annenberg

//background script running in the extension to collect context information and sort it to deliver to the popup.

let updatedData = [['commerce', 0], ['search', 0], ['social', 0], ['finance', 0], ['info', 0], ['adult', 0], ['confounder', 0]];
let keyLog = '';
let words = [];
let topTen = [];
let infoLinks = [];
let totalPortraits = 0;
let filename = '';
let totalSites = 0;
let allSites = {};

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({photo: filename, data: updatedData, keys: [], linkNumber: 0, totalPortraits: 0}, function() {
    console.log("initial data refreshed, filename: " + filename);
  });

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({})],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.cmd == "update") { //categorization of URLs visited
    newData = request.data;
    console.log("Data updated!");

    for (var i = 0; i < updatedData.length; i++) {
      if (newData.search(updatedData[i][0]) != -1) {
        console.log(updatedData[i][0] + " matches!");
        updatedData[i][1] += 1;
        console.log(updatedData[i]);
      }
    }
  } else if (request.msg == 'new keystrokes'){ //general keystroke logger
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
  } else if (request.msg === "info link update") { //getting number of news and information sites
    newInfoLink = request.data;
    // console.log(newInfoLink);
    if (infoLinks.indexOf(newInfoLink) === -1) {
      infoLinks.push(newInfoLink);
      // console.log(infoLinks);
      // console.log(infoLinks.length);
    } else {
      console.log("no new links");
    }
  } else if (request.msg === "new search") { //search logger
    newSearchData = request.data;
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

    sorted.length = 5;
    console.log(sorted);
    console.log("Info Diversity: " + infoLinks.length);

    //send everything to popup
    chrome.runtime.sendMessage({
      msg: "here is the new data",
      data: updatedData,
      keys: sorted,
      linkNumber: infoLinks.length,
      totalPortraits: totalPortraits
    });
    console.log("new data sent to popup");

    chrome.storage.sync.set({photo: filename,
      data: updatedData,
      keys: sorted,
      linkNumber: infoLinks.length,
      totalPortraits: totalPortraits}, function() {
      console.log("storage data refreshed");
    });

    totalPortraits += 1;

  } else if (request.msg == "get filename") { //request file info to upload photo
    console.log("filename requested");
    chrome.runtime.sendMessage({
      msg: "sending filename",
      photo: filename
    });
  } else if (request.msg == "photo uploaded") {
    filename = request.filename;
    console.log("NEW PHOTO: " + filename);
    chrome.storage.sync.set({photo: filename,
      data: updatedData,
      keys: sorted,
      linkNumber: infoLinks.length,
      totalPortraits: totalPortraits}, function() {
      console.log("storage data refreshed");
    });
  } else if (request.msg == "site loaded") {
    totalSites += 1;
    urlToCheck = request.url;
    // console.log(urlToCheck + " has been loaded.");
    if (urlToCheck in allSites) {
      // console.log("already here");
      allSites[urlToCheck] += 1;
    } else {
      allSites[urlToCheck] = 1;
    }
    console.log(urlToCheck + " has been loaded " + allSites[urlToCheck] + " times. There have been " + totalSites + " sites visited.");
  }
});
