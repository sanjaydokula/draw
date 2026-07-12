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
 * Predicts the class for a given canvas by downsampling and running the model.
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<string>} - Predicted class name
 */
export async function predictFromCanvas(canvas) {
  if (!modelAvailable) throw new Error('Model not loaded');

  // Step 1: Center the drawing (boundary detection + crop + center)
  // This matches the centering in the Google Quick Draw training data
  const centered = centerDrawing(canvas);

  // Step 2: Downsample the centered drawing to 28x28
  const scaled = downsampleCanvas(centered, 28);
  const ctx = scaled.getContext('2d');
  const imageData = ctx.getImageData(0, 0, 28, 28);

  const tensor = tf.browser.fromPixels(imageData, 1)
    .reshape([1, 28, 28, 1])
    .cast('float32');

  const logits = model.execute(tensor);
  console.log(logits.dataSync());
  const probs = tf.softmax(logits);
  const values = probs.dataSync();
  console.log(values);
  tf.dispose([tensor, logits, probs]);

  let maxIdx = values.indexOf(Math.max(...values));
  return itoc[maxIdx.toString()];
}

/**
 * Finds the bounding box of the drawing (non-black pixels) and centers it
 * on a fresh 720x720 black canvas. This matches the centering applied
 * in the Google Quick Draw training dataset.
 * @param {HTMLCanvasElement} inputCanvas - 720x720 canvas with user drawing
 * @returns {HTMLCanvasElement} - New 720x720 canvas with drawing centered
 */
export function centerDrawing(inputCanvas) {
  const SIZE = 720;
  const ctx = inputCanvas.getContext('2d', { willReadFrequently: true });
  const imageData = ctx.getImageData(0, 0, SIZE, SIZE);
  const data = imageData.data;

  // Find bounding box of non-black pixels (the white drawing strokes)
  let minX = SIZE, minY = SIZE, maxX = 0, maxY = 0;
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const idx = (y * SIZE + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      if (r > 0 || g > 0 || b > 0) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  // If no drawing found (empty canvas), return a blank canvas
  if (minX > maxX || minY > maxY) {
    const blank = document.createElement('canvas');
    blank.width = SIZE;
    blank.height = SIZE;
    const blankCtx = blank.getContext('2d');
    blankCtx.fillStyle = '#000';
    blankCtx.fillRect(0, 0, SIZE, SIZE);
    return blank;
  }

  // Crop dimensions of the drawing
  const cropWidth = maxX - minX + 1;
  const cropHeight = maxY - minY + 1;

  // Extract just the drawing region into a temp canvas
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = cropWidth;
  cropCanvas.height = cropHeight;
  const cropCtx = cropCanvas.getContext('2d');
  cropCtx.drawImage(inputCanvas, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

  // Create output canvas with centered drawing
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = SIZE;
  outputCanvas.height = SIZE;
  const outCtx = outputCanvas.getContext('2d');

  // Black background
  outCtx.fillStyle = '#000';
  outCtx.fillRect(0, 0, SIZE, SIZE);

  // Center the cropped drawing (no scaling, just repositioning)
  const offsetX = Math.floor((SIZE - cropWidth) / 2);
  const offsetY = Math.floor((SIZE - cropHeight) / 2);
  outCtx.drawImage(cropCanvas, offsetX, offsetY);

  return outputCanvas;
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
