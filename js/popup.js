//translate collected data into image in popup.

let updatePhoto = document.getElementById("updatePhoto");
var links = 0;

updatePhoto.onclick = function() {
  chrome.runtime.sendMessage({
    msg: "update data"
  });
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.msg === "new link added") {
            //  To do something
            chrome.extension.getBackgroundPage().console.log("SENT TO POPUP");
            chrome.extension.getBackgroundPage().console.log(request.data);

            links = request.data.length;
            document.getElementById("linkNumber").innerHTML = request.data.length + " links collected";
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

//manipulate image here based on data from popup.js
function updateImage() {
  Caman("#canvas", function() {
    // this.crop(200, 300);
    // this.brightness(links);
    this.contrast(links);
    this.posterize(links);
    this.gamma(links/100);
    // this.render();
    // this.resize({
    //   width: 300,
    //   height: 389
    // });
    this.revert(false);
    this.render();
  });
}
