# Project: Draw (Quick Draw Replication)

## Tech Stack
- **Language:** JavaScript (ES Modules)
- **Frontend:** Vanilla HTML, CSS, Canvas API
- **ML Framework:** TensorFlow.js (via CDN)
- **Model Format:** TensorFlow.js graph model (tfmodel_may1/)
- **No build tools or package manager** — pure static frontend

## Project Structure
- `index.html` — Main entry point, canvas UI, prediction display
- `canvas_utils.js` — Canvas interaction, UI event handling, model loading orchestration
- `inference_model.js` — ML inference: loads TF.js model, downsamples canvas, runs prediction
- `classes.js` — 28-class mapping (index to class name, e.g., "apple", "axe", "barn")
- `tfmodel_may1/` — Current TF.js model (5 shards + model.json, ~19MB)
- `tfmodel/` — Older TF.js model (3 shards, smaller)
- Legacy files (not in active use): `draw.onnx`, `draw_preprocess.onnx`, `*.pt`, `*.py`, `draw.ipynb`, `doodlebot.pt`

## Development Commands
- **Run:** Open `index.html` in a browser (no build step needed)
- Alternatively, serve with any static file server:
  ```
  npx serve .
  ```
  or Python:
  ```
  python -m http.server
  ```

## Key Dependencies
- **TensorFlow.js** — loaded from CDN: `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js`
- No npm packages, no bundler

## Code Conventions
- ES Modules (`type="module"` in script tags, `import`/`export` syntax)
- Canvas drawing: black background, white strokes, 28px line width, round caps
- Canvas is 720×720 pixels
- Model input: 28×28 grayscale, progressive downsampling via intermediate `<canvas>` elements
- Prediction: softmax over 28 classes, returns class name string
- Error handling: try/catch in UI callbacks, display error message in result div

## Architecture Notes
- **Data flow:** User draws → Canvas (720×720) → **Drawing boundary detection + centering** (crop to non-black pixels, center on fresh canvas) → Progressive downsample to 28×28 → TF.js model → softmax → class name displayed
- Centering step (`centerDrawing()` in `inference_model.js`) matches the Google Quick Draw training data where all drawings are centered
- The model is a graph model loaded via `tf.loadGraphModel()` from `tfmodel_may1/model.json`
- Canvas background is reset to black on page load and "Reset" button
- "Predict" button runs inference and shows the predicted class name
- "Download" button saves canvas as PNG
- 28 classes include: The Eiffel Tower, airplane, ambulance, anvil, apple, axe, banana, barn, baseball bat, baseball, basketball, bee, bench, bicycle, boomerang, cactus, castle, donut, ice cream, lantern, shark, skateboard, skull, snail, tree, trombone, truck, vase

## Git State
- Active branch: probably `main` or `master`
- Recent commits involved bug fixes, model path changes, new classes
- .gitignore excludes: `*.png`, `*.onnx`, `*.pt`, `*.py`, `*_ENV`, `*.ipynb`, `*.tar`
