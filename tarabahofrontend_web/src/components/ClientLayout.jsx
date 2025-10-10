// components/ClientLayout.jsx
import React from 'react';
import UserNavbar from './UserNavbar'; // Adjust path to your UserNavbar
import Footer from './Footer';

const ClientLayout = ({ children }) => {
  return (
    <div>
      <UserNavbar />
      {children}
      <Footer />
    </div>
  );
};

export default ClientLayout;