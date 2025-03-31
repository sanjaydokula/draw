import {itoc} from './classes.js';

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("drawingCanvas");
  const result_display = document.getElementById("prediction_display");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const downloadBtn = document.getElementById("downloadBtn");
  const resetBtn = document.getElementById("resetBtn");
  const predictBtn = document.getElementById("predictBtn"); // Fixed: 'document', not 'Document'
  let drawing = false;
  let session = null;
  let model_available = false;
  // Set the canvas background so that the download includes a background
  function setCanvasBackground() {
    ctx.fillStyle = "#000"; // White background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // ctx.fillStyle = "green";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 28;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  // Set the canvas result.
  function setResult(result) {
    result_display.innerHTML = '<h4 class="result_display">test result</h4>';
    result_display.innerText = result
  }
  
  // Initialize the canvas with a background
  setCanvasBackground();

  // Start drawing
  canvas.addEventListener("mousedown", (e) => {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  });

  // Draw on the canvas while moving the mouse
  canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  });


  // Stop drawing when mouse is released or leaves canvas
  canvas.addEventListener("mouseup", () => (drawing = false));
  canvas.addEventListener("mouseleave", () => (drawing = false));

  // Reset the canvas (clear drawing and reapply the background)
  resetBtn.addEventListener("click", () => {
    setCanvasBackground();
  });

  // Display prediction result
  predictBtn.addEventListener("click", () => {
    predict()
  });

  // Download the entire canvas as an image
  downloadBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "canvas_image.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });


  async function main() {
    console.log(model_available)
    await load_model()
    console.log(model_available)
    if (model_available == true){
      // canvas.ELEMENT_NODE.disabled = false
      canvas.disabled = false
    }else{
      // canvas.ELEMENT_NODE.disabled = true
      canvas.disabled = true
    }
  }

  async function load_model() {
    try {
      session = await ort.InferenceSession.create('draw_preprocess.onnx');
      console.log('model loaded')
      console.log(session)
      // model_available = true
    } catch (error) {
      console.log('model fucked')
      console.log(error)
    }
    
  }

  function downsampleCanvas(inputCanvas, targetSize = 28) {
    // Validate input size
    if (inputCanvas.width !== 720 || inputCanvas.height !== 720) {
        throw new Error("Input canvas must be 720x720 pixels");
    }

    let currentCanvas = inputCanvas;
    let currentSize = 720;

    // Progressive downsampling with bilinear interpolation
    while (currentSize > targetSize * 2) {
        const nextSize = currentSize / 2;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = nextSize;
        tempCanvas.height = nextSize;
        
        const ctx = tempCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(currentCanvas, 0, 0, nextSize, nextSize);
        
        currentCanvas = tempCanvas;
        currentSize = nextSize;
    }

    // Final resize with nearest neighbor interpolation
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetSize;
    finalCanvas.height = targetSize;
    
    const finalCtx = finalCanvas.getContext('2d');
    finalCtx.imageSmoothingEnabled = false;
    finalCtx.drawImage(currentCanvas, 0, 0, targetSize, targetSize);

    return finalCanvas;
  }

  async function predict(){
    // get image data from canvas

    // const scaled_canvas = downsampleCanvas(canvas,28)
    // console.log('scaled canvas')
    // console.log(scaled_canvas)
    // const scaled_ctx = scaled_canvas.getContext('2d')
    // let rect = scaled_canvas.getClientRects()["0"];
    let rect = canvas.getClientRects()["0"]
    console.log(rect)
    let width = rect.width;
    let height = rect.height;
    const canvasImageData = ctx.getImageData(0, 0, width, height)
    let floatCanvasData = Float32Array.from(canvasImageData.data)
    console.log('type '+typeof(canvasImageData))
    console.log(canvasImageData)
    console.log(floatCanvasData)

    const imageTensor = new ort.Tensor('float32', floatCanvasData, [1,4,720,720]);
    console.log(imageTensor)
    const firstChannelData = imageTensor.data.subarray(0, 720 * 720); // Take only the first 28x28 section
    console.log('first channel')
    console.log(firstChannelData)
    // Create a new Tensor with shape [1, 28, 28]
    let firstChannelTensor = new ort.Tensor('float32', firstChannelData, [1,1, 720, 720]);
    console.log("firschannel tensor")
    console.log(firstChannelTensor)
    console.log(firstChannelTensor.data.length)

    // for (let index = 0; index < firstChannelTensor.data.length; index++) {
    //   // console.log('normalising')
    //   // console.log(firstChannelTensor.data[index])
    //   firstChannelTensor.data[index] = firstChannelTensor.data[index]/255.0;
      
    // }
    // console.log("nomralised first channel tensor")
    // console.log(firstChannelTensor)
    const feeds = { input: firstChannelTensor };

    const results = await session.run(feeds);

    console.log(results)

    const predictions = results['output'].data
    let pred = Math.max(...results['output'].data)
    // console.log('result from the onnx model')
    // console.log("Inference Result:", res);
    let classidx = -1
    console.log("prediction:", pred);
    for(let i=0;i<predictions.length;i++){
        if(predictions[i]===pred){
            classidx = i;
            // console.log(i);
        }
    }
    console.log('class ' + classidx)
    let class_name = itoc[classidx.toString()]
    setResult(class_name);

}


  main()
});


