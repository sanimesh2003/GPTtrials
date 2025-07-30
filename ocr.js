// ocr.js — step-1 placeholder
// We’ll wire Tesseract in the next step. For now just echo the file name.

document.getElementById('fileInput').addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  document.getElementById('progress').textContent = `Loaded: ${file.name}`;
  document.getElementById('result').textContent = '';
});