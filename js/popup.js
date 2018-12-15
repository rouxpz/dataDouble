//translate collected data into image in popup.

let updatePhoto = document.getElementById("updatePhoto");
var links = 0;
var newData;

updatePhoto.onclick = function() {
  chrome.runtime.sendMessage({
    msg: "send data to popup"
  });
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.msg === "here is the new data") {
            //  To do something
            chrome.extension.getBackgroundPage().console.log("SENT TO POPUP");
            chrome.extension.getBackgroundPage().console.log(request.data);

            newData = request.data;

            var toPrint = '';

            for (var i = 0; i < newData.length; i++) {
              toPrint += newData[i][0] + ", " + newData[i][1] + "<br>";
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

  // for (var i = 0; i < newData.length; i++) {
  //
  // }

  ed = mapRange(newData[0][1] + newData[4][1], 0, 10, 9, 8);
  Caman("#canvas", function() {

    // this.crop(200, 300);
    this.edgeDetect(ed);
    this.posterize(newData[2][1]);
    // this.brightness(links);
    // this.contrast(links);
    // this.gamma(links/100);
    // this.render();
    // this.resize({
    //   width: 300,
    //   height: 389
    // });
    // this.revert(false);
    this.render();
  });
}
