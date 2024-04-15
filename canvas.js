
//creating inference session
const InferenceSession = ort.InferenceSession;
const Tensor = ort.Tensor;
let session = null;
// use an async context to call onnxruntime functions.

//getting canvas htmlElement
const canvas = document.getElementById("canvas");
const btn = document.getElementById("showImage");
let pelm = document.getElementById("mousepos");
let download = document.getElementById('downloadBtn')
download.addEventListener('click', downloadImage)
//setting canvas dimensions
canvas.width = 320;
canvas.height = 320;

const reflc_canvas = document.getElementById("reflct_canvas");

//adding event listeners
canvas.addEventListener("mousedown", onMouseDown);
canvas.addEventListener("mouseup", onMouseUp)
canvas.addEventListener("mousemove", onMouseMove);
canvas.addEventListener("click", clear);

btn.addEventListener("click", showData);


let isMouseDown = false;


const ctx = canvas.getContext("2d", { willReadFrequently: true });
const rctx = reflc_canvas.getContext("2d");
ctx.fillStyle = "green";
ctx.strokeStyle = "red";
ctx.lineWidth = 14;
ctx.lineCap = "round";
ctx.lineJoin = "round";

function ready(){
    canvas.style.backgroundColor = "grey";
    canvas.ELEMENT_NODE.disabled = false;
}

function onMouseUp(event) {
    updatePreds()
    isMouseDown = false;
    ctx.closePath();
}

function onMouseDown(event) {
    isMouseDown = true;
    ctx.beginPath();
    ctx.moveTo(event.offsetX + 0.01, event.offsetY + 0.01);
    onMouseMove(event)
}

function onMouseMove(event) {
    pelm.innerText = " " + event.clientX + " " + event.clientY
    if (isMouseDown) {

        ctx.lineTo(event.offsetX, event.offsetY);
        ctx.stroke();

    }
}

function drawRect(pos) {
    console.log("in drawRect()")
    ctx.fillRect(...pos)
}


function clear(event) {
    if (event.altKey) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
}


async function showData() {
    let rect = canvas.getClientRects()["0"];
    let width = rect["width"];
    let height = rect["height"];
    let canvasImageData = ctx.getImageData(0,0,width,height);

    rctx.putImageData(canvasImageData,0,0);

}



async function updatePreds() {
    console.log("changed")
    let rect = canvas.getClientRects()["0"];
    let width = rect["width"];
    let height = rect["height"];
    const canvasImageData = ctx.getImageData(0, 0, width, height)
    await showData();
    console.log("Canvas Image Data:", canvasImageData);
    let ct = new Tensor('float32', new Float32Array(canvasImageData.data),[1,4,320,320]);
    console.log("tensor ct:", ct)
    console.log('tensor len:', ct.size)
    // for(let j = 0;j<ct.size;j++){
    //     ct.data[j] = ct.data[j]/255;
    // }
    console.log(" Pixel Values:", ct.data);
    console.log("Input Tensor Shape:", ct.dims);
    // let canvasImageTensor = await ort.Tensor.fromImage(canvasImageData)
    // console.log(canvasImageData)
    // console.log(canvasImageTensor)
    // console.log(ct)
    console.log(session.inputNames)
    const feeds = {input:ct}
    const res = await session.run(feeds);
    console.log(res)
    const predictions = res['output'].data
    let pred = Math.max(...res['output'].data)
    console.log('result from the onnx model')
    console.log("Inference Result:", res);
    console.log("prediction:", pred)

    for(let i=0;i<predictions.length;i++){
        if(predictions[i]===pred){
            console.log(i)
        }
    }
}

function cb(e){
    if (e===undefined){
        console.log('loaded');
        // ready();

    }else{
        console.log('not loaded');
        console.log(e)
    }
}
try {
    // create session and load model.onnx
    InferenceSession.create('debug_onnx_m.onnx').then((s) => {
        console.log(s)
        session = s;
        cb();
    }, (s)=>{console.log(s);cb(s);})
    
} catch (e) {
    console.error(`failed to load inference ONNX model: ${e}.`);
}

function downloadImage() {


    /* Create a PNG image of the pixels drawn on the canvas using the toDataURL method. PNG is the preferred format since it is supported by all browsers
    */
    var dataURL = canvas.toDataURL("image/png");

    // Create a dummy link text
    var a = document.createElement('a');
    // Set the link to the image so that when clicked, the image begins downloading
    a.href = dataURL
    // Specify the image filename
    a.download = 'canvas-download.jpeg';
    // Click on the link to set off download
    a.click();
}

canvas.style.cursor = "crosshair"