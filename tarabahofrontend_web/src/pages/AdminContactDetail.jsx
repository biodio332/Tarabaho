import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";
import Footer from "../components/Footer";

const AdminContactDetail = () => {
  const { id } = useParams();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  useEffect(() => {
    const fetchInquiry = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${BACKEND_URL}/api/admin/contact/${id}`, {
          withCredentials: true,
        });
        setInquiry(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data || err.message);
        setLoading(false);
      }
    };

    fetchInquiry();
  }, [id]);

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

  if (!inquiry) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Inquiry not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <AdminNavbar activePage="contact" />
      <main className="flex-1 p-6">
        <div className="container mx-auto bg-white/95 p-8 rounded-lg shadow-lg border-2 border-blue-500 animate-fadeIn">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center tracking-wide">
            Feedback Details
          </h1>
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-gray-600 font-medium">Name:</span>
              <span className="text-gray-800">{inquiry.fullName}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-600 font-medium">Email:</span>
              <span className="text-gray-800">{inquiry.email}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-600 font-medium">Phone:</span>
              <span className="text-gray-800">{inquiry.phone || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-600 font-medium">Address:</span>
              <span className="text-gray-800">{inquiry.address || "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-600 font-medium">Message:</span>
              <p className="text-gray-800 whitespace-pre-wrap">{inquiry.message}</p>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Link
              to="/admin/manage-feedback"
              className="bg-blue-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-600 transform hover:scale-105 transition-all shadow-md"
            >
              Back to Feedback
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminContactDetail;