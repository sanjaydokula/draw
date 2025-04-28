// canvas_utils.js (manages canvas interactions & UI)
import { loadTfModel, predictFromCanvas, isModelAvailable } from './inference_model.js';

const MODEL_URL = 'tfmodel/model.json';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('drawingCanvas');
  const resultDisplay = document.getElementById('prediction_display');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const downloadBtn = document.getElementById('downloadBtn');
  const resetBtn = document.getElementById('resetBtn');
  const predictBtn = document.getElementById('predictBtn');

  let drawing = false;

  function setCanvasBackground() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 28;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  function setResult(text) {
    resultDisplay.innerText = text;
  }

  canvas.addEventListener('mousedown', e => {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  });
  canvas.addEventListener('mousemove', e => {
    if (!drawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  });
  ['mouseup', 'mouseleave'].forEach(evt =>
    canvas.addEventListener(evt, () => (drawing = false))
  );

  resetBtn.addEventListener('click', setCanvasBackground);

  predictBtn.addEventListener('click', async () => {
    try {
      const pred = await predictFromCanvas(canvas);
      setResult(pred);
    } catch (err) {
      setResult('Error: ' + err.message);
    }
  });

  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'canvas_image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  // Initialize
  setCanvasBackground();
  loadTfModel(MODEL_URL).then(() => {
    canvas.disabled = !isModelAvailable();
    console.log('Model ready:', isModelAvailable());
  });
});
