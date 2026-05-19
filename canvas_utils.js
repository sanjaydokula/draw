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
  const statusPing = document.getElementById('statusPing');
  const statusDot = document.getElementById('statusDot');
  const statusLabel = document.getElementById('modelStatus');

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
    if (!statusPing || !statusDot || !statusLabel) return;
    if (state === 'loading') {
      statusPing.className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75';
      statusDot.className = 'relative inline-flex rounded-full h-2 w-2 bg-yellow-500';
      statusLabel.childNodes[statusLabel.childNodes.length - 1].textContent = ' LOADING';
    } else if (state === 'ready') {
      statusPing.className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75';
      statusDot.className = 'relative inline-flex rounded-full h-2 w-2 bg-green-500';
      statusLabel.childNodes[statusLabel.childNodes.length - 1].textContent = ' READY';
    } else if (state === 'error') {
      statusPing.className = 'animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75';
      statusDot.className = 'relative inline-flex rounded-full h-2 w-2 bg-red-500';
      statusLabel.childNodes[statusLabel.childNodes.length - 1].textContent = ' ERROR';
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
