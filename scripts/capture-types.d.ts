interface Window {
  choirCapture: {
    context: AudioContext;
    recorder: MediaRecorder;
    chunks: Blob[];
  };
}
