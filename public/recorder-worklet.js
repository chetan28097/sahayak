// AudioWorklet: forwards raw mono PCM frames to the main thread.
class RecorderProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (channel) this.port.postMessage(channel.slice(0));
    return true;
  }
}
registerProcessor("recorder-processor", RecorderProcessor);
