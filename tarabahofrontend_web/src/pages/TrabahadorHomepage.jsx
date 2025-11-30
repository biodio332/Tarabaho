"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import "../styles/TrabahadorHomepage.css";
import { FaPlus, FaTimes, FaEye, FaClock, FaCalendarAlt, FaChartLine, FaUpload } from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TrabahadorHomepage = () => {
  const [trabahadorName, setTrabahadorName] = useState("");
  const [graduateData, setGraduateData] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [viewStats, setViewStats] = useState(null);
  const [viewTrends, setViewTrends] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showVerificationPendingModal, setShowVerificationPendingModal] = useState(false);
  const [newCertificate, setNewCertificate] = useState({
    courseName: "",
    certificateNumber: "",
    issueDate: "",
    certificateFile: null,
  });
  const [token, setToken] = useState(null);
  const [chartPeriod, setChartPeriod] = useState('month'); // week, month, year
  const [chartType, setChartType] = useState('line'); // line, bar
  const [trendsLoading, setTrendsLoading] = useState(false);
  
  const certificateFileInputRef = useRef(null);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  // Helper function to generate date range with labels
  const generateDateRange = (period) => {
    const today = new Date();
    const dates = [];
    
    switch (period) {
      case 'week':
        // Last 7 days (including today)
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const label = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          });
          dates.push({
            date: date.toISOString().split('T')[0], // YYYY-MM-DD
            label: label,
            views: 0
          });
        }
        break;
        
      case 'month':
        // Last 30 days, but only show last 3 days if no views (your requirement)
        const hasViews = viewTrends.some(item => parseInt(item.views) > 0);
        const daysToShow = hasViews ? 30 : 3;
        
        for (let i = daysToShow - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const label = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          });
          dates.push({
            date: date.toISOString().split('T')[0], // YYYY-MM-DD
            label: label,
            views: 0
          });
        }
        break;
        
      case 'year':
        // Last 12 months
        for (let i = 11; i >= 0; i--) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const label = date.toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
          });
          dates.push({
            date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`, // YYYY-MM
            label: label,
            views: 0
          });
        }
        break;
        
      default:
        // Default to month
        return generateDateRange('month');
    }
    
    return dates;
  };

  // Helper function to merge backend data with date range
  const mergeWithBackendData = (backendData, dateRange) => {
    const merged = dateRange.map(rangeItem => {
      const backendItem = backendData.find(item => item.date === rangeItem.date);
      return {
        ...rangeItem,
        views: backendItem ? parseInt(backendItem.views) || 0 : rangeItem.views
      };
    });
    
    // For year period - filter out zero views for bar chart only
    if (chartPeriod === 'year' && chartType === 'bar') {
      return merged.filter(item => item.views > 0);
    }
    
    return merged;
  };

  // Initial page load - fetch everything once
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      console.log("🟢 Initial page load - fetching all data");

      const username = localStorage.getItem("username");
      if (!username) {
        console.log("❌ No username found, redirecting to signin");
        setError("User not logged in. Please sign in.");
        navigate("/signin");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch token
        console.log("🔑 Fetching authentication token");
        const tokenResponse = await axios.get(`${BACKEND_URL}/api/graduate/get-token`, {
          withCredentials: true,
        });
        const fetchedToken = tokenResponse.data.token;
        if (!fetchedToken) {
          console.log("❌ No token received, redirecting to signin");
          setError("Authentication token missing. Please sign in again.");
          navigate("/signin");
          setIsLoading(false);
          return;
        }
        setToken(fetchedToken);
        console.log("✅ Token received successfully");

        // Fetch graduate data
        console.log("👤 Fetching graduate profile");
        const graduateResponse = await axios.get(
          `${BACKEND_URL}/api/graduate/username/${username}`,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${fetchedToken}` },
          }
        );
        const graduateData = graduateResponse.data;
        console.log("✅ Graduate data received:", graduateData);

        if (graduateData) {
          setTrabahadorName(graduateData.firstName || "");
          setGraduateData(graduateData);
          localStorage.setItem("username", graduateData.username);

          // Fetch certificates
          console.log("📜 Fetching certificates");
          try {
            const certificateResponse = await axios.get(
              `${BACKEND_URL}/api/certificate/graduate/${graduateData.id}`,
              {
                withCredentials: true,
                headers: { Authorization: `Bearer ${fetchedToken}` },
              }
            );
            console.log("✅ Certificates received:", certificateResponse.data);
            setCertificates(certificateResponse.data || []);
          } catch (certificateErr) {
            console.error("⚠️ Failed to fetch certificates:", certificateErr.response?.data || certificateErr.message);
            if (certificateErr.response?.status === 401) {
              console.log("❌ Session expired during certificate fetch");
              setError("Session expired. Please sign in again.");
              localStorage.removeItem("isLoggedIn");
              localStorage.removeItem("userType");
              localStorage.removeItem("username");
              document.cookie = "jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              navigate("/signin");
            } else {
              setCertificates([]);
            }
          }

          // Fetch portfolio data
          console.log("📁 Fetching portfolio");
          let portfolioData = null;
          try {
            const portfolioResponse = await axios.get(
              `${BACKEND_URL}/api/portfolio/graduate/${graduateData.id}/portfolio`,
              {
                withCredentials: true,
                headers: { Authorization: `Bearer ${fetchedToken}` },
              }
            );
            console.log("✅ Portfolio data received:", portfolioResponse.data);
            portfolioData = portfolioResponse.data;
            setPortfolio(portfolioData);
          } catch (portfolioErr) {
            if (portfolioErr.response?.status === 404) {
              console.log("ℹ️ No portfolio found for graduate ID:", graduateData.id);
              setPortfolio(null);
            } else if (portfolioErr.response?.status === 401) {
              console.log("❌ Session expired during portfolio fetch");
              setError("Session expired. Please sign in again.");
              localStorage.removeItem("isLoggedIn");
              localStorage.removeItem("userType");
              localStorage.removeItem("username");
              document.cookie = "jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              navigate("/signin");
            } else {
              console.error("⚠️ Portfolio fetch error:", portfolioErr.response?.data || portfolioErr.message);
              setPortfolio(null);
            }
          }

          // Fetch view statistics if portfolio exists
          if (portfolioData && portfolioData.id) {
            console.log("📊 Fetching view statistics");
            try {
              const viewStatsResponse = await axios.get(
                `${BACKEND_URL}/api/portfolio-view/stats/${portfolioData.id}`,
                {
                  withCredentials: true,
                  headers: { Authorization: `Bearer ${fetchedToken}` },
                }
              );
              console.log("✅ View stats received:", viewStatsResponse.data);
              setViewStats(viewStatsResponse.data);
            } catch (viewStatsErr) {
              console.error("⚠️ Failed to fetch view stats:", viewStatsErr.response?.data || viewStatsErr.message);
              setViewStats({ weeklyViews: 0, monthlyViews: 0, yearlyViews: 0 });
            }

            // Fetch initial view trends
            console.log("📈 Fetching initial view trends for period:", chartPeriod);
            await fetchViewTrends(portfolioData.id, fetchedToken);
          }
        } else {
          console.log("❌ Graduate profile not found");
          setError("Graduate profile not found");
        }
      } catch (err) {
        console.error("💥 Initial data fetch error:", err.response?.data || err.message);
        if (err.response?.status === 401) {
          console.log("❌ Unauthorized request, logging out");
          setError("Session expired. Please sign in again.");
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("userType");
          localStorage.removeItem("username");
          document.cookie = "jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          navigate("/signin");
        } else {
          setError(`Error ${err.response?.status || "Unknown"}: ${err.response?.data?.message || err.response?.statusText || "Failed to load profile data"}`);
        }
      } finally {
        setIsLoading(false);
        console.log("✅ Initial page load complete");
      }
    };

    fetchInitialData();
  }, [navigate]); // Only run on mount/navigation

  // Separate effect for chart filter changes - only refreshes trends
  const fetchViewTrends = useCallback(async (portfolioId, token, period) => {
    if (!portfolioId || !token) {
      console.warn("Cannot fetch trends: missing portfolioId or token");
      return;
    }
    
    setTrendsLoading(true);
    console.log(`🔄 Fetching view trends for portfolio ${portfolioId}, period: ${period}`);
    
    try {
      const trendsResponse = await axios.get(
        `${BACKEND_URL}/api/portfolio-view/trends/${portfolioId}?period=${period}`,
        {
          withCredentials: true,
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      
      console.log("✅ View trends response:", trendsResponse.data);
      
      // Format the data for Chart.js - handle both single object and array responses
      let backendData = [];
      if (Array.isArray(trendsResponse.data)) {
        backendData = trendsResponse.data.map(item => ({
          date: item.date,
          views: parseInt(item.views) || 0
        }));
      } else if (trendsResponse.data && trendsResponse.data.date) {
        // Single item case
        backendData = [{
          date: trendsResponse.data.date,
          views: parseInt(trendsResponse.data.views) || 0
        }];
      }
      
      // Generate complete date range and merge with backend data
      const dateRange = generateDateRange(period);
      const mergedData = mergeWithBackendData(backendData, dateRange);
      
      console.log("📊 Merged trends data:", mergedData);
      setViewTrends(mergedData);
    } catch (trendsErr) {
      console.error("❌ Failed to fetch view trends:", {
        status: trendsErr.response?.status,
        statusText: trendsErr.response?.statusText,
        data: trendsErr.response?.data,
        url: trendsErr.config?.url
      });
      
      if (trendsErr.response?.status === 401) {
        console.log("🔐 Token expired during trends fetch, redirecting to signin");
        setError("Session expired. Please sign in again.");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userType");
        localStorage.removeItem("username");
        document.cookie = "jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        navigate("/signin");
      }
      
      // Generate empty date range for no data state
      const emptyDateRange = generateDateRange(period);
      setViewTrends(emptyDateRange);
    } finally {
      setTrendsLoading(false);
      console.log("✅ Trends fetch complete for period:", period);
    }
  }, [navigate, chartPeriod, chartType]); // Added dependencies for date range generation

  // Only refetch trends when chartPeriod changes (not the whole page)
  useEffect(() => {
    if (portfolio && token) {
      console.log("📈 Chart period changed to:", chartPeriod);
      fetchViewTrends(portfolio.id, token, chartPeriod);
    }
  }, [chartPeriod, portfolio, token, fetchViewTrends]);

  // Chart configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#3b82f6',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function(context) {
            return `${context[0].label}`;
          },
          label: function(context) {
            const views = context.parsed.y;
            return `${views} ${views === 1 ? 'view' : 'views'}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 12,
            family: 'Segoe UI, system-ui, sans-serif',
          },
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 12,
            family: 'Segoe UI, system-ui, sans-serif',
          },
          stepSize: 1,
          callback: function(value) {
            return value === 0 ? '0' : value;
          }
        },
      },
    },
    elements: {
      point: {
        radius: 5,
        hoverRadius: 7,
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        borderWidth: 2,
      },
      line: {
        borderWidth: 3,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true,
      },
      bar: {
        borderRadius: 4,
        borderSkipped: false,
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart',
    },
  };

  // Prepare chart data from merged backend + generated data
  const chartData = viewTrends && viewTrends.length > 0 ? {
    labels: viewTrends.map(item => item.label),
    datasets: [
      {
        label: 'Portfolio Views',
        data: viewTrends.map(item => item.views),
        borderColor: '#3b82f6',
        backgroundColor: chartType === 'bar' 
          ? 'rgba(59, 130, 246, 0.8)' 
          : 'rgba(59, 130, 246, 0.1)',
        borderWidth: chartType === 'line' ? 3 : 1,
        fill: chartType === 'line',
        barPercentage: chartType === 'bar' ? 0.8 : 1,
        categoryPercentage: chartType === 'bar' ? 0.9 : 1,
      },
    ],
  } : null;

  const handleCertificateInputChange = (e) => {
    const { name, value } = e.target;
    setNewCertificate((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleCertificateFileChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith("image/")) {
      setError("Please select an image file for the certificate.");
      return;
    }
    setNewCertificate((prev) => ({ ...prev, certificateFile: file }));
    setError("");
  };

  const handleCertificateImageClick = () => {
    certificateFileInputRef.current?.click();
  };

  const handleAddCertificate = async () => {
    if (!newCertificate.courseName || !newCertificate.certificateNumber || !newCertificate.issueDate || !newCertificate.certificateFile) {
      setError("Please fill in all certificate fields and select a file.");
      return;
    }

    if (!token || !graduateData?.id) {
      setError("Session expired or graduate ID missing. Please sign in again.");
      navigate("/signin");
      return;
    }

    console.log("📤 Adding certificate for graduate ID:", graduateData.id);
    
    const certificateData = new FormData();
    certificateData.append("courseName", newCertificate.courseName);
    certificateData.append("certificateNumber", newCertificate.certificateNumber);
    certificateData.append("issueDate", newCertificate.issueDate);
    certificateData.append("certificateFile", newCertificate.certificateFile);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/certificate/graduate/${graduateData.id}`,
        certificateData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("✅ Certificate added:", response.data);
      
      setCertificates((prev) => [...prev, response.data]);
      setNewCertificate({
        courseName: "",
        certificateNumber: "",
        issueDate: "",
        certificateFile: null,
      });
      setShowCertificateModal(false);
      setError("");
    } catch (err) {
      console.error("❌ Failed to add certificate:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || err.response?.data || "Failed to add certificate. Please try again.";
      setError(errorMessage);
      if (err.response?.status === 401) {
        console.log("🔐 Session expired during certificate upload");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userType");
        localStorage.removeItem("username");
        document.cookie = "jwtToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        navigate("/signin");
      }
    }
  };

  const handleCertificateModalClose = () => {
    setShowCertificateModal(false);
    setNewCertificate({
      courseName: "",
      certificateNumber: "",
      issueDate: "",
      certificateFile: null,
    });
    setError("");
  };

  const handleVerificationPendingModalClose = () => {
    setShowVerificationPendingModal(false);
    setError("");
  };

  const handleCreatePortfolioClick = () => {
    console.log("handleCreatePortfolioClick: isVerified=", graduateData?.isVerified, "certificates length=", certificates.length);
    if (!graduateData?.isVerified) {
      if (certificates.length === 0) {
        console.log("📜 Not verified and no certificates, opening certificate modal");
        setShowCertificateModal(true);
      } else {
        console.log("⏳ Not verified but certificates exist, showing verification pending modal");
        setShowVerificationPendingModal(true);
      }
    } else {
      console.log("✅ Graduate is verified, redirecting to /create-portfolio");
      navigate("/create-portfolio");
    }
  };

  // Chart period display names
  const getPeriodDisplayName = (period) => {
    switch (period) {
      case 'week': return 'Last 7 days';
      case 'month': return 'Last 30 days';
      case 'year': return 'Last year';
      default: return 'This month';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col relative overflow-hidden">
      {/* Futuristic Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Gradient Mesh Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-950/30 to-purple-950/30"></div>
        
        {/* Animated Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite'
          }}
        ></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Animated Lines */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-shimmer"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent animate-shimmer" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-8 px-4 relative z-10">
        <div className="w-full max-w-6xl">
          {/* Welcome Section */}
          <div className="text-center mb-12 animate-fadeInUp">
            <div className="inline-flex items-center justify-center mb-4 animate-fadeInDown">
              <div className="text-4xl font-bold text-blue-400 tracking-wide flex items-center relative group">
                <span className="relative z-10">T A R A B A H</span>
                <div className="absolute inset-0 bg-blue-400/20 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <svg
                  className="ml-2 w-12 h-12 relative z-10 animate-spin-slow"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="12" r="8" stroke="#60A5FA" strokeWidth="2" fill="none" className="animate-pulse" />
                  <path d="M18 18L22 22" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-sm font-medium text-blue-300 ml-2 tracking-wide relative">
                <span className="relative z-10">T A R A ! T R A B A H O</span>
                <div className="absolute inset-0 bg-blue-300/10 blur-md"></div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-2xl text-white font-semibold animate-pulse relative">
                <span className="relative z-10">Loading your dashboard...</span>
                <div className="absolute inset-0 bg-white/10 blur-xl"></div>
              </div>
            ) : error ? (
              <div className="text-lg text-red-400 bg-red-900/20 backdrop-blur-sm border border-red-500/30 p-4 rounded-lg max-w-md mx-auto shadow-lg shadow-red-500/10 animate-fadeIn">
                {error}
              </div>
            ) : (
              <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-8 relative group animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                <span className="relative z-10 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                  WELCOME {trabahadorName ? trabahadorName.toUpperCase() : "GRADUATE"}!
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
              </h1>
            )}
          </div>

          {/* Actions/Analytics Section */}
          {!isLoading && !error && (
            <div className="w-full animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              {portfolio ? (
                /* Portfolio Analytics Dashboard */
                <div className="relative bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-950/80 backdrop-blur-xl border border-blue-500/20 rounded-3xl shadow-2xl overflow-hidden group hover:border-blue-500/40 transition-all duration-500">
                  {/* Animated Border Glow */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                  
                  {/* Glassmorphism Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                  
                  {/* Header */}
                  <div className="relative bg-gradient-to-r from-gray-900/90 via-gray-800/80 to-gray-900/90 backdrop-blur-md border-b border-blue-500/20 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 group/header">
                        <div className="relative p-2 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-xl border border-blue-400/30 group-hover/header:border-blue-400/60 transition-all duration-300 group-hover/header:scale-110">
                          <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-md group-hover/header:blur-lg transition-all"></div>
                          <FaEye className="w-5 h-5 text-blue-400 relative z-10 animate-pulse" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-white relative">
                            <span className="relative z-10 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Portfolio Analytics</span>
                          </h2>
                          <p className="text-sm text-gray-400">Track your portfolio's performance</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400 relative group/stats">
                        <span className="font-medium text-white relative z-10">{viewStats?.monthlyViews || 0} total views</span>
                        <div className="relative">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse relative z-10"></div>
                          <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Stats */}
                  <div className="relative px-6 py-4 bg-gradient-to-b from-gray-900/40 to-gray-900/20 border-b border-blue-500/10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="relative text-center p-6 bg-gradient-to-br from-gray-800/60 to-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-600/50 group hover:border-green-500/60 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/0 group-hover:from-green-500/10 group-hover:to-transparent rounded-2xl transition-all duration-300"></div>
                        <div className="relative z-10">
                          <div className="text-sm font-medium text-gray-400 mb-2 flex items-center justify-center gap-1 group-hover:text-green-400 transition-colors">
                            <FaClock className="w-3 h-3" />
                            <span>Last 7 days</span>
                          </div>
                          <div className="text-4xl font-bold text-white mb-1 relative">
                            <span className="relative z-10 bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">{viewStats?.weeklyViews || 0}</span>
                            <div className="absolute inset-0 bg-green-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                          <div className="text-xs text-green-400 font-medium">
                            {viewStats?.weeklyViews > 0 ? 'Active visitors' : 'Get your first view!'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative text-center p-6 bg-gradient-to-br from-gray-800/60 to-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-600/50 group hover:border-blue-500/60 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-transparent rounded-2xl transition-all duration-300"></div>
                        <div className="relative z-10">
                          <div className="text-sm font-medium text-gray-400 mb-2 flex items-center justify-center gap-1 group-hover:text-blue-400 transition-colors">
                            <FaCalendarAlt className="w-3 h-3" />
                            <span>This month</span>
                          </div>
                          <div className="text-4xl font-bold text-white mb-1 relative">
                            <span className="relative z-10 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">{viewStats?.monthlyViews || 0}</span>
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                          <div className="text-xs text-blue-400 font-medium">
                            {viewStats?.monthlyViews > 0 ? 'Monthly total' : 'Share your work'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative text-center p-6 bg-gradient-to-br from-gray-800/60 to-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-600/50 group hover:border-purple-500/60 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-transparent rounded-2xl transition-all duration-300"></div>
                        <div className="relative z-10">
                          <div className="text-sm font-medium text-gray-400 mb-2 flex items-center justify-center gap-1 group-hover:text-purple-400 transition-colors">
                            <FaEye className="w-3 h-3" />
                            <span>All time</span>
                          </div>
                          <div className="text-4xl font-bold text-white mb-1 relative">
                            <span className="relative z-10 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">{viewStats?.yearlyViews || 0}</span>
                            <div className="absolute inset-0 bg-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                          <div className="text-xs text-purple-400 font-medium">
                            {viewStats?.yearlyViews > 0 ? 'Total visitors' : 'No views yet'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Chart Section */}
                  <div className="relative px-6 py-4 bg-gradient-to-b from-gray-900/30 to-gray-900/50">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                      <div className="relative">
                        <h3 className="text-lg font-semibold text-white relative">
                          <span className="relative z-10 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">View trends over time</span>
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {viewTrends.length} {viewTrends.length === 1 ? 'data point' : 'data points'} • 
                          {viewTrends.reduce((sum, item) => sum + item.views, 0)} total views
                          {trendsLoading && (
                            <span className="ml-2 text-blue-400 animate-pulse relative">
                              <span className="relative z-10">• updating...</span>
                              <div className="absolute inset-0 bg-blue-400/20 blur-md"></div>
                            </span>
                          )}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 flex-wrap">
                        {/* Chart Type Toggle */}
                        <div className="flex items-center gap-1 bg-gray-800/60 backdrop-blur-sm rounded-xl p-1 border border-gray-600/50">
                          <button
                            onClick={() => setChartType('line')}
                            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-2 relative overflow-hidden ${
                              chartType === 'line'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105' 
                                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                            }`}
                          >
                            {chartType === 'line' && (
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 to-transparent animate-shimmer"></div>
                            )}
                            <FaChartLine className="w-3 h-3 relative z-10" />
                            <span className="relative z-10">Line</span>
                          </button>
                          <button
                            onClick={() => setChartType('bar')}
                            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex items-center gap-2 relative overflow-hidden ${
                              chartType === 'bar'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105'
                                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                            }`}
                          >
                            {chartType === 'bar' && (
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 to-transparent animate-shimmer"></div>
                            )}
                            <div className="w-2 h-3 bg-current rounded-sm relative z-10"></div>
                            <span className="relative z-10">Bar</span>
                          </button>
                        </div>
                        
                        {/* Period Selector */}
                        <div className="relative group">
                          <select 
                            value={chartPeriod}
                            onChange={(e) => setChartPeriod(e.target.value)}
                            disabled={trendsLoading}
                            className="bg-gray-800/60 backdrop-blur-sm text-white border border-gray-600/50 rounded-lg px-4 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:border-blue-500/30"
                          >
                            <option value="week">Last 7 days</option>
                            <option value="month">Last 30 days</option>
                            <option value="year">Last year</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 group-hover:text-blue-400 transition-colors">
                            ▼
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Chart Container */}
                    <div className="h-80 relative bg-gradient-to-br from-gray-800/60 to-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-600/50 overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500"></div>
                      {trendsLoading ? (
                        <div className="h-full flex items-center justify-center relative z-10">
                          <div className="text-center text-gray-400 animate-pulse space-y-3 relative">
                            <div className="relative w-12 h-12 mx-auto">
                              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-full flex items-center justify-center border border-blue-400/30">
                                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            </div>
                            <div className="text-sm font-medium">Updating chart...</div>
                          </div>
                        </div>
                      ) : chartData && chartData.labels && chartData.labels.length > 0 ? (
                        <div className="h-full w-full p-4 relative z-10">
                          {chartType === 'line' ? (
                            <Line data={chartData} options={chartOptions} />
                          ) : (
                            <Bar data={chartData} options={chartOptions} />
                          )}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center p-8 relative z-10">
                          <div className="text-center text-gray-400 space-y-4">
                            <div className="relative w-20 h-20 mx-auto">
                              <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl"></div>
                              <div className="relative w-20 h-20 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-full flex items-center justify-center border border-gray-600/50 backdrop-blur-sm">
                                <FaChartLine className="w-10 h-10 text-gray-500" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-gray-300">No view data yet</div>
                              <div className="text-xs text-gray-500">
                                {getPeriodDisplayName(chartPeriod)}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              Share your portfolio to start tracking views
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="relative px-6 py-4 bg-gradient-to-r from-gray-900/60 via-gray-800/40 to-gray-900/60 border-t border-blue-500/10 backdrop-blur-sm">
                    <div className="flex justify-center">
                      <Link 
                        to={`/portfolio/${graduateData?.id}`} 
                        className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 text-white px-10 py-4 rounded-2xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 border border-blue-500/50 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <FaEye className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" />
                        <span className="relative z-10">View Your Portfolio</span>
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-75 transition-opacity duration-300 -z-10"></div>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                /* Create Portfolio Button */
                <div className="text-center relative">
                  <button
                    onClick={handleCreatePortfolioClick}
                    className="group relative inline-flex items-center gap-4 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 hover:from-blue-500 hover:via-blue-600 hover:to-purple-600 text-white px-14 py-7 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-2xl hover:shadow-blue-500/50 border border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                    disabled={isLoading}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <FaPlus className="w-6 h-6 relative z-10 group-hover:scale-125 group-hover:rotate-90 transition-all duration-300" />
                    <span className="relative z-10 tracking-wide">CREATE YOUR PORTFOLIO</span>
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-75 transition-opacity duration-500 -z-10 animate-pulse"></div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/0 via-white/0 to-purple-400/0 group-hover:from-blue-400/20 group-hover:via-white/10 group-hover:to-purple-400/20 transition-all duration-500"></div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Certificate Upload Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-blue-500/30 rounded-3xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl z-50 animate-scaleIn">
            {/* Animated Border Glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 blur-2xl opacity-50 animate-pulse"></div>
            
            <div className="relative bg-gradient-to-r from-gray-800/90 via-gray-800/80 to-gray-900/90 backdrop-blur-sm border-b border-blue-500/20 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative p-2 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-xl border border-blue-400/30">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-md"></div>
                  <FaUpload className="w-5 h-5 text-blue-400 relative z-10" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white relative">
                    <span className="relative z-10 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Upload TESDA Certificate</span>
                  </h3>
                  <p className="text-sm text-gray-400">Verify your graduate status</p>
                </div>
              </div>
              <button 
                onClick={handleCertificateModalClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-90"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="relative p-6 space-y-5">
              {error && (
                <div className="bg-red-900/30 backdrop-blur-sm border border-red-500/40 text-red-400 p-3 rounded-xl mb-6 text-sm shadow-lg shadow-red-500/10 animate-fadeIn">
                  {error}
                </div>
              )}
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Course Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="courseName"
                  value={newCertificate.courseName}
                  onChange={handleCertificateInputChange}
                  className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 disabled:bg-gray-700/50 disabled:cursor-not-allowed hover:border-gray-500"
                  placeholder="e.g., Automotive Servicing NC II"
                  disabled={isLoading}
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Certificate Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="certificateNumber"
                  value={newCertificate.certificateNumber}
                  onChange={handleCertificateInputChange}
                  className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 disabled:bg-gray-700/50 disabled:cursor-not-allowed hover:border-gray-500"
                  placeholder="e.g., 1234567890"
                  disabled={isLoading}
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Issue Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="issueDate"
                  value={newCertificate.issueDate}
                  onChange={handleCertificateInputChange}
                  className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 disabled:bg-gray-700/50 disabled:cursor-not-allowed hover:border-gray-500"
                  disabled={isLoading}
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Certificate Image <span className="text-red-400">*</span>
                </label>
                <div className="relative group">
                  <div 
                    className={`w-full h-32 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer relative overflow-hidden ${
                      newCertificate.certificateFile 
                        ? 'border-green-500/60 bg-green-500/10 backdrop-blur-sm' 
                        : 'border-gray-600/50 hover:border-blue-500/60 bg-gray-800/30'
                    }`}
                    onClick={handleCertificateImageClick}
                  >
                    {newCertificate.certificateFile ? (
                      <img
                        src={URL.createObjectURL(newCertificate.certificateFile)}
                        alt="Certificate Preview"
                        className="w-full h-full object-contain rounded-xl"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 group-hover:text-blue-400 transition-colors">
                        <FaUpload className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                        <div className="text-sm text-center">Click to upload</div>
                        <div className="text-xs mt-1">JPG, PNG (max 5MB)</div>
                      </div>
                    )}
                    {newCertificate.certificateFile && (
                      <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 to-transparent"></div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCertificateFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    ref={certificateFileInputRef}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="relative bg-gradient-to-r from-gray-800/60 via-gray-800/50 to-gray-800/60 backdrop-blur-sm border-t border-blue-500/10 px-6 py-4 flex gap-3 justify-end">
              <button
                className="px-6 py-2.5 bg-gray-700/60 hover:bg-gray-600/80 text-white rounded-xl font-medium transition-all duration-300 disabled:bg-gray-600/50 disabled:cursor-not-allowed hover:scale-105 border border-gray-600/50"
                onClick={handleCertificateModalClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-medium transition-all duration-300 disabled:bg-gray-600/50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105 shadow-lg shadow-blue-500/30 border border-blue-500/50 relative overflow-hidden group"
                onClick={handleAddCertificate}
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <FaUpload className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Upload Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Pending Modal */}
      {showVerificationPendingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-yellow-500/30 rounded-3xl max-w-sm w-full shadow-2xl animate-scaleIn">
            {/* Animated Border Glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-500/20 via-yellow-500/10 to-yellow-500/20 blur-2xl opacity-50 animate-pulse"></div>
            
            <div className="relative bg-gradient-to-r from-yellow-800/30 via-yellow-900/20 to-yellow-800/30 backdrop-blur-sm border-b border-yellow-500/30 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="relative p-2 bg-gradient-to-br from-yellow-500/30 to-yellow-600/20 rounded-xl border border-yellow-400/30">
                  <div className="absolute inset-0 bg-yellow-500/20 rounded-xl blur-md"></div>
                  <FaChartLine className="w-5 h-5 text-yellow-400 relative z-10 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white relative">
                    <span className="relative z-10 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">Verification Pending</span>
                  </h3>
                  <p className="text-sm text-yellow-300">Please wait for approval</p>
                </div>
              </div>
            </div>

            <div className="relative p-6 text-center">
              {error && (
                <div className="bg-red-900/30 backdrop-blur-sm border border-red-500/40 text-red-400 p-3 rounded-xl mb-6 text-sm shadow-lg shadow-red-500/10 animate-fadeIn">
                  {error}
                </div>
              )}
              <div className="text-gray-300 mb-6 space-y-2">
                <p className="text-sm">You've already submitted a certificate for verification.</p>
                <p className="text-xs text-gray-400">Our team will review it within 1-2 business days.</p>
              </div>
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-full flex items-center justify-center border border-yellow-400/30 backdrop-blur-sm">
                  <FaChartLine className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="relative bg-gradient-to-r from-gray-800/60 via-gray-800/50 to-gray-800/60 backdrop-blur-sm border-t border-yellow-500/10 px-6 py-4">
              <button
                className="w-full bg-gradient-to-r from-gray-700/60 to-gray-700/80 hover:from-gray-600/80 hover:to-gray-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 disabled:bg-gray-600/50 disabled:cursor-not-allowed hover:scale-105 border border-gray-600/50 relative overflow-hidden group"
                onClick={handleVerificationPendingModalClose}
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <span className="relative z-10">Got it</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrabahadorHomepage;