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
    ctx.fillStyle = "#fff"; // White background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // ctx.fillStyle = "green";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 14;
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
      session = await ort.InferenceSession.create('debug_onnx.onnx');
      console.log('model loaded')
      console.log(session)
      // model_available = true
    } catch (error) {
      console.log('model fucked')
      console.log(error)
    }
    
  }

  async function predict(){
    // get image data from canvas

    let rect = canvas.getClientRects()["0"];
    let width = rect["width"];
    let height = rect["height"];
    const canvasImageData = ctx.getImageData(0, 0, width, height)
    floatCanvasData = Float32Array.from(canvasImageData.data)
    console.log('type '+typeof(canvasImageData))
    console.log(canvasImageData)
    console.log(floatCanvasData)

    const imageTensor = new ort.Tensor('float32', floatCanvasData, [1,4,720,720]);
    console.log(imageTensor)
    const feeds = { input: imageTensor };

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
    setResult(classidx);

}


  main()
});


