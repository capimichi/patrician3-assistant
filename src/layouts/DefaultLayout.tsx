import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const DefaultLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-neutral-dark">
      <Header />
      <main className="flex-grow pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default DefaultLayout;
