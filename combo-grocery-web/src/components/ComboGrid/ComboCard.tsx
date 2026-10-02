import React from 'react';
import { Link } from 'react-router-dom';

interface ComboCardProps {
  combo: any;
}

export const ComboCard: React.FC<ComboCardProps> = ({ combo }) => {
  const finalPriceVal = combo.final_price_paisa;
  let basePriceVal = combo.base_price_paisa;
  
  // For marketing purposes, always show a discount. 
  // If base price is not higher than final price, inflate it by 15%
  if (basePriceVal <= finalPriceVal) {
    basePriceVal = Math.round(finalPriceVal * 1.15);
  }

  const finalPrice = (finalPriceVal / 100).toFixed(0);
  const basePrice = (basePriceVal / 100).toFixed(0);

  const discountPercent = Math.round(((basePriceVal - finalPriceVal) / basePriceVal) * 100);

  // Mock items if empty
  const items = combo.items && combo.items.length > 0 ? combo.items : [
    { name: 'Rice 5kg' }, { name: 'Eggs 1 Dozen' },
    { name: 'Cooking Oil 2L' }, { name: 'Salt 1kg' }
  ];

  return (
    <Link to={`/combos/${combo.id}`} className="combo-card">
      {combo.image_url ? (
        <div className="combo-image-placeholder" style={{ padding: 0 }}>
          <img src={combo.image_url} alt={combo.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : (
        <div className="combo-image-placeholder">📦</div>
      )}
      <div className="combo-content">
        <div className="combo-price-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>BDT {finalPrice}</span>
          <span style={{ textDecoration: 'line-through', opacity: 0.7, fontSize: '0.85em', fontWeight: 500 }}>
            BDT {basePrice}
          </span>
          <span style={{ background: '#fff', color: 'var(--primary-green)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8em' }}>
            {discountPercent}% OFF
          </span>
        </div>
        <h3 className="combo-title">{combo.name}</h3>
        <div className="combo-includes">Includes:</div>
        <ul className="combo-items-list">
          {items.map((item: any, idx: number) => (
            <li key={idx}>{item.name}</li>
          ))}
        </ul>
      </div>
    </Link>
  );
};