import React from 'react';
import './InvestorPromo.css';

export const InvestorPromo: React.FC = () => {
  return (
    <section className="container">
      <div className="investor-promo">
        <div className="promo-text">
          <h2>BECOME AN INVESTOR MEMBER</h2>
          <ul className="promo-list">
            <li>OVERALL + INVESTOR DISCOUNT!</li>
            <li>INVESTOR DASHBOARD</li>
          </ul>
        </div>
        
        <div className="calculator-box">
          <div className="calculator-title">
            <span>Savings Calculator</span>
            <span>^</span>
          </div>
          <div className="calculator-desc">
            Based on the verified pricing examples and calculator per order rules in the project plan.
          </div>
        </div>
      </div>
    </section>
  );
};