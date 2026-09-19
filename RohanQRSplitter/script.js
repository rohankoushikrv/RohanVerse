const form = document.getElementById('split-form');
const totalAmountInput = document.getElementById('total-amount');
const splitCountInput = document.getElementById('split-count');
const maxUpiAmountInput = document.getElementById('max-upi-amount');
const manualSplitToggle = document.getElementById('manual-split-toggle');
const merchantUpiInput = document.getElementById('merchant-upi');
const merchantNameInput = document.getElementById('merchant-name');
const noteInput = document.getElementById('note');
const resultsContainer = document.getElementById('split-results');
const totalSummary = document.getElementById('summary-total');
const shareSummary = document.getElementById('summary-share');
const countSummary = document.getElementById('summary-count');
const resultStatus = document.getElementById('result-status');
const resetButton = document.getElementById('reset-button');

const STORAGE_KEY = 'qr-splitter-state';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function saveState() {
  const state = {
    totalAmount: totalAmountInput.value,
    splitCount: splitCountInput.value,
    maxUpiAmount: maxUpiAmountInput.value,
    manualSplitToggle: manualSplitToggle.checked,
    merchantUpi: merchantUpiInput.value,
    merchantName: merchantNameInput.value,
    note: noteInput.value,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return;
  }

  try {
    const state = JSON.parse(saved);
    totalAmountInput.value = state.totalAmount || '4500';
    splitCountInput.value = state.splitCount || '3';
    maxUpiAmountInput.value = state.maxUpiAmount || '2000';
    manualSplitToggle.checked = Boolean(state.manualSplitToggle);
    merchantUpiInput.value = state.merchantUpi || 'merchant@upi';
    merchantNameInput.value = state.merchantName || 'Rohan Store';
    noteInput.value = state.note || 'Bill split';
  } catch (error) {
    console.warn('Unable to restore saved bill state:', error);
  }
}

function formatCurrency(value) {
  return currencyFormatter.format(Number(value || 0));
}

function buildUpiPayload({ merchantUpi, merchantName, amount, note }) {
  const cleanUpi = (merchantUpi || '').trim();
  const cleanName = (merchantName || 'Merchant').trim();
  const cleanNote = (note || 'Bill split').trim();

  const params = new URLSearchParams({
    pa: cleanUpi,
    pn: cleanName,
    am: Number(amount).toFixed(2),
    cu: 'INR',
    tn: cleanNote,
  });

  return `upi://pay?${params.toString()}`;
}

function calculateSplitAmounts(totalAmount, splitCount) {
  const safeTotal = Number(totalAmount || 0);
  const safeCount = Math.max(1, Math.floor(Number(splitCount || 1)));
  const totalPaise = Math.round(safeTotal * 100);
  const basePaise = Math.floor(totalPaise / safeCount);
  const remainder = totalPaise % safeCount;

  const splits = [];

  for (let index = 0; index < safeCount; index += 1) {
    const paise = basePaise + (index < remainder ? 1 : 0);
    splits.push(paise / 100);
  }

  return splits;
}

function calculateAutoSplitCount(totalAmount, maxUpiAmount) {
  const safeTotal = Number(totalAmount || 0);
  const safeMaxUpiAmount = Number(maxUpiAmount || 0);

  if (!Number.isFinite(safeTotal) || safeTotal <= 0) {
    return 1;
  }

  if (!Number.isFinite(safeMaxUpiAmount) || safeMaxUpiAmount <= 0) {
    return 1;
  }

  const count = Math.max(1, Math.ceil(safeTotal / safeMaxUpiAmount));
  return count;
}

function resolveSplitCount(totalAmount, maxUpiAmount, manualMode) {
  if (manualMode) {
    const value = Number(splitCountInput.value || 1);
    return Math.max(1, Math.floor(value));
  }

  return calculateAutoSplitCount(totalAmount, maxUpiAmount);
}

function renderPlaceholderQr(canvas, label) {
  const ctx = canvas.getContext('2d');
  const size = canvas.width || 180;
  canvas.width = size;
  canvas.height = size;

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = '#08111d';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#60a5fa';
  const corner = size * 0.14;
  ctx.fillRect(corner, corner, size - (corner * 2), size - (corner * 2));

  ctx.fillStyle = '#eaf4ff';
  const inner = size * 0.22;
  ctx.fillRect(inner, inner, size - (inner * 2), size - (inner * 2));

  ctx.fillStyle = '#08111d';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, size / 2, size - 18);
}

function generateQrFromLibrary(canvas, text) {
  if (!window.QRCode) {
    renderPlaceholderQr(canvas, 'R');
    return;
  }

  window.QRCode.toCanvas(
    canvas,
    text,
    {
      width: 180,
      margin: 1,
      color: {
        dark: '#0b1220',
        light: '#f8fbff',
      },
      errorCorrectionLevel: 'M',
    },
    (error) => {
      if (error) {
        renderPlaceholderQr(canvas, 'R');
      }
    }
  );
}

function generateQrFromRemote(canvas, text) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(text)}&color=0b1220&bgcolor=f8fbff&format=png`;
  const img = new Image();

  img.onload = () => {
    const ctx = canvas.getContext('2d');
    canvas.width = 180;
    canvas.height = 180;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f8fbff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  img.onerror = () => {
    renderPlaceholderQr(canvas, 'R');
  };

  img.src = url;
}

function generateQrForCanvas(canvas, text) {
  if (window.QRCode) {
    generateQrFromLibrary(canvas, text);
    return;
  }

  if (navigator.onLine) {
    generateQrFromRemote(canvas, text);
    return;
  }

  renderPlaceholderQr(canvas, 'R');
}

function renderResults(entries) {
  if (!entries.length) {
    resultsContainer.innerHTML = '<div class="empty-state">Please enter total amount and split count to generate the payment sheet.</div>';
    return;
  }

  resultsContainer.innerHTML = entries
    .map(
      (entry, index) => `
        <article class="split-card">
          <div class="split-meta">
            <p>Share ${index + 1} of ${entries.length}</p>
            <strong>${formatCurrency(entry.amount)}</strong>
          </div>
          <div class="qr-wrap">
            <canvas class="qr-canvas" data-input="${entry.upiLink}"></canvas>
          </div>
          <div class="split-details">
            <small>UPI ID</small>
            <p>${entry.merchantUpi}</p>
            <small>Merchant</small>
            <p>${entry.merchantName}</p>
          </div>
        </article>
      `
    )
    .join('');

  const qrCanvasList = resultsContainer.querySelectorAll('.qr-canvas');
  qrCanvasList.forEach((canvas, index) => {
    generateQrForCanvas(canvas, entries[index].upiLink);
  });
}

function updateSummary(totalAmount, splitCount, splitAmount) {
  totalSummary.textContent = formatCurrency(totalAmount);
  countSummary.textContent = `${splitCount} share${splitCount > 1 ? 's' : ''}`;
  shareSummary.textContent = formatCurrency(splitAmount);
}

function handleSubmit(event) {
  event.preventDefault();

  const totalAmount = Number(totalAmountInput.value);
  const maxUpiAmount = Number(maxUpiAmountInput.value || 0);
  const manualMode = manualSplitToggle.checked;
  const splitCount = resolveSplitCount(totalAmount, maxUpiAmount, manualMode);
  const merchantUpi = merchantUpiInput.value.trim();
  const merchantName = merchantNameInput.value.trim() || 'Merchant';
  const note = noteInput.value.trim() || 'Bill split';

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    resultStatus.textContent = 'Enter valid total amount';
    resultsContainer.innerHTML = '<div class="empty-state">Total amount must be greater than zero.</div>';
    return;
  }

  if (!manualMode && (!Number.isFinite(maxUpiAmount) || maxUpiAmount <= 0)) {
    resultStatus.textContent = 'Enter max UPI amount';
    resultsContainer.innerHTML = '<div class="empty-state">Enter a max UPI amount or enable manual split count to continue.</div>';
    return;
  }

  if (manualMode && (!Number.isFinite(splitCount) || splitCount < 1)) {
    resultStatus.textContent = 'Enter valid split count';
    resultsContainer.innerHTML = '<div class="empty-state">Split count must be at least 1.</div>';
    return;
  }

  if (!merchantUpi) {
    resultStatus.textContent = 'Merchant UPI ID required';
    resultsContainer.innerHTML = '<div class="empty-state">Please enter the merchant UPI ID to generate payment QR codes.</div>';
    return;
  }

  if (!manualMode) {
    splitCountInput.value = String(splitCount);
  }

  const amounts = calculateSplitAmounts(totalAmount, splitCount);
  const entries = amounts.map((amount) => ({
    amount,
    merchantUpi,
    merchantName,
    upiLink: buildUpiPayload({
      merchantUpi,
      merchantName,
      amount,
      note,
    }),
  }));

  const perShare = amounts[0] || 0;
  updateSummary(totalAmount, splitCount, perShare);
  renderResults(entries);
  resultStatus.textContent = `${splitCount} share${splitCount > 1 ? 's' : ''} ready`;
  saveState();
}

function resetForm() {
  totalAmountInput.value = '4500';
  splitCountInput.value = '3';
  maxUpiAmountInput.value = '2000';
  manualSplitToggle.checked = false;
  merchantUpiInput.value = 'merchant@upi';
  merchantNameInput.value = 'Rohan Store';
  noteInput.value = 'Bill split';
  resultsContainer.innerHTML = '';
  resultStatus.textContent = 'Ready';
  updateSummary(4500, 3, 1500);
  localStorage.removeItem(STORAGE_KEY);
}

form.addEventListener('submit', handleSubmit);
resetButton.addEventListener('click', resetForm);

const qrScript = document.createElement('script');
qrScript.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js';
qrScript.async = true;
qrScript.onload = () => {
  const currentTotal = Number(totalAmountInput.value || 0);
  const currentCount = Number(splitCountInput.value || 1);
  if (currentTotal > 0 && currentCount > 0) {
    handleSubmit(new Event('submit'));
  }
};
document.body.appendChild(qrScript);

loadState();
const initialAutoCount = calculateAutoSplitCount(Number(totalAmountInput.value || 0), Number(maxUpiAmountInput.value || 0));
updateSummary(Number(totalAmountInput.value || 0), Number(manualSplitToggle.checked ? splitCountInput.value || 1 : initialAutoCount), Number(totalAmountInput.value || 0) / Math.max(1, Number(manualSplitToggle.checked ? splitCountInput.value || 1 : initialAutoCount)));
