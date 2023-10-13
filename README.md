# Web Client for adding subtitles

Browser app for adding subtitles to a video file

## Description

Application enables adding subtitles on-the-fly to an uploaded video. Everything is executed on the client's side, without intervention of any server party.

## Getting Started

For correct functioning app requires additional web page headers:

- Cross-Origin-Embedder-Policy: require-corp
- Cross-Origin-Opener-Policy: same-origin

serve.json adds those headers, however a packet manager for js has to be used e.g. npm

### Dependencies

- App uses ffmpeg library for browsers:
  [ffmpeg.wasm](https://github.com/AdamRogowski/web-client-for-adding-subtitles/blob/main/sample-app-view.jpg)

### Executing program

While app was properly served with required headers, the following screen appears in the browser

![app view](Image URL)

Upload button should be used to upload the video file to the browser. Subtitles can be written when the video is paused, in the text field located below buttons.
Accept Subtitles saves the provided subtitles at the exact moment of clicking the button.
Video with the subtitles in a MKV format can be downloaded afterwards as well as a raw VTT subtitles file.

## Authors

Adam Rogowski

## Acknowledgments

Those threads were useful in developing this app:

- [ffmpeg-in-browser](https://stackoverflow.com/questions/28099493/running-ffmpeg-in-browser-options)
- [shared-array-buffer-not-defined](https://github.com/ffmpegwasm/ffmpeg.wasm/issues/263)
