document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("drawingCanvas");
    const ctx = canvas.getContext("2d");
    const downloadBtn = document.getElementById("downloadBtn");
    const resetBtn = document.getElementById("resetBtn");
  
    let drawing = false;
  
    // Set the canvas background so that the download includes a background
    function setCanvasBackground() {
      ctx.fillStyle = "#fff"; // White background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
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
    canvas.addEventListener("mouseup", () => drawing = false);
    canvas.addEventListener("mouseleave", () => drawing = false);
  
    // Reset the canvas (clear drawing and reapply the background)
    resetBtn.addEventListener("click", () => {
      setCanvasBackground();
    });
  
    // Download the entire canvas as an image
    downloadBtn.addEventListener("click", () => {
      const link = document.createElement("a");
      link.download = "canvas_image.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  });
  