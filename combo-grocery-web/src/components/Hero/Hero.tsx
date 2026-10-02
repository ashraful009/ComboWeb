import React from 'react';
import './Hero.css';

export const Hero: React.FC = () => {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">BUY ONLY COMBO PACKS.</h1>
          <p className="hero-subtitle">
            A single item is never sold.<br/>
            Discover ultimate savings with pre-built grocery bundles.
          </p>
          <div className="hero-actions">
            <button className="btn-primary">SHOP COMBOS</button>
            <button className="btn-outline">BECOME AN INVESTOR</button>
          </div>
        </div>
      </div>
    </section>
  );
};