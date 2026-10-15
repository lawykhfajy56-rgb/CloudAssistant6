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
  const [ttsEnabled, setTtsEnabled] = useState(true);

  function speakText(text, lang = 'ar') {
    try {
      if (!ttsEnabled) return;
      if (!window.speechSynthesis) return;
      const utter = new SpeechSynthesisUtterance(text);
      const langMap = { ar: 'ar-SA', en: 'en-US' };
      utter.lang = langMap[lang] || lang;
      utter.rate = 1.0;
      utter.pitch = 1.0;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn('TTS error', e);
    }
  }

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

      const translated = resp.data.translated || resp.data;
      setTranslatedText(translated);

      // قراءة نص الترجمة صوتياً إن شغّل المستخدم الميزة
      speakText(translated, targetLang);
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

      <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:8}}>
        <button onClick={captureAndTranslate} disabled={loading}>
          {loading ? 'جاري المعالجة...' : 'التقاط وترجمة'}
        </button>
        <label style={{display:'flex', alignItems:'center', gap:6}}>
          <input type="checkbox" checked={ttsEnabled} onChange={e => setTtsEnabled(e.target.checked)} />
          <span style={{fontSize:13}}>قراءة صوتية</span>
        </label>
      </div>

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
