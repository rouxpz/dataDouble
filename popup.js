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

            links = request.data.length * 10;
            document.getElementById("linkNumber").innerHTML = request.data.length + " links collected";
            updateImage();
        }
    }
);

function updateImage() {
  Caman("#canvas", function() {
    //manipulate image here based on data from popup.js
    // this.crop(200, 300);
    this.brightness(links);
    // this.render();
    // this.resize({
    //   width: 300,
    //   height: 389
    // });
    this.revert(false);
    this.render();
  });
}
