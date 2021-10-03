//dataDouble
//a project by roopa vasudevan
//browser extension for chrome
//visit datadouble.art for more information about the project

//background script running in the extension to collect context information and sort it to deliver to the popup.

var stopwords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should', "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't", 'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"];

let updatedData;
let keyLog = '';
let words = [];
let topTen = [];
let infoLinks = [];
let totalPortraits;
let filename = "";
let totalSites;
let uniqueSites;
let allSites = {};
let keys;
let linkNumber;
var count = {};

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.get(["photo", "data", "keys", "linkNumber", "totalPortraits", "total", "unique", "wordCount"], function(obj) {
    // console.log(obj);
    if (obj.photo === undefined) {
      // console.log("no filename");
      filename = '';
      updatedData = [['commerce', 0], ['search', 0], ['social', 0], ['finance', 0], ['info', 0], ['adult', 0], ['confounder', 0]];
      keys = [];
      linkNumber = 0;
      totalPortraits = 0;
      totalSites = 0;
      uniqueSites = 0;
      count = {};
    } else {
      // console.log(obj.photo);
      filename = obj.photo;
      updatedData = obj.data;
      keys = obj.keys;
      sorted = obj.keys;
      linkNumber = obj.linkNumber;
      totalPortraits = obj.totalPortraits;
      totalSites = obj.total;
      uniqueSites = obj.unique;
      count = obj.wordCount;
    }
    // console.log(obj.wordCount);
  });

  chrome.storage.sync.set({photo: filename, data: updatedData, keys: keys, linkNumber: linkNumber, totalPortraits: totalPortraits, total:totalSites, unique:uniqueSites, wordCount: count}, function() {
    // console.log("data refreshed, filename: " + filename);
  });

  // chrome.storage.sync.get("photo", function(result) {
  //   console.log(result);
  // });

  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({})],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

chrome.runtime.onStartup.addListener(function() {
  // console.log("started up");

  chrome.storage.sync.get(["photo", "data", "keys", "linkNumber", "totalPortraits", "total", "unique", "wordCount"], function(obj) {
    // console.log(obj);
    if (obj.photo === undefined) {
      // console.log("no filename");
      filename = '';
      updatedData = [['commerce', 0], ['search', 0], ['social', 0], ['finance', 0], ['info', 0], ['adult', 0], ['confounder', 0]];
      keys = [];
      linkNumber = 0;
      totalPortraits = 0;
      totalSites = 0;
      uniqueSites = 0;
      count = {};
    } else {
      // console.log(obj.photo);
      filename = obj.photo;
      updatedData = obj.data;
      keys = obj.keys;
      sorted = obj.keys;
      linkNumber = obj.linkNumber;
      totalPortraits = obj.totalPortraits;
      totalSites = obj.total;
      uniqueSites = obj.unique;
      count = obj.wordCount;
    }
  });

  chrome.storage.sync.set({photo: filename, data: updatedData, keys: keys, linkNumber: linkNumber, totalPortraits: totalPortraits, total:totalSites, unique:uniqueSites, wordCount: count}, function() {
    // console.log("data refreshed, filename: " + filename);
  });
})

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.cmd == "update") { //categorization of URLs visited
    newData = request.data;
    // console.log("Data updated!");

    for (var i = 0; i < updatedData.length; i++) {
      if (newData.search(updatedData[i][0]) != -1) {
        // console.log(updatedData[i][0] + " matches!");
        updatedData[i][1] += 1;
        // console.log(updatedData[i]);
      }
    }
  } else if (request.msg == 'new keystrokes'){ //general keystroke logger
    newKeyData = request.keystrokes.replace('Enter', '\n').replace('Shift', '').replace('Backspace', '');
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
    // console.log(words);
    keyLog = '';
  } else if (request.msg === "new email") { //including words from written emails
    emailData = request.data;
    emailData = emailData.replace('\n', ' ').replace('.', '').replace(',', '').replace('!', '').replace('?', '');
    emailWords = emailData.split(' ');
    for (var i = 0; i < emailWords.length; i++) {
      if (stopwords.indexOf(emailWords[i]) == -1) {
        words.push(emailWords[i]);
      }
    }
  } else if (request.msg === "info link update") { //getting number of news and information sites
    newInfoLink = request.data;
    // console.log(newInfoLink);
    if (infoLinks.indexOf(newInfoLink) === -1) {
      infoLinks.push(newInfoLink);
      // console.log(infoLinks);
      // console.log(infoLinks.length);
    } else {
      // console.log("");
    }
  } else if (request.msg === "new search") { //search logger
    newSearchData = request.data;
    newSearchData = newSearchData.replace('\n', ' ').replace('.', '').replace(',', '').replace('!', '').replace('?', '').replace('%27', "'");
    newSearchData = newSearchData.split(' ');

    for (var i = 0; i < newSearchData.length; i++) {
      if (newSearchData[i] != "" && stopwords.indexOf(newSearchData[i]) == -1) {
        words.push(newSearchData[i]);
      }
    }
    // console.log(words);
  } else if (request.msg === "send data to popup") { //send everything to popup
    //get top 10 keywords to send to popup

    console.log(count);
    var sorted = [];

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
    if (sorted[0] != null) {
      keys = sorted;
    }

    //send everything to popup
    chrome.runtime.sendMessage({
      msg: "here is the new data",
      data: updatedData,
      keys: keys,
      linkNumber: infoLinks.length,
      totalPortraits: totalPortraits,
      total: totalSites,
      unique: uniqueSites,
      wordCount: count
    });

    chrome.storage.sync.set({photo: filename,
      data: updatedData,
      keys: keys,
      linkNumber: infoLinks.length,
      totalPortraits: totalPortraits,
      total: totalSites,
      unique: uniqueSites,
      wordCount: count
    }, function() {
      // console.log("storage data refreshed");
      words = [];
    });

    totalPortraits += 1;

  } else if (request.msg == "get filename") { //request file info to upload photo
    // console.log("filename requested");
    chrome.runtime.sendMessage({
      msg: "sending filename",
      photo: filename
    });
  } else if (request.msg == "photo uploaded") {
    filename = request.filename;
    // console.log("NEW PHOTO: " + filename);
    chrome.storage.sync.set({photo: filename,
      data: updatedData,
      keys: keys,
      linkNumber: infoLinks.length,
      totalPortraits: totalPortraits,
      total: totalSites,
      unique: uniqueSites,
      wordCount: count}, function() {
      // console.log("storage data refreshed");
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
      uniqueSites += 1;
    }

    chrome.runtime.sendMessage({
      msg: "sending new site data",
      total: totalSites
    });

  } else if (request.msg == "new photo requested") {
    filename = request.filename;
    chrome.storage.sync.set({photo: filename,
      data: updatedData,
      keys: keys,
      linkNumber: infoLinks.length,
      totalPortraits: totalPortraits,
      total: totalSites,
      unique: uniqueSites,
      wordCount: count}, function() {
      // console.log("need new photo");
    });
  }
});
