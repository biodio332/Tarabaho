import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";
import Footer from "../components/Footer";

const AdminContactUs = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${BACKEND_URL}/api/admin/contact/inquiries`, {
          withCredentials: true,
        });
        setInquiries(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data || err.message);
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/contact/delete/${id}`, {
        withCredentials: true,
      });
      setInquiries(inquiries.filter((inquiry) => inquiry.id !== id));
      setError(null);
    } catch (err) {
      setError(err.response?.data || err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <AdminNavbar activePage="contact" />
      <main className="flex-1 p-6">
        <div className="container mx-auto bg-white/95 p-8 rounded-lg shadow-lg border-2 border-blue-500 animate-fadeIn">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center tracking-wide">
            Manage Feedback
          </h1>
          {inquiries.length === 0 ? (
            <p className="text-gray-600 text-center text-lg">No feedback submissions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="bg-blue-500 text-white">
                  <tr>
                    <th className="py-3 px-4 border-b text-left font-semibold">ID</th>
                    <th className="py-3 px-4 border-b text-left font-semibold">Name</th>
                    <th className="py-3 px-4 border-b text-left font-semibold">Email</th>
                    <th className="py-3 px-4 border-b text-left font-semibold">Phone</th>
                    <th className="py-3 px-4 border-b text-left font-semibold">Address</th>
                    <th className="py-3 px-4 border-b text-left font-semibold">Message</th>
                    <th className="py-3 px-4 border-b text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b">{inquiry.id}</td>
                      <td className="py-3 px-4 border-b">{inquiry.fullName}</td>
                      <td className="py-3 px-4 border-b">{inquiry.email}</td>
                      <td className="py-3 px-4 border-b">{inquiry.phone || "N/A"}</td>
                      <td className="py-3 px-4 border-b">{inquiry.address || "N/A"}</td>
                      <td className="py-3 px-4 border-b truncate max-w-xs">{inquiry.message}</td>
                      <td className="py-3 px-4 border-b">
                        <div className="flex space-x-2">
                          <Link
                            to={`/admin/contact/${inquiry.id}`}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-600 transform hover:scale-105 transition-all shadow-md"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleDelete(inquiry.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-600 transform hover:scale-105 transition-all shadow-md"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminContactUs;