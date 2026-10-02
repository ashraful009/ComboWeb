import React from 'react';
import { Header } from '../../components/Header/Header';
import { Hero } from '../../components/Hero/Hero';
import { CategoryList } from '../../components/CategoryList/CategoryList';
import { ComboGrid } from '../../components/ComboGrid/ComboGrid';
import { InvestorPromo } from '../../components/InvestorPromo/InvestorPromo';

export const Home: React.FC = () => {
  return (
    <>
      <Header />
      <Hero />
      <CategoryList />
      <ComboGrid />
      <InvestorPromo />
    </>
  );
};