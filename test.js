function trackMouse() {
  let images = document.getElementsByTagName("img");
  let links = document.getElementsByTagName("a");
  // console.log(images);

    for (var i = 0; i < images.length-1; i++) {
      images[i].onmouseover = function() {
        console.log(this.src);
      }
    }

    for (var i = 0; i < links.length; i++) {
      links[i].onmousedown = function() {
        console.log(this.href);
        chrome.runtime.sendMessage({cmd: 'newLink', url: this.href}, function(response) {
          console.log("link added");
        });
      }
    }
  }

trackMouse();
