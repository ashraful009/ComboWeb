import React, { useEffect, useState } from 'react';
import { fetchCombos } from '../../api/combo.api';
import { ComboCard } from './ComboCard';
import './ComboGrid.css';

export const ComboGrid: React.FC = () => {
  const [combos, setCombos] = useState<any[]>([]);

  useEffect(() => {
    fetchCombos()
      .then(data => setCombos(data ?? []))
      .catch(() => setCombos([]));
  }, []);

  return (
    <section className="combos-section">
      <div className="container">
        <h2 className="section-title">FEATURED COMBO PACKS</h2>
        <div className="combo-grid">
          {combos.map((combo, idx) => (
            <ComboCard key={combo.id || idx} combo={combo} />
          ))}
        </div>
      </div>
    </section>
  );
};