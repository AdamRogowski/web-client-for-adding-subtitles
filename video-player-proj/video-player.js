// Create a new TextTrack object
var textTrack = document
  .getElementById("videoPlayer")
  .addTextTrack("subtitles");

var videoPlayer = document.getElementById("videoPlayer");
var subtitlesField = document.getElementById("subtitlesField");
var uploadButton = document.getElementById("uploadButton");
var acceptButton = document.getElementById("acceptButton");
var downloadVidButton = document.getElementById("downloadVidButton");
var downloadSubButton = document.getElementById("downloadSubButton");

var file;

//
//
// Convert S.mmm format to HH:MM:SS.mmm format
function convertTimeToString(timeInSeconds) {
  // Calculate the total number of hours, minutes, and seconds
  var hours = Math.floor(timeInSeconds / 3600);
  var minutes = Math.floor((timeInSeconds % 3600) / 60);
  var seconds = Math.floor(timeInSeconds % 60);

  // Calculate the number of milliseconds
  var milliseconds = Math.round((timeInSeconds % 1) * 1000);

  // Pad the hours, minutes, and seconds with leading zeros if necessary
  var hourString = hours.toString().padStart(2, "0");
  var minuteString = minutes.toString().padStart(2, "0");
  var secondString = seconds.toString().padStart(2, "0");

  // Pad the milliseconds with leading zeros if necessary
  var millisecondString = milliseconds.toString().padStart(3, "0");

  // Concatenate the hour, minute, second, and millisecond values to get the HH:MM:SS.mmm format
  return (
    hourString +
    ":" +
    minuteString +
    ":" +
    secondString +
    "." +
    millisecondString
  );
}
//
//
// Convert textTrack cues to a vtt blob
function cuesToVTTBlob(cues) {
  // Create vtt according to format

  var vttText = "WEBVTT\n\n";
  for (var i = 0; i < cues.length; i++) {
    var cue = cues[i];
    vttText +=
      convertTimeToString(cue.startTime) +
      " --> " +
      convertTimeToString(cue.endTime) +
      "\n";
    vttText += cue.text + "\n\n";
  }
  return new Blob([vttText], { type: "text/vtt" });
}
//
//
/*
// --------------------------UPLOAD BUTTON-----------------------------
*/
// Add an event listener to the click event of the upload button
uploadButton.addEventListener("click", function () {
  // Trigger the change event of the file input element
  document.getElementById("fileInput").click();
});

// Add an event listener to the file input element
document
  .getElementById("fileInput")
  .addEventListener("change", function (event) {
    // Get the selected file from the input element
    file = event.target.files[0];

    videoPlayer.src = URL.createObjectURL(file);

    uploadButton.disabled = true;
    acceptButton.disabled = false;
    downloadVidButton.disabled = false;
    downloadSubButton.disabled = false;
    subtitlesField.disabled = false;
  });
//---------------------------------------------------------------------
//
//
/*
// --------------------------PLAY/PAUSE BUTTON-------------------------
*/
// Add an event listener to the play event of the video element
videoPlayer.addEventListener("play", function () {
  subtitlesField.disabled = true;
  acceptButton.disabled = true;
});

videoPlayer.addEventListener("pause", function () {
  subtitlesField.disabled = false;
  acceptButton.disabled = false;
});
//---------------------------------------------------------------------
//
/*
// --------------------------ACCEPT BUTTON-----------------------------
*/
acceptButton.addEventListener("click", function () {
  var subtitles = subtitlesField.value;
  var timeElapsed = videoPlayer.currentTime;

  // Add a cue to the text track with the subtitles and time elapsed
  //NOTE: end time equals 'timeElapsed + 3' is hardcoded, can be changed to user input
  textTrack.addCue(new VTTCue(timeElapsed, timeElapsed + 3, subtitles));

  // Turn on mode to enable visible subtitles
  textTrack.mode = "showing";

  // Clear the subtitles field
  document.getElementById("subtitlesField").value = "";
});
//---------------------------------------------------------------------
//
//
//
/*
// --------------------------DOWNLOAD VIDEO BUTTON-----------------------------
*/
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

const combine = async ({ target: {} }) => {
  // Create a Blob object with the vtt text
  var vttBlob = cuesToVTTBlob(textTrack.cues);

  if (file != null && file != undefined) {
    const videoFile = "video.mp4";
    const subFile = "sub.vtt";

    // Check if ffmpeg is already loaded
    if (!ffmpeg.isLoaded()) await ffmpeg.load();

    // Create virtual mp4 and vtt files
    ffmpeg.FS("writeFile", videoFile, await fetchFile(file));

    ffmpeg.FS(
      "writeFile",
      subFile,
      await fetchFile(URL.createObjectURL(vttBlob))
    );

    //  ffmpeg -i input.mp4 -i input.vtt -c:s srt -strict -2 -vcodec copy -acodec copy output.mkv
    await ffmpeg.run(
      "-i",
      videoFile,
      "-i",
      subFile,
      "-c:s",
      "srt",
      "-strict",
      "-2",
      "-vcodec",
      "copy",
      "-acodec",
      "copy",
      "output.mkv"
    );
    const data = ffmpeg.FS("readFile", "output.mkv");

    // Create a download link for the combined video
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(
      new Blob([data.buffer], { type: "video/mkv" })
    );
    downloadLink.download = "combined-video.mkv";
    downloadLink.click();
  } else {
    console.log("Error: file is not defined");
  }
};
downloadVidButton.addEventListener("click", combine);
//---------------------------------------------------------------------------------
//
//
/*
// --------------------------DOWNLOAD SUBTITLES BUTTON-----------------------------
*/
downloadSubButton.addEventListener("click", function () {
  vttBlob = cuesToVTTBlob(textTrack.cues);

  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(vttBlob);
  downloadLink.download = "subtitles.vtt";
  downloadLink.click();
});
//------------------------------------------------------------------------------
