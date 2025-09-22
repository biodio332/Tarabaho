import React from 'react';
import TrabahadorNavbar from './TrabahadorNavbar';
import Footer from './Footer';

const GeneralLayout = ({ children }) => {
  return (
    <div>
      <TrabahadorNavbar />
      {children}
      <Footer />
    </div>
  );
};

export default GeneralLayout;