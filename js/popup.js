//dataDouble
//a project by roopa vasudevan
//browser extension for chrome
//utilizes caman.js (http://camanjs.com/) for image manipulation
//special thanks to wendy chun and the members of the critical data studies course (f18) at upenn annenberg

//this script translates collected data into the final image and info in the extension popup.

let updatePhoto = document.getElementById("updatePhoto");
let links;
let newData;
let topWords;
let infoDiversity;
let portraitNumber;

updatePhoto.onclick = function() {
  chrome.runtime.sendMessage({
    msg: "send data to popup"
  });
  links = 0;
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.msg === "here is the new data") {
            //  To do something
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

// The adjust value is the argument given by the user when
// they call this filter.
Caman.Filter.register("posterize", function (adjust) {
  // Pre-calculate some values that will be used
  var numOfAreas = 256 / adjust;
  var numOfValues = 255 / (adjust - 1);

  // Our process function that will be called for each pixel.
  // Note that we pass the name of the filter as the first argument.
  this.process("posterize", function (rgba) {
    rgba.r = Math.floor(Math.floor(rgba.r / numOfAreas) * numOfValues);
    rgba.g = Math.floor(Math.floor(rgba.g / numOfAreas) * numOfValues);
    rgba.b = Math.floor(Math.floor(rgba.b / numOfAreas) * numOfValues);

    // Return the modified RGB values
    return rgba;
  });
});

Caman.Filter.register("edgeDetect", function(degree) {
    return this.processKernel("Edge Detect", [
      -1, -1, -1,
      -1, degree, -1,
      -1, -1, -1
    ]);
});

function mapRange(value, min, max, newMin, newMax) {
  prop = (value - min) / (max - min);
  newVal = newMin + prop * (newMax - newMin);
  return newVal;
}

//manipulate image here based on data from popup.js
function updateImage() {

  for (var i = 0; i < newData.length; i++) {
    links += newData[i][1];
  }

  //calculating ratios and ranges
  var outlierRatio = newData[6][1] / links;
  var infoRatio = newData[4][1] / links;

  var ed = mapRange(newData[2][1], 0, 100, 9, 8); //flip edge detection range
  var pos = mapRange(newData[0][1] + newData[3][1], 0, 100, 100, 0); //flip posterization range
  var out = mapRange(outlierRatio, 0, 1, 50, -50); //mapping ratio of outliers
  var sat = mapRange(infoDiversity, 0, 10, -50, 50);

  Caman("#canvas", function() {

    this.edgeDetect(ed); //social media
    this.posterize(pos); //consumer and financial
    this.saturation(sat); //diversity of news and information
    this.exposure(out); // anomalies/outliers

    this.revert(false);
    this.render();
    // this.render(function() {
    //   this.save('saved/portrait' + portraitNumber + '.png');
    // });
  });
}
