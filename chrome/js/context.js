//dataDouble
//a project by roopa vasudevan
//browser extension for chrome
//special thanks to wendy chun, jessa lingel, and the members of the critical data studies (f18) and doing internet studies (s19) courses at upenn annenberg

//code for interacting with user browsing activity.

var categories = [['google.com', 'Internet and Telecom > Search Engine'], ['facebook.com', 'Internet and Telecom > Social Network'], ['youtube.com', 'Arts and Entertainment > TV and Video'], ['amazon.com', 'Shopping > General Merchandise'], ['yahoo.com', 'News and Media'], ['pornhub.com', 'Adult'], ['xnxx.com', 'Adult'], ['xvideos.com', 'Adult'], ['ebay.com', 'Shopping > General Merchandise'], ['twitter.com', 'Internet and Telecom > Social Network'], ['wikipedia.org', 'Reference > Dictionaries and Encyclopedias'], ['instagram.com', 'Internet and Telecom > Social Network'], ['reddit.com', 'Internet and Telecom > Social Network'], ['bing.com', 'Internet and Telecom > Search Engine'], ['craigslist.org', 'Shopping > Classifieds'], ['live.com', 'Internet and Telecom > Email'], ['walmart.com', 'Shopping > General Merchandise'], ['xhamster.com', 'Adult'], ['netflix.com', 'Arts and Entertainment > TV and Video'], ['ampproject.org', 'Computer and Electronics > Software'], ['espn.com', 'News and Media > Sports News'], ['chase.com', 'Finance > Banking'], ['salliemae.com', 'Finance > Banking'], ['myfedloan.com', 'Finance > Banking'], ['citibank.com', 'Finance > Banking'], ['tdbank.com', 'Finance > Banking'], ['hsbc.com', 'Finance > Banking'], ['vanguard.com', 'Finance > Banking'], ['capitalone.com', 'Finance > Banking'], ['pinterest.com', 'Internet and Telecom > Social Network'], ['americanexpress.com', 'Finance > Banking'], ['buzzfeed.com', 'News and Media'], ['discover.com', 'Finance > Banking'], ['paypal.com', 'Finance > Financial Management'], ['tumblr.com', 'Internet and Telecom > Social Network'], ['cnn.com', 'News and Media'], ['bbc.com', 'News and Media'], ['aljazeera.com', 'News and Media'], ['cnn.com', 'News and Media'], ['linkedin.com', 'Internet and Telecom > Social Network'], ['msn.com', 'News and Media'], ['chaturbate.com', 'Adult'], ['indeed.com', 'Career and Education > Jobs and Employment'], ['office.com', 'Computer and Electronics > Software'], ['target.com', 'Shopping'], ['foxnews.com', 'News and Media'], ['imdb.com', 'Arts and Entertainment > Movies'], ['bestbuy.com', 'Shopping > Consumer Electronics'], ['zillow.com', 'Finance > Real Estate'], ['accuweather.com', 'News and Media > Weather'], ['pncbank.com', 'Finance > Banking'], ['xfinity.com', 'Arts and Entertainment > TV and Video'], ['imgur.com', 'Internet and Telecom > File Sharing'], ['wellsfargo.com', 'Finance > Banking'], ['venmo.com', 'Finance > Financial Management'], ['dailymail.co.uk', 'News and Media > Newspapers'], ['npr.org', 'News and Media > Radio'], ['drudgereport.com', 'News and Media'], ['homedepot.com', 'Shopping > Home and Garden'], ['nytimes.com', 'News and Media > Newspapers'], ['bankofamerica.com', 'Finance > Banking'], ['yelp.com', 'Reference > Directories'], ['etsy.com', 'Shopping > General Merchandise'], ['microsoftonline.com', 'Computer and Electronics > Software'], ['duckduckgo.com', 'Internet and Telecom > Search Engine'], ['wikia.com', 'Arts and Entertainment > TV and Video'], ['stackoverflow.com', 'Internet and Telecom > Social Network'], ['github.com', 'Internet and Telecom > Social Network']];

var query = '';
var pattern = /:\/\/[^\/]*\//g;
let currentLocation;
let gmailText = '';
let toSend = '';


window.onload = function() {
  // console.log(window.location.href);
  getSearch();
  currentLocation = window.location.href;
  // console.log(currentLocation);
  var matches = currentLocation.match(pattern);
  // console.log(matches);
  var urlToCheck = matches[0].replace("://", '').replace('/', '');
  // console.log(urlToCheck);
  chrome.runtime.sendMessage({
    msg: "site loaded",
    url: urlToCheck
  });

  console.log(categories.length);
  for (var i = 0; i < categories.length; i++) {
    if (currentLocation.search(categories[i][0]) != -1) {
      // console.log("Matches " + categories[i][1]);
      matchCategories(categories[i][1], categories[i][0]);
      break;
    } else if (i === categories.length - 1 && currentLocation.search(categories[i][0]) === -1) {
      // console.log("confounder");
      matchCategories("confounder", categories[i][0]);
    }
  }
}

function trackMouse() {
  // let images = document.getElementsByTagName("img");
  let links = document.getElementsByTagName("a");
  // console.log(images);

  // for (var i = 0; i < images.length-1; i++) {
  //   images[i].onmouseover = function() {
  //     console.log(this.src);
  //   }
  // }

  for (var i = 0; i < links.length; i++) {
    links[i].onmousedown = function() {
      console.log(this.href);
      for (var i = 0; i < categories.length; i++) {
        if (this.href.search(categories[i][0]) != -1) {
          console.log(categories[i][0] + " matches!");
          console.log(categories[i][1]);
          matchCategories(categories[i][1], categories[i][0]);
          break;
        } else if (i === 51 && currentLocation.search(categories[i][0]) === -1) {
          console.log("confounder");
          matchCategories("confounder", categories[i][0]);
        }
      }
    }
  }

  if (window.location.href.indexOf("mail.google.com") != -1) {
    console.log("ON GMAIL");

    document.body.onmousedown = function(e) {
      getGmailText();
    }
  // } else if (window.location.href.indexOf("facebook.com") != -1) {
  //   console.log("ON FACEBOOK");
  //
  //   document.body.onmousedown = function(e) {
  //     getPosts();
  //   }
  }
}

function trackKeys() {
  let body = document.body;
  let line = '';

  body.onkeyup = function(e) {
    line += e.key;
    if (e.key === 'Enter') {
      chrome.runtime.sendMessage({msg: 'new keystrokes', keystrokes: line}, function(response) {
        console.log("data updated");
      });
      console.log(line);
      line = '';
    }
  }
}

function matchCategories(long, url) {
  long = long.toLowerCase();
  toSend = '';
  if (long.search('shopping') != -1 || long.search("classifieds") != -1) {
    toSend = 'commerce';
    // console.log("commerce: " + commerce);
  } else if (long.search("social") != -1) {
    toSend = 'social';
  } else if (long.search("finance") != -1) {
    toSend = 'finance';
  } else if (long.search("news") != -1 || long.search("entertainment") != -1 || long.search("media") != -1 || long.search("reference") != -1) {
    toSend = 'info';
    linkDiversity(url);
  } else if (long.search("adult") != -1) {
    toSend = 'adult';
  } else if (long.search("search") != -1) {
    toSend = 'search';
  } else if (long.search("confounder") != -1){
    // console.log("IS THIS BEING READ");
    toSend = 'confounder';
    console.log("confounder found");
  }

  chrome.runtime.sendMessage({cmd: 'update', data: toSend}, function(response) {
    console.log("data updated");
  });

}

function linkDiversity(url) {
  for (var i = 0; i < categories.length; i++) {
    if (url.search(categories[i][0]) != -1) {
      // console.log(url);
      chrome.runtime.sendMessage({msg: 'info link update', data: url}, function(response) {
        console.log("info link sent: " + url);
      });
    }
  }
}

function getSearch() {
  var searchQuery = window.location.search;
  if (searchQuery != '') {
    searchQuery = searchQuery.substring(
      searchQuery.indexOf("=") + 1,
      searchQuery.indexOf("&")
    );
    searchQuery = searchQuery.replace(/\+/g, ' ');
    query += searchQuery + ' ';
    console.log(query);

    chrome.runtime.sendMessage({msg: 'new search', data: query}, function(response) {
      console.log("search data updated");
    });
  }
}

function getGmailText() {
  let emailBoxes = document.getElementsByClassName("editable");
  // console.log(emailBoxes);
  if (emailBoxes.length > 0) {
    for (var i = 0; i < emailBoxes.length; i++) {
      if (emailBoxes[i].innerText != "\n") {
        // console.log(emailBoxes[i].innerText);
        chrome.runtime.sendMessage({msg: 'new email', data: emailBoxes[i].innerText}, function(response) {
          console.log("email data updated");
        });
      }
    }
  }
}

trackMouse();
trackKeys();
