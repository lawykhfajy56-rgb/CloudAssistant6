import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import Tesseract from 'tesseract.js';
import axios from 'axios';

// ScreenTranslator.jsx
// مكوّن واجهة بسيط يلتقط جزءاً من الصفحة، يقرأ النص ويطلب الترجمة.

export default function ScreenTranslator({ targetLang = 'en' }) {
  const [loading, setLoading] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [error, setError] = useState(null);

  async function captureAndTranslate() {
    setLoading(true);
    setError(null);
    setTranslatedText('');
    try {
      // التقط كامل body; يمكنك تعديل المحدد لعنصر معين
      const canvas = await html2canvas(document.body);
      const dataUrl = canvas.toDataURL('image/png');

      // استخدم Tesseract.js لاستخراج النص محلياً
      const { data: { text } } = await Tesseract.recognize(dataUrl, 'eng+ara', {
        logger: m => console.log(m)
      });

      // أرسل النص إلى خدمة الترجمة (يفضّل عبر خادم وسيط)
      // يتوقع endpoint: POST /api/translate { text, target }
      const resp = await axios.post('/api/translate', {
        text,
        target: targetLang
      });

      setTranslatedText(resp.data.translated || resp.data); // نفترض بوابة ترجمة ترجع { translated }
    } catch (e) {
      console.error(e);
      setError('حدث خطأ أثناء المعالجة. تأكد من أن OCR ومزود الترجمة منصّبان.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{padding:12, border:'1px solid #eee', borderRadius:6}}>
      <h3>ترجمة الشاشة الفورية</h3>
      <p>اضغط على الزر لالتقاط النص من الصفحة وطلب ترجمته.</p>
      <button onClick={captureAndTranslate} disabled={loading}>
        {loading ? 'جاري المعالجة...' : 'التقاط وترجمة'}
      </button>

      {error && <div style={{color:'red', marginTop:8}}>{error}</div>}

      {translatedText && (
        <div style={{marginTop:12, background:'#fafafa', padding:8, borderRadius:4}}>
          <h4>الترجمة</h4>
          <div>{translatedText}</div>
        </div>
      )}
    </div>
  );
}
