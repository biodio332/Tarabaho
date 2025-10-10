import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminNavbar from "../components/AdminNavbar";
import Footer from "../components/Footer";
import "../styles/Admin-homepage.css";

const AdminHomepage = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalTrabahadors: 0,
    topViewedProfessionalTitles: [{ title: "No views recorded", views: 0 }],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [usersResponse, workersResponse, titlesResponse] = await Promise.all([
          fetch(`${BACKEND_URL}/api/admin/users`, { method: "GET", credentials: "include" }),
          fetch(`${BACKEND_URL}/api/admin/graduates`, { method: "GET", credentials: "include" }),
          fetch(`${BACKEND_URL}/api/portfolio-view/statistics/total-views-by-title`, { method: "GET", credentials: "include" }),
        ]);

        if (!usersResponse.ok) throw new Error("Failed to fetch users");
        if (!workersResponse.ok) throw new Error("Failed to fetch workers");
        if (!titlesResponse.ok) throw new Error("Failed to fetch total views by title");

        const users = await usersResponse.json();
        const workers = await workersResponse.json();
        const titlesResponseData = await titlesResponse.json();
        const titlesWithCounts = titlesResponseData.status === "success" ? titlesResponseData.data : {};

        let topViewedTitles = [{ title: "No views recorded", views: 0 }];
        if (titlesWithCounts && Object.keys(titlesWithCounts).length > 0) {
          topViewedTitles = Object.entries(titlesWithCounts)
            .map(([title, views]) => ({ title, views: Number(views) }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 3); // Get top 3
        }

        setDashboardData({
          totalUsers: users.length,
          totalTrabahadors: workers.length,
          topViewedProfessionalTitles: topViewedTitles,
        });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="admin-homepage">
      <AdminNavbar activePage="homepage" />
      <div className="admin-main-content">
        <div className="admin-content-overlay">
          <div className="admin-welcome-container">
            <div className="admin-logo-container">
              <div className="admin-logo">
                T A R A B A H
                <svg
                  className="admin-logo-icon"
                  width="60"
                  height="60"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="12" r="8" stroke="#0078FF" strokeWidth="2" fill="none" />
                  <path d="M18 18L22 22" stroke="#0078FF" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="admin-tagline">T A R A ! T R A B A H O</div>
            </div>

            <h1 className="admin-welcome-heading">WELCOME ADMIN!</h1>
            <p className="admin-welcome-subheading">
              Manage your platform with ease and efficiency.
            </p>

            <div className="admin-dashboard-summary">
              <div className="summary-item">
                <span className="summary-label">Total Users:</span>
                <span className="summary-value">{dashboardData.totalUsers}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total Trabahadors:</span>
                <span className="summary-value">{dashboardData.totalTrabahadors}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Top 3 Viewed Professional Titles:</span>
                <div className="summary-value">
                  {dashboardData.topViewedProfessionalTitles.map((item, index) => (
                    <div key={index}>
                      {index + 1}. {item.title} ({item.views} views)
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="admin-actions">
              <Link
                to="/admin/manage-users"
                className="admin-action-button"
                aria-label="Manage Users"
              >
                MANAGE CLIENT
              </Link>
              <Link
                to="/admin/manage-trabahador"
                className="admin-action-button"
                aria-label="Manage Trabahador"
              >
                MANAGE TRABAHADOR
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminHomepage;