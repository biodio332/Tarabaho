"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import UserNavbar from "../components/UserNavbar"
import Footer from "../components/Footer"
import "../styles/BookingSystem.css"
import { FaStar, FaRegStar } from "react-icons/fa"

const WorkerProfile = () => {
  const { workerId } = useParams()
  const navigate = useNavigate()
  const [worker, setWorker] = useState(null)
  const [error, setError] = useState("")
  const BACKEND_URL = "http://localhost:8080"

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/worker/${workerId}`, {
          withCredentials: true, // Ensure cookies are sent with the request
        })
        setWorker(response.data)
      } catch (err) {
        console.error("Failed to fetch worker:", err)
        setError(
          err.response?.status === 401
            ? "Please log in to view worker details."
            : "Failed to load worker details. Please try again.",
        )
      }
    }
    fetchWorker()
  }, [workerId])

  const renderStars = (rating = 0) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? <FaStar key={i} className="star-filled" /> : <FaRegStar key={i} className="star-empty" />,
      )
    }
    return stars
  }

  const handleBookNow = () => {
    navigate(`/booking/${workerId}/payment`)
  }

  const handleViewProfile = () => {
    navigate(`/worker-profile-detail/${workerId}`)
  }

  if (error) {
    return (
      <div className="page-container">
        <UserNavbar activePage="user-browse" />
        <div className="content-container">
          <div className="error-message">{error}</div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!worker) {
    return (
      <div className="page-container">
        <UserNavbar activePage="user-browse" />
        <div className="content-container">
          <div>Loading...</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="page-container">
      <UserNavbar activePage="user-browse" />
      <div className="content-container">
        <div className="worker-profile-card card">
          <div className="worker-image">
            <img
              src={worker.profilePicture ? `${BACKEND_URL}${worker.profilePicture}` : "/placeholder.svg"}
              alt={worker.firstName}
            />
          </div>
          <div className="worker-details">
            <h2>
              {worker.firstName} {worker.lastName}
            </h2>
            <div className="provider-rating">{renderStars(worker.stars)}</div>
            <p>Hourly Rate: ₱{worker.hourly?.toFixed(2) || "N/A"}</p>
            <p>Email: {worker.email}</p>
            <p>Phone: {worker.phoneNumber || "Not provided"}</p>
            <p>Address: {worker.address || "Not provided"}</p>
            <p>Biography: {worker.biography || "No biography available"}</p>
            {worker.certificates && worker.certificates.length > 0 && (
              <div className="certificates">
                <h3>Certificates</h3>
                <ul>
                  {worker.certificates.map((cert, index) => (
                    <li key={index}>{cert.courseName || "Unnamed certificate"}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="button-group">
              <button onClick={handleBookNow} className="button">
                Book Now
              </button>
              <button onClick={handleViewProfile} className="button view-profile-button">
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default WorkerProfile
