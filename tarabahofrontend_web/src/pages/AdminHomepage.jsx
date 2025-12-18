import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import AdminNavbar from "../components/AdminNavbar";
import Footer from "../components/Footer";

const AdminHomepage = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalTrabahadors: 0,
    totalFeedback: 0,
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

        const [usersResponse, workersResponse, inquiriesResponse, titlesResponse] = await Promise.all([
          fetch(`${BACKEND_URL}/api/admin/users`, { method: "GET", credentials: "include" }),
          fetch(`${BACKEND_URL}/api/admin/graduates`, { method: "GET", credentials: "include" }),
          fetch(`${BACKEND_URL}/api/admin/contact/inquiries`, { method: "GET", credentials: "include" }),
          fetch(`${BACKEND_URL}/api/portfolio-view/statistics/total-views-by-title`, { method: "GET", credentials: "include" }),
        ]);

        if (!usersResponse.ok) throw new Error(`Failed to fetch users: ${usersResponse.status} ${usersResponse.statusText}`);
        if (!workersResponse.ok) throw new Error(`Failed to fetch workers: ${workersResponse.status} ${workersResponse.statusText}`);
        if (!inquiriesResponse.ok) {
          const errorText = await inquiriesResponse.text();
          throw new Error(`Failed to fetch feedback: ${inquiriesResponse.status} ${errorText}`);
        }
        if (!titlesResponse.ok) throw new Error(`Failed to fetch total views by title: ${titlesResponse.status} ${titlesResponse.statusText}`);

        const users = await usersResponse.json();
        const workers = await workersResponse.json();
        const inquiries = await inquiriesResponse.json();
        const titlesResponseData = await titlesResponse.json();
        const titlesWithCounts = titlesResponseData.status === "success" ? titlesResponseData.data : {};

        let topViewedTitles = [{ title: "No views recorded", views: 0 }];
        if (titlesWithCounts && Object.keys(titlesWithCounts).length > 0) {
          topViewedTitles = Object.entries(titlesWithCounts)
            .map(([title, views]) => ({ title, views: Number(views) }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 3);
        }

        setDashboardData({
          totalUsers: users.length,
          totalTrabahadors: workers.length,
          totalFeedback: inquiries.length,
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

  if (loading) return <div className="flex justify-center items-center h-screen text-gray-600">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-600">Error: {error}</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <AdminNavbar activePage="homepage" />
      <main className="flex-1 flex items-center justify-center bg-[url('../assets/images/homepage.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/90"></div>
        <div className="relative bg-white/95 p-8 rounded-lg w-full max-w-2xl text-center shadow-lg border-2 border-blue-500 animate-fadeIn">
          <div className="mb-8">
            <div className="flex justify-center items-center text-blue-500 text-4xl font-extrabold tracking-widest">
              T A R A B A H
              <svg
                className="ml-2"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="8" stroke="#0078FF" strokeWidth="2" fill="none" />
                <path d="M18 18L22 22" stroke="#0078FF" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-blue-500 text-sm font-medium tracking-widest mt-2 opacity-90">
              T A R A ! T R A B A H O
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-4 tracking-wide">WELCOME ADMIN!</h1>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            Manage your platform with ease and efficiency.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-100 p-4 rounded-md mb-8">
            <div className="flex flex-col items-center">
              <span className="text-gray-600 font-medium">Total Users:</span>
              <span className="text-blue-500 text-xl font-bold">{dashboardData.totalUsers}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-gray-600 font-medium">Total Trabahadors:</span>
              <span className="text-blue-500 text-xl font-bold">{dashboardData.totalTrabahadors}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-gray-600 font-medium">Total Feedback:</span>
              <span className="text-blue-500 text-xl font-bold">{dashboardData.totalFeedback}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-gray-600 font-medium">Top 3 Viewed Professional Titles:</span>
              <div className="text-blue-500 text-base font-semibold">
                {dashboardData.topViewedProfessionalTitles.map((item, index) => (
                  <div key={index}>
                    {index + 1}. {item.title} ({item.views} views)
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              to="/admin/manage-users"
              className="bg-blue-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-600 transform hover:scale-105 transition-all shadow-md hover:shadow-lg"
              aria-label="Manage Users"
            >
              MANAGE CLIENT
            </Link>
            <Link
              to="/admin/manage-graduate"
              className="bg-blue-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-600 transform hover:scale-105 transition-all shadow-md hover:shadow-lg"
              aria-label="Manage Trabahador"
            >
              MANAGE GRADUATE
            </Link>
            <Link
              to="/admin/manage-feedback"
              className="bg-blue-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-600 transform hover:scale-105 transition-all shadow-md hover:shadow-lg"
              aria-label="Manage Feedback"
            >
              MANAGE FEEDBACK
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminHomepage;