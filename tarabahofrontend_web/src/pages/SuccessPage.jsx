import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import UserNavbar from "../components/UserNavbar";
import Footer from "../components/Footer";
import "../styles/BookingSystem.css";

const SuccessPage = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  useEffect(() => {
    const verifyPaymentAndBook = async () => {
      console.log("SuccessPage loaded for worker:", workerId);
      try {
        let intentId;
        try {
          intentId = sessionStorage.getItem("paymentIntentId");
          console.log("Retrieved paymentIntentId:", intentId);
        } catch (storageErr) {
          console.error("sessionStorage error:", storageErr);
          navigate(`/booking/${workerId}/failed`, { state: { selectedCategory: sessionStorage.getItem("categoryName") || "" } });
          return;
        }

        if (!intentId) {
          console.error("No paymentIntentId found in sessionStorage");
          navigate(`/booking/${workerId}/failed`, { state: { selectedCategory: sessionStorage.getItem("categoryName") || "" } });
          return;
        }

        const paymentStatus = await axios.get(
          `${BACKEND_URL}/api/payments/intent/${intentId}/status`,
          { withCredentials: true }
        );
        console.log("Payment Intent Status Response:", paymentStatus.data);

        if (paymentStatus.data.data.attributes.status === "succeeded") {
          const jobDetails = sessionStorage.getItem("jobDetails") || "Default job details";
          const categoryName = sessionStorage.getItem("categoryName") || "";
          console.log("Creating booking with:", { workerId, jobDetails, categoryName });
          await axios.post(
            `${BACKEND_URL}/api/booking/category`,
            {
              workerId: parseInt(workerId),
              paymentMethod: "ONLINE",
              jobDetails,
              categoryName,
            },
            { withCredentials: true }
          );
          console.log("Booking created successfully");
          try {
            sessionStorage.removeItem("jobDetails");
            sessionStorage.removeItem("paymentMethod");
            sessionStorage.removeItem("categoryName");
            sessionStorage.removeItem("paymentIntentId");
            console.log("Cleared sessionStorage");
          } catch (storageErr) {
            console.error("sessionStorage cleanup error:", storageErr);
          }
          navigate(`/booking/${workerId}/request`, { state: { bookingCreated: true } });
        } else {
          console.error("Payment not succeeded, status:", paymentStatus.data.data.attributes.status);
          navigate(`/booking/${workerId}/failed`, { state: { selectedCategory: sessionStorage.getItem("categoryName") || "" } });
        }
      } catch (err) {
        console.error("Payment verification or booking failed:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        navigate(`/booking/${workerId}/failed`, { state: { selectedCategory: sessionStorage.getItem("categoryName") || "" } });
      }
    };

    verifyPaymentAndBook();
  }, [workerId, navigate]);

  return (
    <div className="page-container">
      <UserNavbar activePage="user-browse" />
      <div className="content-container">
        <div className="payment-card card">
          <h2>Processing Payment...</h2>
          <p>Please wait while we verify your payment and create your booking.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SuccessPage;