import React from 'react';
import './MidnightSky.css';

export default function MidnightSky() {
  return (
    <div className="uiverse-midnight-sky fixed inset-0 z-0 pointer-events-none">
      <div className="sky-canvas">
        <div className="stars stars-1" />
        <div className="stars stars-2" />
        <div className="stars stars-3" />
        <div className="meteor m1" />
        <div className="meteor m2" />
        <div className="meteor m3" />
      </div>
    </div>
  );
}
