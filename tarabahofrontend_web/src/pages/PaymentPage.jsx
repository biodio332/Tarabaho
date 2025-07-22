"use client"

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";
import Footer from "../components/Footer";
import axios from "axios";
import "../styles/BookingSystem.css";

const PaymentPages = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedCategory = location.state?.selectedCategory || "Unknown";
  const [formData, setFormData] = useState({
    jobDetails: "",
    paymentMethod: "CASH",
    onlineMethod: "GCASH",
  });
  const [userDetails, setUserDetails] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
  const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/user/me`, { withCredentials: true });
        console.log("Fetched user details:", response.data);
        setUserDetails({
          fullName: response.data.firstname && response.data.lastname
            ? `${response.data.firstname} ${response.data.lastname}`
            : "",
          email: response.data.email || "",
          phone: response.data.phoneNumber || "",
        });
      } catch (err) {
        console.error("Failed to fetch user details:", err.response?.data, err.message);
        setError("Failed to load user details. Please try again.");
        if (err.response?.status === 401) {
          navigate("/login");
        }
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.jobDetails || !formData.paymentMethod) {
      setError("Please fill in all required fields.");
      return;
    }

    if (selectedCategory === "Unknown") {
      setError("No category selected. Please go back and select a category.");
      return;
    }

    if (formData.paymentMethod === "ONLINE" && (!userDetails.fullName || !userDetails.email || !userDetails.phone)) {
      setError("User details are incomplete. Please ensure your profile has a name, email, and phone number.");
      return;
    }

    try {
      sessionStorage.setItem("jobDetails", formData.jobDetails);
      sessionStorage.setItem("paymentMethod", formData.paymentMethod);
      sessionStorage.setItem("categoryName", selectedCategory);
      console.log("Stored session data:", {
        jobDetails: formData.jobDetails,
        paymentMethod: formData.paymentMethod,
        categoryName: selectedCategory,
      });
    } catch (storageErr) {
      console.error("sessionStorage error:", storageErr);
      setError("Failed to store booking data. Please check browser storage settings and try again.");
      return;
    }

    try {
      if (formData.paymentMethod === "CASH") {
        navigate(`/booking/${workerId}/request`, { state: { bookingCreated: false } });
      } else if (formData.paymentMethod === "ONLINE" && formData.onlineMethod === "GCASH") {
        console.log("Initiating GCash payment for worker:", workerId);
        await initiatePaymentIntent();
      }
    } catch (err) {
      console.error("Error during submission:", {
        message: err.message,
        stack: err.stack,
        response: err.response?.data,
      });
      setError(err.response?.data?.error || "Failed to process payment. Please try again.");
    }
  };

  const initiatePaymentIntent = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/payments/intent`,
        {
          amount: 10000,
          description: `Booking for worker ${workerId}`,
        },
        { withCredentials: true }
      );
      console.log("Payment Intent Response:", response.data);
      const intentId = response.data.data.id;
      if (!intentId) {
        throw new Error("Payment Intent ID not returned from server");
      }
      sessionStorage.setItem("paymentIntentId", intentId);
      console.log("Stored paymentIntentId:", intentId);
      await createPaymentMethod(intentId);
    } catch (err) {
      console.error("Error creating payment intent:", {
        message: err.message,
        response: err.response?.data,
      });
      setError("Failed to initiate payment: " + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  const createPaymentMethod = async (paymentIntentId) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/payments/method`,
        {
          name: userDetails.fullName,
          email: userDetails.email,
          phone: userDetails.phone,
          type: "gcash",
        },
        { withCredentials: true }
      );
      console.log("Payment Method Response:", response.data);
      const paymentMethodId = response.data.data.id;
      if (!paymentMethodId) {
        throw new Error("Payment Method ID not returned from server");
      }
      console.log("Payment Method ID:", paymentMethodId);
      await attachPaymentMethod(paymentMethodId, paymentIntentId);
    } catch (err) {
      console.error("Error creating payment method:", {
        message: err.message,
        response: err.response?.data,
      });
      setError("Failed to create payment method: " + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  const attachPaymentMethod = async (paymentMethodId, paymentIntentId) => {
    if (!paymentIntentId) {
      setError("Payment Intent ID is missing. Please try again.");
      setLoading(false);
      return;
    }

    // Log client key and return URL for debugging
    console.log("Client Key:", import.meta.env.VITE_PAYMONGO_CLIENT_KEY);
    console.log("Return URL:", `${FRONTEND_URL}/booking/${workerId}/success`);

    // Check payment intent status before attaching
    try {
      const statusResponse = await axios.get(
        `${BACKEND_URL}/api/payments/intent/${paymentIntentId}/status`,
        { withCredentials: true }
      );
      console.log("Payment Intent Status:", statusResponse.data);
      const status = statusResponse.data.data.attributes.status;
      if (status !== "awaiting_payment_method") {
        setError(`Cannot attach payment method: Payment intent is in '${status}' state.`);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error("Error checking payment intent status:", {
        message: err.message,
        response: err.response?.data,
      });
      setError("Failed to verify payment intent status: " + (err.response?.data?.error || err.message));
      setLoading(false);
      return;
    }

    try {
      const payload = {
        payment_method: paymentMethodId,
        client_key: import.meta.env.VITE_PAYMONGO_CLIENT_KEY,
        return_url: `${FRONTEND_URL}/booking/${workerId}/success`,
      };
      console.log("Attach Payment Method Payload:", payload);

      const response = await axios.post(
        `${BACKEND_URL}/api/payments/intent/attach/${paymentIntentId}`,
        payload,
        { withCredentials: true }
      );
      console.log("Attach Intent Response:", response.data);

      const redirectUrl = response.data.data.attributes.next_action?.redirect?.url;
      if (!redirectUrl) {
        throw new Error("No redirect URL provided in response");
      }
      console.log("Redirecting to:", redirectUrl);
      window.location.href = redirectUrl;
    } catch (err) {
      console.error("Error attaching payment method:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      const errorMessage = err.response?.data?.paymongo_response
        ? `Failed to process payment: ${err.response.data.paymongo_response}`
        : `Failed to process payment: ${err.response?.data?.error || err.message}`;
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <UserNavbar activePage="user-browse" />
      <div className="content-container">
        <div className="payment-card card">
          <h2>Booking Details for {selectedCategory}</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit} className="payment-form">
            <div>
              <label>Job Details</label>
              <textarea
                name="jobDetails"
                value={formData.jobDetails}
                onChange={handleInputChange}
                placeholder="Describe the job details"
                rows="4"
                required
              />
            </div>
            <div>
              <label>Payment Method</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CASH"
                    checked={formData.paymentMethod === "CASH"}
                    onChange={handleInputChange}
                  />
                  Cash
                </label>
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE"
                    checked={formData.paymentMethod === "ONLINE"}
                    onChange={handleInputChange}
                  />
                  Online
                </label>
              </div>
            </div>
            {formData.paymentMethod === "ONLINE" && (
              <div>
                <label>Online Payment Method</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="onlineMethod"
                      value="GCASH"
                      checked={formData.onlineMethod === "GCASH"}
                      onChange={handleInputChange}
                    />
                    GCash
                  </label>
                </div>
              </div>
            )}
            <button type="submit" className="button" disabled={loading}>
              {loading ? "Processing..." : formData.paymentMethod === "CASH" ? "Book Now" : "Pay Now"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentPages;