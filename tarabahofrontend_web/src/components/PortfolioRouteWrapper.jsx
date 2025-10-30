// components/PortfolioRouteWrapper.jsx
import { useState, useEffect } from "react";
import axios from "axios";

import GeneralLayout   from "./GeneralLayout";
import ClientLayout    from "./ClientLayout";
import HomePageLayout  from "./HomePageLayout";
import ViewPortfolio   from "../pages/ViewPortfolio";

const PortfolioRouteWrapper = () => {
  const [auth, setAuth] = useState({
    isGraduate: false,
    isUser: false,
    loading: true,
  });

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  /* --------------------------------------------------------------
   * 1. Check authentication tokens (in order of priority)
   * -------------------------------------------------------------- */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1. Check if logged in as GRADUATE
        const gradResp = await axios.get(`${BACKEND_URL}/api/graduate/get-token`, {
          withCredentials: true,
        });
        if (gradResp.data?.token) {
          setAuth({ isGraduate: true, isUser: false, loading: false });
          return;
        }
      } catch {
        // Not a graduate
      }

      try {
        // 2. Check if logged in as USER
        const userResp = await axios.get(`${BACKEND_URL}/api/user/get-token`, {
          withCredentials: true,
        });
        if (userResp.data?.token) {
          setAuth({ isGraduate: false, isUser: true, loading: false });
          return;
        }
      } catch {
        // Not a user
      }

      // 3. No valid token → public view
      setAuth({ isGraduate: false, isUser: false, loading: false });
    };

    checkAuth();
  }, []);

  /* --------------------------------------------------------------
   * 2. Choose layout based on token only
   * -------------------------------------------------------------- */
  if (auth.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600 animate-pulse">Loading...</p>
      </div>
    );
  }

  let Layout;

  if (auth.isGraduate) {
    Layout = GeneralLayout;     // Owner view
  } else if (auth.isUser) {
    Layout = ClientLayout;      // Logged-in user (non-graduate)
  } else {
    Layout = HomePageLayout;    // Public / no session
  }

  console.log("PortfolioRouteWrapper →", {
    isGraduate: auth.isGraduate,
    isUser: auth.isUser,
    Layout: Layout.name,
  });

  return (
    <Layout>
      <ViewPortfolio />
    </Layout>
  );
};

export default PortfolioRouteWrapper;