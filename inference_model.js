// inference_model.js (handles all ML-related functions)
import { itoc } from './classes.js';

let model = null;
let modelAvailable = false;

/**
 * Loads the TensorFlow.js model from the specified URL.
 * @param {string} url - Path to the model.json file
 * @param {any} model - TfJs loaded model.
 */
export async function loadTfModel(url) {
  model = await tf.loadGraphModel(url);
  modelAvailable = true;
  return model;
}

/**
 * Predicts the top N classes for a given canvas by downsampling and running the model.
 * @param {HTMLCanvasElement} canvas
 * @param {number} topK - Number of top predictions to return (default 4)
 * @returns {Promise<Array<{name: string, confidence: number}>>}
 */
export async function predictFromCanvas(canvas, topK = 4) {
  if (!modelAvailable) throw new Error('Model not loaded');

  const scaled = downsampleCanvas(canvas, 28);
  const ctx = scaled.getContext('2d');
  const imageData = ctx.getImageData(0, 0, 28, 28);

  const tensor = tf.browser.fromPixels(imageData, 1)
    .reshape([1, 28, 28, 1])
    .cast('float32');

  const logitsTensor = model.execute(tensor);
  const rawLogits = Array.from(logitsTensor.dataSync());
  const probs = tf.softmax(logitsTensor);
  const softmaxValues = Array.from(probs.dataSync());
  tf.dispose([tensor, logitsTensor, probs]);

  const indices = softmaxValues.map((v, i) => i)
    .sort((a, b) => softmaxValues[b] - softmaxValues[a])
    .slice(0, topK);

  return indices.map(i => ({
    name: itoc[i.toString()] || `class_${i}`,
    confidence: softmaxValues[i],
    logit: rawLogits[i]
  }));
}

/**
 * Progressive downsampling of a 720x720 canvas to a target size.
 * @param {HTMLCanvasElement} inputCanvas
 * @param {number} targetSize
 * @returns {HTMLCanvasElement}
 */
export function downsampleCanvas(inputCanvas, targetSize = 28) {
  const SIZE = 720;
  if (inputCanvas.width !== SIZE || inputCanvas.height !== SIZE) {
    throw new Error(`Canvas must be ${SIZE}x${SIZE}`);
  }

  let curr = inputCanvas;
  let currSize = SIZE;
  while (currSize > targetSize * 2) {
    currSize /= 2;
    const tmp = document.createElement('canvas');
    tmp.width = currSize;
    tmp.height = currSize;
    const ctx = tmp.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(curr, 0, 0, currSize, currSize);
    curr = tmp;
  }

  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = targetSize;
  finalCanvas.height = targetSize;
  const fctx = finalCanvas.getContext('2d');
  fctx.imageSmoothingEnabled = false;
  fctx.drawImage(curr, 0, 0, targetSize, targetSize);
  return finalCanvas;
}

export function isModelAvailable() {
  return modelAvailable;
}
