import React, { useState } from 'react';
import './FloatingRobot.css';
import RobotSvg from '../../../assets/alkhafaji-ai.svg';
import ScreenTranslator from './ScreenTranslator';

export default function FloatingRobot() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={`floating-robot ${open ? 'open' : ''}`} onClick={() => setOpen(!open)} title="الخفاجي AI">
        <img src={RobotSvg} alt="الخفاجي AI" />
      </div>

      {open && (
        <div className="robot-panel">
          <div className="robot-panel-header">
            <strong>الخفاجي AI</strong>
            <button className="close-btn" onClick={() => setOpen(false)}>×</button>
          </div>
          <div className="robot-panel-body">
            <ScreenTranslator targetLang="ar" />
          </div>
        </div>
      )}
    </>
  );
}
