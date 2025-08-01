// ocr.js — step-2: real OCR with Tesseract.js v6
// ------------------------------------------------------------
// Browser support: any modern Chromium / Firefox / Safari.
// No build tools required (ES-module import from CDN).

import { createWorker } from "https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js";

// Wrap worker creation + language init in a promise so we can await it later
const workerReady = (async () => {
  const worker = await createWorker({
    // Show running % in the UI
    logger: m => {
      if (m.status === "recognizing text") updateProgress(m.progress);
    }
  });
  await worker.loadLanguage("eng");   // English for now
  await worker.initialize("eng");
  return worker;
})();

// ---------- DOM helpers ----------
const $file = document.getElementById("fileInput");
const $progress = document.getElementById("progress");
const $result = document.getElementById("result");

$file.addEventListener("change", async e => {
  const file = e.target.files?.[0];
  if (!file) return;

  // UI state
  $result.textContent = "";
  updateProgress(0);
  $file.disabled = true;

  try {
    const worker = await workerReady;          // waits for WASM + lang to finish loading
    const { data: { text } } = await worker.recognize(file);
    $result.textContent = text || "[No text detected]";
    updateProgress(1);
  } catch (err) {
    console.error(err);
    $result.textContent = `Error: ${err.message}`;
  } finally {
    $file.disabled = false;
  }
});

// Update the progress line → “OCR: 42 %”
function updateProgress(pct) {
  const percent = Math.round(pct * 100);
  $progress.textContent = `OCR: ${percent}%`;
}
