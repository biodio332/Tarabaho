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

  if (loading) return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AdminNavbar activePage="homepage" />
      <div className="flex-1 flex justify-center items-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading dashboard data...</p>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AdminNavbar activePage="homepage" />
      <div className="flex-1 flex justify-center items-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 max-w-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-700 font-semibold">Error Loading Dashboard</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AdminNavbar activePage="homepage" />
      <main className="flex-1 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="bg-white border-b-4 border-blue-700 shadow-sm mb-8">
            <div className="px-6 py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Administrator Dashboard</h1>
                  <p className="text-gray-600 text-base">Tarabaho: Tara! Trabaho - Management Portal</p>
                </div>
                <div className="hidden md:block">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg px-6 py-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">System Status</p>
                    <p className="text-blue-700 font-semibold text-lg">Operational</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users Card */}
            <div className="bg-white border-l-4 border-blue-600 shadow-md rounded-sm p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">{dashboardData.totalUsers}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Trabahadors Card */}
            <div className="bg-white border-l-4 border-green-600 shadow-md rounded-sm p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">Total Trabahadors</p>
                  <p className="text-3xl font-bold text-gray-900">{dashboardData.totalTrabahadors}</p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Feedback Card */}
            <div className="bg-white border-l-4 border-yellow-600 shadow-md rounded-sm p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">Total Feedback</p>
                  <p className="text-3xl font-bold text-gray-900">{dashboardData.totalFeedback}</p>
                </div>
                <div className="bg-yellow-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Top Viewed Titles Card */}
            <div className="bg-white border-l-4 border-purple-600 shadow-md rounded-sm p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Top Viewed</p>
                <div className="bg-purple-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-2">
                {dashboardData.topViewedProfessionalTitles.length > 0 && dashboardData.topViewedProfessionalTitles[0].title !== "No views recorded" ? (
                  dashboardData.topViewedProfessionalTitles.map((item, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-semibold text-gray-900">{index + 1}.</span>
                      <span className="text-gray-700 ml-2">{item.title}</span>
                      <span className="text-gray-500 ml-2">({item.views})</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No views recorded</p>
                )}
              </div>
            </div>
          </div>

          {/* Management Actions Section */}
          <div className="bg-white shadow-md rounded-sm border border-gray-200 mb-8">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Management Actions</h2>
              <p className="text-sm text-gray-600 mt-1">Access administrative functions and manage platform resources</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/admin/manage-users"
                  className="group bg-white border-2 border-gray-300 rounded-sm p-6 hover:border-blue-600 hover:shadow-md transition-all"
                  aria-label="Manage Users"
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 rounded-sm p-3 mr-4 group-hover:bg-blue-600 transition-colors">
                      <svg className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Manage Clients</h3>
                  </div>
                  <p className="text-sm text-gray-600">View and manage registered client accounts</p>
                </Link>

                <Link
                  to="/admin/manage-graduate"
                  className="group bg-white border-2 border-gray-300 rounded-sm p-6 hover:border-green-600 hover:shadow-md transition-all"
                  aria-label="Manage Trabahador"
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 rounded-sm p-3 mr-4 group-hover:bg-green-600 transition-colors">
                      <svg className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Manage Graduates</h3>
                  </div>
                  <p className="text-sm text-gray-600">View and manage graduate/trabahador accounts</p>
                </Link>

                <Link
                  to="/admin/manage-feedback"
                  className="group bg-white border-2 border-gray-300 rounded-sm p-6 hover:border-yellow-600 hover:shadow-md transition-all"
                  aria-label="Manage Feedback"
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-yellow-100 rounded-sm p-3 mr-4 group-hover:bg-yellow-600 transition-colors">
                      <svg className="w-6 h-6 text-yellow-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors">Manage Feedback</h3>
                  </div>
                  <p className="text-sm text-gray-600">Review and respond to user inquiries and feedback</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminHomepage;