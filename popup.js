let updatePhoto = document.getElementById("updatePhoto");

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

            document.getElementById("linkNumber").innerHTML = request.data.length + "links collected";
        }
    }
);
