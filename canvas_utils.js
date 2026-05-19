// canvas_utils.js (manages canvas interactions & UI)
import { loadTfModel, predictFromCanvas, isModelAvailable } from './inference_model.js';

const MODEL_URL = 'tfmodel_may1/model.json';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('drawingCanvas');
  const resultDisplay = document.getElementById('prediction_display');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const downloadBtn = document.getElementById('downloadBtn');
  const resetBtn = document.getElementById('resetBtn');
  const predictBtn = document.getElementById('predictBtn');
  const statusEl = document.getElementById('modelStatus');

  let drawing = false;

  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

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

  function setStatus(state) {
    if (!statusEl) return;
    if (state === 'loading') {
      statusEl.innerHTML = '<span class="inline-block w-2 h-2 rounded-full bg-yellow-500 animate-pulse mr-2"></span>LOADING';
    } else if (state === 'ready') {
      statusEl.innerHTML = '<span class="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>READY';
    } else if (state === 'error') {
      statusEl.innerHTML = '<span class="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>ERROR';
    }
  }

  canvas.addEventListener('mousedown', e => {
    drawing = true;
    const p = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  });
  canvas.addEventListener('mousemove', e => {
    if (!drawing) return;
    const p = getCanvasCoords(e);
    ctx.lineTo(p.x, p.y);
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
  setStatus('loading');
  loadTfModel(MODEL_URL).then(() => {
    canvas.disabled = !isModelAvailable();
    setStatus('ready');
    console.log('Model ready:', isModelAvailable());
  }).catch(() => {
    setStatus('error');
  });
});
