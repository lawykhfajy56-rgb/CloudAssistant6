// apps/api/public/app.js
// Frontend logic: capture screen, OCR via Tesseract.js (in browser), send text to /api/translate

const robotBtn = document.getElementById('robotBtn');
const robotPanel = document.getElementById('robotPanel');
const closePanel = document.getElementById('closePanel');
const translateBtn = document.getElementById('translateBtn');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');

function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.style.color = isError ? '#c0392b' : '#0b74de';
}

robotBtn.addEventListener('click', () => {
  robotPanel.classList.toggle('hidden');
});

closePanel.addEventListener('click', () => {
  robotPanel.classList.add('hidden');
});

translateBtn.addEventListener('click', async () => {
  setStatus('جاري التقاط الشاشة وقراءة النص...');
  resultEl.textContent = '';

  try {
    // Capture the visible document
    const canvas = await html2canvas(document.body, { scale: 1.2 });
    const dataUrl = canvas.toDataURL('image/png');

    setStatus('جاري استخراج النص (OCR)...');
    // Tesseract in browser
    const worker = Tesseract.createWorker({
      logger: m => console.log(m)
    });
    await worker.load();
    await worker.loadLanguage('eng+ara');
    await worker.initialize('eng+ara');
    const { data: { text } } = await worker.recognize(dataUrl);
    await worker.terminate();

    if (!text || text.trim().length === 0) {
      setStatus('لم يتم العثور على نص في الصورة.', true);
      return;
    }

    setStatus('جاري إرسال النص للترجمة...');
    // Send to server translate endpoint
    const resp = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, target: 'ar' })
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: 'unknown' }));
      setStatus('فشل طلب الترجمة: ' + (err && err.error ? err.error : resp.statusText), true);
      return;
    }

    const data = await resp.json();
    resultEl.textContent = data.translated || JSON.stringify(data);
    setStatus('تمت الترجمة.');
  } catch (e) {
    console.error(e);
    setStatus('حدث خطأ أثناء المعالجة: ' + (e.message || e), true);
  }
});
