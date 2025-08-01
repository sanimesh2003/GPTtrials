// ocr.js — GitHub Pages–safe: serve worker & WASM from same origin
import { createWorker } from "https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js";

const fileInput = document.getElementById("fileInput");
const progressEl = document.getElementById("progress");
const resultEl = document.getElementById("result");

function updateProgress(p) {
  const pct = Math.max(0, Math.min(1, Number(p) || 0));
  progressEl.textContent = `OCR: ${Math.round(pct * 100)}%`;
}

function showError(message) {
  resultEl.textContent = "Error: " + message;
  console.error(message);
}

// IMPORTANT: these files are in your repo under vendor/tesseract/
const BASE = "./vendor/tesseract/";

const workerReady = (async () => {
  try {
    const worker = await createWorker({
      workerPath: BASE + "worker.min.js",
      corePath:   BASE + "tesseract-core.wasm.js",
      // If your browser supports SIMD, you can switch to the SIMD core:
      // corePath: BASE + "tesseract-core-simd.wasm.js",
      langPath: "https://tessdata.projectnaptha.com/4.0.0",
      logger: m => {
        if (m.status === "recognizing text") updateProgress(m.progress);
      }
    });
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    return worker;
  } catch (e) {
    showError("Failed to initialize OCR worker. See console for details.");
    throw e;
  }
})();

fileInput.addEventListener("change", async () => {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;

  resultEl.textContent = "";
  updateProgress(0);
  fileInput.disabled = true;

  try {
    const worker = await workerReady;
    const { data: { text } } = await worker.recognize(file);
    resultEl.textContent = text?.trim() ? text : "[No text detected]";
    updateProgress(1);
  } catch (err) {
    showError(err.message || String(err));
  } finally {
    fileInput.disabled = false;
    fileInput.value = ""; // allow reselecting same file
  }
});