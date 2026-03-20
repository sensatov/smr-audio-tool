import lamejs from "lamejs-fixed";

function floatToInt16Array(floatArray) {
  const int16Array = new Int16Array(floatArray.length);
  for (let i = 0; i < floatArray.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, floatArray[i]));
    int16Array[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  return int16Array;
}

function encodeMp3(audioBuffer, bitrate = 128) {
  const channels = Math.min(audioBuffer.numberOfChannels, 2);
  const sampleRate = audioBuffer.sampleRate;
  const left = floatToInt16Array(audioBuffer.getChannelData(0));
  const right = channels > 1 ? floatToInt16Array(audioBuffer.getChannelData(1)) : null;
  const encoder = new lamejs.Mp3Encoder(channels, sampleRate, bitrate);
  const blockSize = 1152;
  const mp3Data = [];

  for (let i = 0; i < left.length; i += blockSize) {
    const leftChunk = left.subarray(i, i + blockSize);
    let encodedChunk;
    if (channels > 1 && right) {
      const rightChunk = right.subarray(i, i + blockSize);
      encodedChunk = encoder.encodeBuffer(leftChunk, rightChunk);
    } else {
      encodedChunk = encoder.encodeBuffer(leftChunk);
    }
    if (encodedChunk.length > 0) {
      mp3Data.push(new Uint8Array(encodedChunk));
    }
  }

  const flushed = encoder.flush();
  if (flushed.length > 0) {
    mp3Data.push(new Uint8Array(flushed));
  }

  return new Blob(mp3Data, { type: "audio/mpeg" });
}

async function resampleForMp3(audioBuffer, targetSampleRate = 44100) {
  if (audioBuffer.sampleRate === targetSampleRate) return audioBuffer;

  const frameCount = Math.ceil(audioBuffer.duration * targetSampleRate);
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    frameCount,
    targetSampleRate
  );
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineContext.destination);
  source.start(0);
  return offlineContext.startRendering();
}

function stripExtension(fileName) {
  return fileName.replace(/\.[^.]+$/, "");
}

export async function trimAudioFile(file, maxSeconds = 60) {
  const arrayBuffer = await file.arrayBuffer();
  const context = new AudioContext();
  try {
    const decoded = await context.decodeAudioData(arrayBuffer.slice(0));
    const trimmedSeconds = Math.min(decoded.duration, maxSeconds);
    const frameCount = Math.floor(trimmedSeconds * decoded.sampleRate);
    const trimmedBuffer = context.createBuffer(
      decoded.numberOfChannels,
      frameCount,
      decoded.sampleRate
    );

    for (let channel = 0; channel < decoded.numberOfChannels; channel += 1) {
      const source = decoded.getChannelData(channel);
      const target = trimmedBuffer.getChannelData(channel);
      target.set(source.subarray(0, frameCount));
    }

    let mp3ReadyBuffer = trimmedBuffer;
    try {
      mp3ReadyBuffer = await resampleForMp3(trimmedBuffer, 44100);
    } catch (_err) {
      mp3ReadyBuffer = trimmedBuffer;
    }

    const mp3Blob = encodeMp3(mp3ReadyBuffer);
    return {
      blob: mp3Blob,
      url: URL.createObjectURL(mp3Blob),
      originalDuration: decoded.duration,
      teaserDuration: trimmedSeconds,
      wasShorterThanLimit: decoded.duration <= maxSeconds,
      outputFilename: `${stripExtension(file.name)} teaser.mp3`,
    };
  } finally {
    await context.close();
  }
}
