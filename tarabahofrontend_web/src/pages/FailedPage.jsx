import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";
import Footer from "../components/Footer";
import "../styles/BookingSystem.css";

const FailedPage = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedCategory = location.state?.selectedCategory || "Unknown";

  const handleTryAgain = () => {
    navigate(`/booking/${workerId}/payment`, { state: { selectedCategory } });
  };

  return (
    <div className="page-container">
      <UserNavbar activePage="user-browse" />
      <div className="content-container">
        <div className="payment-card card">
          <h2>Payment Failed</h2>
          <p>Sorry, your payment could not be processed. Please try again.</p>
          <button className="button" onClick={handleTryAgain}>
            Try Again
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FailedPage;