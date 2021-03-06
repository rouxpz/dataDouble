//dataDouble
//a project by roopa vasudevan
//browser extension for firefox
//visit datadouble.art for more information about the project
//utilizes caman.js (http://camanjs.com/) for image manipulation

//this script translates collected data into the final image and info in the extension popup.

let updatePhoto = document.getElementById("updatePhoto");
let links;
let newData;
let topWords;
let infoDiversity;
let portraitNumber;
let imageExists;
let filename;
let photoData;
let daysPassed;
let totalURLs;
let uniqueDomains;
let sortedData = [];

document.body.onload = function() {
  var startTime = localStorage.getItem("begin");

  if (startTime == null) {
    var install = new Date().getTime();
    localStorage.setItem("begin", install);
    // alert(install);
  } else {
    var now = new Date().getTime();
    daysPassed = Math.floor((now - startTime)/(1000 * 60 * 60 * 24));
  }
  browser.runtime.sendMessage({
    msg: "get filename"
  });
  // var image = document.getElementById('canvas');
  // alert(image.src);
}

//get data from background script
browser.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.msg == "sending filename") {
          filename = request.photo;
          uploadPhoto();
        } else if (request.msg === "here is the new data") {

            // browser.extension.getBackgroundPage().console.log("SENT TO POPUP");
            browser.extension.getBackgroundPage().console.log(request.data);

            newData = request.data;
            topWords = request.keys;
            infoDiversity = request.linkNumber;
            portraitNumber = request.totalPortraits;
            totalURLs = request.total;
            uniqueDomains = request.unique;

            var toPrint = '';

            if (topWords.length > 0) {
              for (var i = 0; i < topWords.length; i++) {
                if (topWords[i] != null) {
                  if (i < topWords.length - 1) {
                    toPrint += topWords[i][0] + ', ' + topWords[i][1] + " | ";
                  } else {
                    toPrint += topWords[i][0] + ', ' + topWords[i][1];
                  }
                }
              }
            }

            for (var i = 0; i < newData.length; i++) {
              if (newData[i][1] != 0) {
                sortedData.push({
                  cat: newData[i][0],
                  value: newData[i][1]
                });
              }
            }

            //sort top categories
            var topCats = '';
            sortedData.sort(function(a, b){return b.value - a.value});
            for (var i = 0; i < sortedData.length; i++) {
              if (i >= 0 && i < 3) {
                if (i < sortedData.length - 1) {
                  topCats += sortedData[i].cat + " | ";
                } else {
                  topCats += sortedData[i].cat;
                }
              }
            }

            document.getElementById("data").innerHTML = toPrint;
            document.getElementById("totalSites").innerHTML += totalURLs;
            document.getElementById("domains").innerHTML += uniqueDomains;
            document.getElementById("cats").innerHTML += topCats;

            updateImage();
        }
    }
);

//caman.js posterization filter
Caman.Filter.register("posterize", function (adjust) {
  // Pre-calculate some values that will be used
  var numOfAreas = 256 / adjust;
  var numOfValues = 255 / (adjust - 1);

  this.process("posterize", function (rgba) {
    rgba.r = Math.floor(Math.floor(rgba.r / numOfAreas) * numOfValues);
    rgba.g = Math.floor(Math.floor(rgba.g / numOfAreas) * numOfValues);
    rgba.b = Math.floor(Math.floor(rgba.b / numOfAreas) * numOfValues);

    return rgba;
  });
});

//caman.js edge detection filter
Caman.Filter.register("edgeDetect", function(degree) {
    return this.processKernel("Edge Detect", [
      -1, -1, -1,
      -1, degree, -1,
      -1, -1, -1
    ]);
});

// special thanks for help with this mapping function to the following thread:
//https://stackoverflow.com/questions/48802987/is-there-a-map-function-in-vanilla-javascript-like-p5-js
function mapRange(value, min, max, newMin, newMax) {
  prop = (value - min) / (max - min);
  newVal = newMin + prop * (newMax - newMin);
  return newVal;
}

//manipulate image here based on data from popup.js
function updateImage() {
  document.getElementById("days").innerHTML += daysPassed;

  for (var i = 0; i < newData.length; i++) {
    links += newData[i][1];
  }

  //calculating ratios and ranges
  var outlierRatio = newData[6][1] / links;
  var infoRatio = newData[4][1] / links;
  var socialRatio = newData[2][1] / links;
  var moneyRatio = (newData[0][1] + newData[3][1]) / links;
  var adultRadio = newData[5][1] / links;
  var searchRatio = newData[1][1] / links;

  var ed = mapRange(socialRatio, 0, 1, 9, 8); //flip edge detection range
  var pos = mapRange(moneyRatio, 0, 1, 10, 2); //refine posterization range
  var con = mapRange(searchRatio, 0, 1, 0, 10); //mapping exposure
  var sat = mapRange(infoDiversity, 0, 10, -50, 50); //mapping information diversity
  var gam = mapRange(adultRadio, 0, 1, 1, 3); //mapping gamma
  var noise = mapRange(outlierRatio, 0, 1, 0, 30); //mapping noise

  //draw final image to popup canvas
  Caman("#canvas", function() {

    this.contrast(con); // searches
    this.posterize(pos); //consumer and financial
    this.edgeDetect(ed); //social media
    this.saturation(sat); //diversity of news and information
    this.gamma(gam); //adult websites
    this.noise(noise); //anomalies/outliers

    this.revert(false);
    this.render();

    var c = document.getElementById("canvas");
    // c.style.display = "block";

    // alert(document.getElementById("canvas").src);
    if (daysPassed >= 14) {
      var download = document.getElementById("toDL");
      document.getElementById("downloadPhoto").disabled = false;

      //download final portrait -- only visible after 14 days have passed
      download.onclick = function() {
        var dlImg = c.toDataURL("image/png").replace("image/png", "image/octet-stream");
        download.setAttribute("href", dlImg);
      }
    }
  });

}

function uploadPhoto() {
  if (filename.indexOf('.') == -1) {
    // alert("photo needed");
    document.getElementById('upload').style.display = "block";
    document.getElementById('fileupload').onchange = function(evt) {
      var file = document.getElementById('fileupload').files[0];
      if (file) {

        var reader = new FileReader();

        reader.onload = function(e) {
          var du = reader.result;
          var cvs = document.getElementById("canvas");
          // alert(du);
          cvs.src = du;

          cvs.onload = function() {
            // alert(this.width);
            if (this.width != 300 || this.height > 400) {
              // alert("Wrong size. Please choose another photo with the specified dimensions.");
              document.getElementById("error").style.display = "block";
            } else {
              document.getElementById("error").style.display = "none";
              document.getElementById("submit").style.display = "inline-block";
              window.localStorage.setItem("photoURL", String(du));
            }
          };
        };

        reader.readAsDataURL(file);

        browser.runtime.sendMessage({
            msg: "photo uploaded",
            filename: file.name
          });
        } else {
          // alert("no file");
        }
    }
  } else {
    // document.getElementById('upload').style.display = "none";
    browser.runtime.sendMessage({
      msg: "send data to popup"
    });

    links = 0;
    document.getElementById('initialPage').style.display = "none";
    document.getElementById('stats').style.display = "block";


    var ls = window.localStorage.getItem("photoURL");
    var img = document.getElementById("canvas");
    img.src = ls;
    // alert(document.getElementById("canvas").src);

    var c = document.getElementById("ctx");
    var x = c.getContext("2d");
    img.onload = function() {
      x.drawImage(img, 0, 0);
    }
    // c.style.display = "block";

  }
}

document.getElementById("changePhoto").onclick = function() {
  browser.runtime.sendMessage({
      msg: "new photo requested",
      filename: ''
    });

  document.getElementById('changePhotoAck').style.display = "block";
  document.getElementById('stats').style.display = "none";
}
