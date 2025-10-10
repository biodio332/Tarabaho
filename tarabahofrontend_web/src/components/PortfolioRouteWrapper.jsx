// components/PortfolioRouteWrapper.jsx
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import GeneralLayout from './GeneralLayout';
import ClientLayout from './ClientLayout';
import ViewPortfolio from '../pages/ViewPortfolio'; // Adjust path

const PortfolioRouteWrapper = () => {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const urlShareToken = urlParams.get('share');
  const [isAuthenticatedGraduate, setIsAuthenticatedGraduate] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

  useEffect(() => {
    const checkGraduateStatus = async () => {
      try {
        const tokenResponse = await axios.get(`${BACKEND_URL}/api/graduate/get-token`, {
          withCredentials: true,
        });
        if (tokenResponse.data.token) {
          setIsAuthenticatedGraduate(true);
        } else {
          setIsAuthenticatedGraduate(false);
        }
      } catch (err) {
        setIsAuthenticatedGraduate(false);
      }
    };

    // Only check graduate status if no share token
    if (!urlShareToken) {
      checkGraduateStatus();
    }
  }, [urlShareToken]);

  // Use ClientLayout for share token or non-graduates, GeneralLayout for authenticated graduates
  const Layout = urlShareToken || !isAuthenticatedGraduate ? ClientLayout : GeneralLayout;

  console.log('PortfolioRouteWrapper state:', { urlShareToken, isAuthenticatedGraduate, Layout: Layout.name });

  return (
    <Layout>
      <ViewPortfolio />
    </Layout>
  );
};

export default PortfolioRouteWrapper;