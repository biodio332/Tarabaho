"use client"

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import UserNavbar from "../components/UserNavbar";
import Footer from "../components/Footer";
import "../styles/BookingSystem.css";

const BookingRequest = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [bookingStatus, setBookingStatus] = useState("PENDING");
  const [bookingId, setBookingId] = useState(null);
  const [error, setError] = useState("");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
  const hasRun = useRef(false);

  // Check if booking was already created (from online payment flow)
  const bookingCreated = location.state?.bookingCreated || false;

  useEffect(() => {
    console.log("BookingRequest component mounted");
    return () => console.log("BookingRequest component unmounted");
  }, []);

  useEffect(() => {
    console.log("useEffect triggered for createBooking, workerId:", workerId, "hasRun:", hasRun.current);
    if (hasRun.current) {
      console.log("Skipping duplicate useEffect execution");
      return;
    }
    hasRun.current = true;

    const fetchExistingBooking = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/booking/user`,
          { withCredentials: true }
        );
        const bookings = response.data;
        console.log("Fetched user bookings:", bookings);
        const activeBooking = bookings.find(booking =>
          [ "PENDING", "ACCEPTED", "IN_PROGRESS", "WORKER_COMPLETED" ].includes(booking.status) &&
          booking.worker?.id === parseInt(workerId)
        );
        if (activeBooking) {
          setBookingId(activeBooking.id);
          setBookingStatus(activeBooking.status);
          console.log("Found existing booking:", activeBooking);
        } else {
          setError("No active booking found for this worker.");
        }
      } catch (err) {
        console.error("Failed to fetch existing booking:", err.response?.data, err.message);
        setError("Failed to fetch existing booking. Please try again.");
        if (err.response?.status === 401) {
          navigate("/login");
        }
      }
    };

    const createBooking = async () => {
      const jobDetails = sessionStorage.getItem("jobDetails") || "Default job details";
      const paymentMethod = sessionStorage.getItem("paymentMethod") || "CASH";
      const categoryName = sessionStorage.getItem("categoryName") || "";

      const requestBody = {
        workerId: parseInt(workerId),
        paymentMethod,
        jobDetails,
        categoryName,
      };
      console.log("Sending request to /api/booking/category:", requestBody);

      try {
        const response = await axios.post(
          `${BACKEND_URL}/api/booking/category`,
          requestBody,
          {
            withCredentials: true,
            timeout: 5000,
          }
        );
        if (!hasRun.current) {
          console.log("Component unmounted, ignoring response");
          return;
        }
        setBookingId(response.data.id);
        console.log("Booking created:", response.data);
        sessionStorage.removeItem("jobDetails");
        sessionStorage.removeItem("paymentMethod");
        sessionStorage.removeItem("categoryName");
      } catch (err) {
        if (!hasRun.current) {
          console.log("Component unmounted, ignoring error");
          return;
        }
        const errorMessage =
          err.response?.data.replace("⚠️ ", "") ||
          "Failed to create booking. Please try again.";
        console.error("Failed to create booking:", err.response?.data, err.message);
        setError(
          errorMessage.includes("Worker has no associated categories")
            ? "The worker has no available services. Please try another worker."
            : errorMessage.includes("User already has an active or pending booking")
            ? "You already have a pending or active booking. Please complete or cancel it first."
            : errorMessage.includes("Category not found")
            ? "The selected category is not available. Please try another service."
            : errorMessage
        );
        if (err.response?.status === 401) {
          navigate("/login");
        }
      }
    };

    if (bookingCreated) {
      console.log("Booking already created in SuccessPage; fetching existing booking.");
      fetchExistingBooking();
    } else {
      console.log("No prior booking; creating a new one.");
      createBooking();
    }

    return () => {
      console.log("Cleaning up useEffect for createBooking, resetting hasRun");
      hasRun.current = false;
    };
  }, [workerId, navigate, bookingCreated]);

  useEffect(() => {
    if (bookingId) {
      const interval = setInterval(async () => {
        try {
          const response = await axios.get(
            `${BACKEND_URL}/api/booking/${bookingId}/status`,
            {
              withCredentials: true,
            }
          );
          const status = response.data.status;
          setBookingStatus(status);
          if (status === "ACCEPTED") {
            clearInterval(interval);
            navigate(`/chat/${bookingId}`);
          } else if (status === "REJECTED" || status === "CANCELLED") {
            clearInterval(interval);
            setError(
              status === "REJECTED"
                ? "Booking was rejected by the worker."
                : "Booking was cancelled."
            );
          }
        } catch (err) {
          console.error("Failed to check booking status:", err.response?.data, err.message);
          setError("Failed to check booking status.");
          if (err.response?.status === 401) {
            navigate("/login");
          }
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [bookingId, navigate]);

  const handleCancelBooking = async () => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/booking/${bookingId}/cancel`,
        {},
        {
          withCredentials: true,
        }
      );
      setBookingStatus("CANCELLED");
      setError("Booking was cancelled.");
    } catch (err) {
      const errorMessage =
        err.response?.data.replace("⚠️ ", "") ||
        "Failed to cancel booking. Please try again.";
      console.error("Failed to cancel booking:", err.response?.data, err.message);
      setError(errorMessage);
      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  console.log("BookingRequest component rendered");

  return (
    <div className="page-container">
      <UserNavbar activePage="user-browse" />
      <div className="content-container">
        <div className="booking-card card">
          <h2>Booking Request</h2>
          {error && <div className="error-message">{error}</div>}
          {bookingId ? (
            <div>
              <p>Booking request created (ID: {bookingId}).</p>
              <p>Status: {bookingStatus}</p>
              {bookingStatus === "PENDING" && (
                <>
                  <p>Waiting for worker to accept the booking...</p>
                  <button
                    className="cancel-button"
                    onClick={handleCancelBooking}
                  >
                    Cancel Booking
                  </button>
                </>
              )}
            </div>
          ) : (
            <p>Creating booking request...</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default React.memo(BookingRequest);
