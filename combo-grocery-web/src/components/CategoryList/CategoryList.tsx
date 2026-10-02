import React, { useEffect, useState } from 'react';
import { fetchCategories } from '../../api/category.api';
import './CategoryList.css';

// Map mock icons for visual flair
const iconMap: Record<string, string> = {
  'FRESH PRODUCE': '🥬',
  'DAIRY & EGGS': '🥛',
  'MEAT & SEAFOOD': '🥩',
  'PANTRY STAPLES': '🥫',
  'BEVERAGES': '🥤',
  'BAKERY': '🥐',
  'BABY CARE': '👶',
  'HOUSEHOLD': '🧼'
};

export const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories()
      .then(data => setCategories(data ?? []))
      .catch(() => setCategories([]));
  }, []);

  return (
    <section className="category-section">
      <div className="container">
        <div className="category-grid">
          {categories.map((cat, idx) => (
            <div className="category-card" key={cat.id || idx}>
              <div className="category-icon">{iconMap[cat.name] || '📦'}</div>
              <div className="category-name">{cat.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};