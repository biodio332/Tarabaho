"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import UserNavbar from "../components/UserNavbar"
import Footer from "../components/Footer"
import "../styles/BookingSystem.css"
import {
  FaCheck,
  FaTimes,
  FaComments,
  FaInfoCircle,
  FaCalendarCheck,
  FaCalendarTimes,
  FaSpinner,
  FaStar,
  FaPlay,
} from "react-icons/fa"

const BookingHistory = () => {
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [ratingBookingId, setRatingBookingId] = useState(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("active")
  const navigate = useNavigate()
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get(`${BACKEND_URL}/api/booking/user`, {
          withCredentials: true, // Send cookies
        })
        setBookings(response.data)
        setError("")
      } catch (err) {
        const errorMessage =
          err.response?.status === 401
            ? "Your session has expired. Please log in again."
            : err.response?.data.replace("⚠️ ", "") || "Failed to fetch booking history. Please try again."
        console.error("Failed to fetch bookings:", err.response?.data, err.message)
        setError(errorMessage)
        if (err.response?.status === 401) {
          navigate("/login")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [navigate])

  const handleCancelBooking = async (bookingId) => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/booking/${bookingId}/cancel`,
        {},
        {
          withCredentials: true, // Send cookies
        },
      )
      setBookings((prevBookings) =>
        prevBookings.map((booking) => (booking.id === bookingId ? { ...booking, status: "CANCELLED" } : booking)),
      )
      setSuccess("Booking cancelled successfully.")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      const errorMessage =
        err.response?.status === 401
          ? "Your session has expired. Please log in again."
          : err.response?.data.replace("⚠️ ", "") || "Failed to cancel booking. Please try again."
      console.error("Failed to cancel booking:", err.response?.data, err.message)
      setError(errorMessage)
      if (err.response?.status === 401) {
        navigate("/login")
      }
      setTimeout(() => setError(""), 3000)
    }
  }

  const handleStartJob = async (bookingId) => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/booking/${bookingId}/start`,
        {},
        {
          withCredentials: true, // Send cookies
        },
      )
      setBookings((prevBookings) =>
        prevBookings.map((booking) => (booking.id === bookingId ? { ...booking, status: "IN_PROGRESS" } : booking)),
      )
      setSuccess("Job started successfully.")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      const errorMessage =
        err.response?.status === 401
          ? "Your session has expired. Please log in again."
          : err.response?.data.replace("⚠️ ", "") || "Failed to start job. Please try again."
      console.error("Failed to start job:", err.response?.data, err.message)
      setError(errorMessage)
      if (err.response?.status === 401) {
        navigate("/login")
      }
      setTimeout(() => setError(""), 3000)
    }
  }

  const handleAcceptCompletion = async (bookingId) => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/booking/${bookingId}/complete/accept`,
        {},
        {
          withCredentials: true, // Send cookies
        },
      )
      setBookings((prevBookings) =>
        prevBookings.map((booking) => (booking.id === bookingId ? { ...booking, status: "COMPLETED" } : booking)),
      )
      setRatingBookingId(bookingId)
      setShowRatingModal(true)
      setSelectedBooking(null)
      setSuccess("Completion accepted successfully.")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      const errorMessage =
        err.response?.status === 401
          ? "Your session has expired. Please log in again."
          : err.response?.data.replace("⚠️ ", "") || "Failed to accept completion. Please try again."
      console.error("Failed to accept completion:", err.response?.data, err.message)
      setError(errorMessage)
      if (err.response?.status === 401) {
        navigate("/login")
      }
      setTimeout(() => setError(""), 3000)
    }
  }

  const handleSubmitRating = async () => {
    if (rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5.")
      return
    }
    try {
      await axios.post(
        `${BACKEND_URL}/api/rating`,
        { bookingId: ratingBookingId, rating, comment },
        {
          withCredentials: true, // Send cookies
        },
      )
      setShowRatingModal(false)
      setRatingBookingId(null)
      setRating(0)
      setComment("")
      setSuccess("Thank you for your rating!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      const errorMessage =
        err.response?.status === 401
          ? "Your session has expired. Please log in again."
          : err.response?.data.replace("⚠️ ", "") || "Failed to submit rating. Please try again."
      console.error("Failed to submit rating:", err.response?.data, err.message)
      setError(errorMessage)
      if (err.response?.status === 401) {
        navigate("/login")
      }
      setTimeout(() => setError(""), 3000)
    }
  }

  const handleChatNavigation = (bookingId) => {
    navigate(`/chat/${bookingId}`)
  }

  const handleRowClick = (booking) => {
    setSelectedBooking(booking)
  }

  const closeModal = () => {
    setSelectedBooking(null)
  }

  const activeBookings = bookings.filter((booking) =>
    ["PENDING", "ACCEPTED", "IN_PROGRESS", "WORKER_COMPLETED"].includes(booking.status),
  )
  const pastBookings = bookings.filter((booking) => ["REJECTED", "CANCELLED", "COMPLETED"].includes(booking.status))

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "PENDING":
        return "status-badge pending"
      case "ACCEPTED":
        return "status-badge accepted"
      case "IN_PROGRESS":
        return "status-badge in-progress"
      case "WORKER_COMPLETED":
        return "status-badge worker-completed"
      case "COMPLETED":
        return "status-badge completed"
      case "REJECTED":
        return "status-badge rejected"
      case "CANCELLED":
        return "status-badge cancelled"
      default:
        return "status-badge"
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const renderStarRating = () => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar key={star} className={star <= rating ? "star filled" : "star"} onClick={() => setRating(star)} />
        ))}
      </div>
    )
  }

  return (
    <div className="page-container">
      <UserNavbar activePage="booking-history" />
      <div className="content-container">
        <div className="booking-history card">
          <div className="history-header">
            <h2>Booking History</h2>
            <p>Track and manage all your service bookings</p>
          </div>

          {(error || success) && (
            <div className={`notification ${error ? "error" : "success"}`}>{error || success}</div>
          )}

          <div className="history-tabs">
            <button
              className={`tab-button ${activeTab === "active" ? "active" : ""}`}
              onClick={() => setActiveTab("active")}
            >
              <FaCalendarCheck /> Active Bookings
              {activeBookings.length > 0 && <span className="badge">{activeBookings.length}</span>}
            </button>
            <button
              className={`tab-button ${activeTab === "past" ? "active" : ""}`}
              onClick={() => setActiveTab("past")}
            >
              <FaCalendarTimes /> Past Bookings
              {pastBookings.length > 0 && <span className="badge">{pastBookings.length}</span>}
            </button>
          </div>

          {isLoading ? (
            <div className="loading-container">
              <FaSpinner className="spinner" />
              <p>Loading bookings...</p>
            </div>
          ) : (
            <div className="bookings-container">
              {activeTab === "active" && (
                <>
                  {activeBookings.length > 0 ? (
                    <div className="booking-cards">
                      {activeBookings.map((booking) => (
                        <div key={booking.id} className="booking-card" onClick={() => handleRowClick(booking)}>
                          <div className="booking-card-header">
                            <h3>{booking.category.name}</h3>
                            <span className={getStatusBadgeClass(booking.status)}>{booking.status}</span>
                          </div>
                          <div className="booking-card-body">
                            <p className="booking-details">
                              <strong>Job Details:</strong> {booking.jobDetails}
                            </p>
                            <p className="booking-worker">
                              <strong>Worker:</strong>{" "}
                              {booking.worker
                                ? `${booking.worker.firstName} ${booking.worker.lastName}`
                                : "Not assigned yet"}
                            </p>
                            <p className="booking-date">
                              <strong>Created:</strong> {formatDate(booking.createdAt)}
                            </p>
                            <p className="booking-payment">
                              <strong>Payment:</strong> {booking.paymentMethod}
                            </p>
                          </div>
                          <div className="booking-card-actions">
                            {booking.status === "PENDING" && (
                              <button
                                className="action-button reject"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCancelBooking(booking.id)
                                }}
                              >
                                <FaTimes /> Cancel
                              </button>
                            )}
                            {booking.status === "ACCEPTED" && (
                              <button
                                className="action-button start"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStartJob(booking.id)
                                }}
                              >
                                <FaPlay /> Start Job
                              </button>
                            )}
                            {booking.status === "WORKER_COMPLETED" && (
                              <button
                                className="action-button complete"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAcceptCompletion(booking.id)
                                }}
                              >
                                <FaCheck /> Accept Completion
                              </button>
                            )}
                            {(booking.status === "ACCEPTED" || booking.status === "IN_PROGRESS") && (
                              <button
                                className="action-button chat"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleChatNavigation(booking.id)
                                }}
                              >
                                <FaComments /> Chat
                              </button>
                            )}
                            <button
                              className="action-button details"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRowClick(booking)
                              }}
                            >
                              <FaInfoCircle /> Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <FaCalendarCheck className="empty-icon" />
                      <h3>No Active Bookings</h3>
                      <p>You don't have any active bookings at the moment.</p>
                    </div>
                  )}
                </>
              )}

              {activeTab === "past" && (
                <>
                  {pastBookings.length > 0 ? (
                    <div className="booking-cards">
                      {pastBookings.map((booking) => (
                        <div key={booking.id} className="booking-card" onClick={() => handleRowClick(booking)}>
                          <div className="booking-card-header">
                            <h3>{booking.category.name}</h3>
                            <span className={getStatusBadgeClass(booking.status)}>{booking.status}</span>
                          </div>
                          <div className="booking-card-body">
                            <p className="booking-details">
                              <strong>Job Details:</strong> {booking.jobDetails}
                            </p>
                            <p className="booking-worker">
                              <strong>Worker:</strong>{" "}
                              {booking.worker
                                ? `${booking.worker.firstName} ${booking.worker.lastName}`
                                : "Not assigned"}
                            </p>
                            <p className="booking-date">
                              <strong>Created:</strong> {formatDate(booking.createdAt)}
                            </p>
                            <p className="booking-payment">
                              <strong>Payment:</strong> {booking.paymentMethod}
                            </p>
                          </div>
                          <div className="booking-card-actions">
                            <button
                              className="action-button details"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRowClick(booking)
                              }}
                            >
                              <FaInfoCircle /> Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <FaCalendarTimes className="empty-icon" />
                      <h3>No Past Bookings</h3>
                      <p>You don't have any past bookings to display.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {selectedBooking && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="booking-details-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Booking Details</h2>
                  <button className="close-button" onClick={closeModal}>
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <div className="detail-group">
                    <span className="detail-label">Booking ID:</span>
                    <span className="detail-value">{selectedBooking.id}</span>
                  </div>
                  <div className="detail-group">
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">{selectedBooking.category.name}</span>
                  </div>
                  <div className="detail-group">
                    <span className="detail-label">Status:</span>
                    <span className={`detail-value ${getStatusBadgeClass(selectedBooking.status)}`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                  <div className="detail-group">
                    <span className="detail-label">Payment Method:</span>
                    <span className="detail-value">{selectedBooking.paymentMethod}</span>
                  </div>
                  <div className="detail-group">
                    <span className="detail-label">Job Details:</span>
                    <span className="detail-value">{selectedBooking.jobDetails}</span>
                  </div>
                  <div className="detail-group">
                    <span className="detail-label">Created At:</span>
                    <span className="detail-value">{formatDate(selectedBooking.createdAt)}</span>
                  </div>
                  <div className="detail-group">
                    <span className="detail-label">Updated At:</span>
                    <span className="detail-value">
                      {selectedBooking.updatedAt ? formatDate(selectedBooking.updatedAt) : "N/A"}
                    </span>
                  </div>
                  <div className="detail-group">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{selectedBooking.type}</span>
                  </div>
                  <div className="detail-group">
                    <span className="detail-label">Worker:</span>
                    <span className="detail-value">
                      {selectedBooking.worker
                        ? `${selectedBooking.worker.firstName} ${selectedBooking.worker.lastName}`
                        : "Not assigned"}
                    </span>
                  </div>
                  {selectedBooking.latitude && selectedBooking.longitude && (
                    <div className="detail-group">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">
                        Lat: {selectedBooking.latitude}, Lon: {selectedBooking.longitude}
                      </span>
                    </div>
                  )}
                  {selectedBooking.radius && (
                    <div className="detail-group">
                      <span className="detail-label">Radius:</span>
                      <span className="detail-value">{selectedBooking.radius} km</span>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  {selectedBooking.status === "PENDING" && (
                    <button className="action-button reject" onClick={() => handleCancelBooking(selectedBooking.id)}>
                      <FaTimes /> Cancel Booking
                    </button>
                  )}
                  {selectedBooking.status === "ACCEPTED" && (
                    <button className="action-button start" onClick={() => handleStartJob(selectedBooking.id)}>
                      <FaPlay /> Start Job
                    </button>
                  )}
                  {selectedBooking.status === "WORKER_COMPLETED" && (
                    <button
                      className="action-button complete"
                      onClick={() => handleAcceptCompletion(selectedBooking.id)}
                    >
                      <FaCheck /> Accept Completion
                    </button>
                  )}
                  {(selectedBooking.status === "ACCEPTED" || selectedBooking.status === "IN_PROGRESS") && (
                    <button className="action-button chat" onClick={() => handleChatNavigation(selectedBooking.id)}>
                      <FaComments /> Chat
                    </button>
                  )}
                  <button className="action-button close" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {showRatingModal && (
            <div className="modal-overlay" onClick={() => setShowRatingModal(false)}>
              <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Rate Your Experience</h2>
                  <button className="close-button" onClick={() => setShowRatingModal(false)}>
                    ×
                  </button>
                </div>
                <div className="modal-body">
                  <p>Thank you for using our app! Please provide a rating for the worker.</p>
                  <div className="rating-stars">{renderStarRating()}</div>
                  <div className="form-group">
                    <label>Comment (optional):</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      maxLength="500"
                      placeholder="Share your experience with this worker..."
                      className="rating-textarea"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="action-button submit" onClick={handleSubmitRating}>
                    <FaCheck /> Submit Rating
                  </button>
                  <button
                    className="action-button skip"
                    onClick={() => {
                      setShowRatingModal(false)
                      setRatingBookingId(null)
                      setRating(0)
                      setComment("")
                    }}
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default BookingHistory