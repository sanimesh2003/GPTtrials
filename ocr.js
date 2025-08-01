// ocr.js — real OCR using Tesseract.js (browser-only, no server)

// Import the ESM bundle from jsDelivr CDN.
import { createWorker } from "https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js";

// DOM refs
const fileInput = document.getElementById("fileInput");
const progressEl = document.getElementById("progress");
const resultEl = document.getElementById("result");

// Launch worker and preload English
const workerReady = (async () => {
  const worker = await createWorker({
    logger: msg => {
      if (msg.status === "recognizing text") updateProgress(msg.progress);
    }
  });
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  return worker;
})();

// Single handler: fires whether user clicks the input directly or the button overlay
fileInput.addEventListener("change", async () => {
  const file = fileInput.files && fileInput.files[0];
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
    // Clear the input so selecting the same file again will retrigger 'change'
    fileInput.value = "";
  }
});

function updateProgress(p) {
  const pct = Math.max(0, Math.min(1, Number(p) || 0));
  progressEl.textContent = `OCR: ${Math.round(pct * 100)}%`;
}
