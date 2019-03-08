//dataDouble
//a project by roopa vasudevan
//browser extension for chrome
//special thanks to wendy chun, jessa lingel, and the members of the critical data studies (f18) and doing internet studies (s19) courses at upenn annenberg
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

document.body.onload = function() {
  var startTime = localStorage.getItem("begin");

  if (startTime == null) {
    var install = new Date().getTime();
    localStorage.setItem("begin", install);
    alert(install);
  } else {
    var now = new Date().getTime();
    daysPassed = Math.floor((now - startTime)/(1000 * 60 * 60 * 24));
    // alert(daysPassed);
  }
  // alert(lastDay);
  // var day = getDate();
  chrome.runtime.sendMessage({
    msg: "get filename"
  });
  // var image = document.getElementById('canvas');
  // alert(image.src);
}

//request updated info from background script
updatePhoto.onclick = function() {
  // chrome.runtime.sendMessage({
  //   msg: "send data to popup"
  // });
  // links = 0;
}

//get data from background script
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.msg == "sending filename") {
          filename = request.photo;
          uploadPhoto();
        } else if (request.msg === "here is the new data") {

            chrome.extension.getBackgroundPage().console.log("SENT TO POPUP");
            chrome.extension.getBackgroundPage().console.log(request.data);

            newData = request.data;
            topWords = request.keys;
            infoDiversity = request.linkNumber;
            portraitNumber = request.totalPortraits;

            var toPrint = '';

            for (var i = 0; i < topWords.length; i++) {
              toPrint += topWords[i] + "; ";
            }

            document.getElementById("data").innerHTML = toPrint;
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

  var ed = mapRange(newData[2][1], 0, 10, 9, 8); //flip edge detection range
  var pos = mapRange(newData[0][1] + newData[3][1], 0, 5, 20, 2); //refine posterization range
  var out = mapRange(outlierRatio, 0, 1, 50, -50); //mapping ratio of outliers
  var sat = mapRange(infoDiversity, 0, 10, -50, 50); //mapping information diversity

  //draw final image to popup canvas
  Caman("#canvas", function() {

    this.posterize(pos); //consumer and financial
    this.edgeDetect(ed); //social media
    this.saturation(sat); //diversity of news and information
    this.exposure(out); // anomalies/outliers

    this.revert(false);
    this.render();
    // this.render(function() {
    //   this.save('saved/portrait' + portraitNumber + '.png');
    // });
  });
}

function uploadPhoto() {
  if (filename.indexOf('.') == -1) {
    // alert("photo needed");
    document.getElementById('upload').style.display = "block";
    document.getElementById('fileupload').onchange = function(evt) {
      var file = document.getElementById('fileupload').files[0];
      if (file) {
        // alert(file.name);
        // document.getElementById('upload').submit();
        document.getElementById('canvas').src = file.name;
        var c = document.getElementById("ctx");
        var ctx = c.getContext("2d");
        var toSave = document.getElementById("canvas");
        // alert(toSave.src);
        ctx.drawImage(toSave, 0, 0);
        ctx.fillStyle = "rgba(125, 46, 138, 0.5)";
        ctx.fillRect(25,25,150,100);
        photoData = c.toDataURL("image/png");
        localStorage.setItem("photo", photoData);
        chrome.runtime.sendMessage({
          msg: "photo uploaded",
          filename: file.name
        });
      } else {
        alert("no file");
      }
    }
  } else {
    // document.getElementById('upload').style.display = "none";
    chrome.runtime.sendMessage({
      msg: "send data to popup"
    });
    links = 0;
    document.getElementById('initialPage').style.display = "none";
    document.getElementById('stats').style.display = "block";
    // document.getElementById('canvas').style.display = "block";
    // document.getElementById('ctx').style.display = "none";
    // var toRender = localStorage.getItem("photo");
    // // alert(toRender);
    // document.getElementById('canvas').src = toRender;
    // document.getElementById('updatePhoto').style.display = "block";
  }
}
