// ocr.js — real OCR using Tesseract.js (browser-only, no server)

// Import the ESM bundle from jsDelivr CDN.
import { createWorker } from "https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js";

// DOM refs
const fileInput = document.getElementById("fileInput");
const progressEl = document.getElementById("progress");
const resultEl = document.getElementById("result");

// NEW: make the visible button open the hidden file input
document.getElementById("chooseBtn").addEventListener("click", () => fileInput.click());

// Spin up a worker and preload English language.
// This runs once and is reused for every image.
const workerReady = (async () => {
  const worker = await createWorker({
    // Progress events come through here (0..1). We display them.
    logger: msg => {
      if (msg.status === "recognizing text") {
        updateProgress(msg.progress);
      }
    }
  });
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  return worker;
})();

fileInput.addEventListener("change", async evt => {
  const file = evt.target.files && evt.target.files[0];
  if (!file) return;

  // Reset UI
  resultEl.textContent = "";
  updateProgress(0);
  fileInput.disabled = true;

  try {
    const worker = await workerReady;
    const { data: { text } } = await worker.recognize(file);
    resultEl.textContent = text && text.trim().length ? text : "[No text detected]";
    updateProgress(1);
  } catch (err) {
    console.error(err);
    resultEl.textContent = `Error: ${err.message}`;
  } finally {
    fileInput.disabled = false;
  }
});

// Helper to show "OCR: NN%"
function updateProgress(p) {
  const pct = Math.max(0, Math.min(1, Number(p) || 0));
  progressEl.textContent = `OCR: ${Math.round(pct * 100)}%`;
}
