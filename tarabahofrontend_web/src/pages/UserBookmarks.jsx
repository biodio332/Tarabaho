"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axios from "axios"
import UserNavbar from "../components/UserNavbar"
import Footer from "../components/Footer"
import "../styles/UserBookmarks.css"
import { FaUser, FaBookmark, FaHistory, FaSignOutAlt, FaStar, FaMapMarkerAlt, FaSearch, FaTrash } from "react-icons/fa"
import LogoutConfirmation from "../components/User-LogoutConfirmation"

const UserBookmarks = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [bookmarkedWorkers, setBookmarkedWorkers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"

  useEffect(() => {
    const fetchBookmarkedWorkers = async () => {
      try {
        setIsLoading(true)
        console.log("Fetching bookmarked workers")
        const response = await axios.get(`${BACKEND_URL}/api/bookmarks`, {
          withCredentials: true, // Send cookies
        })
        console.log("Bookmarked workers response:", response.data)

        // Enhanced worker data with more details
        const workersData = response.data.map((worker) => ({
          id: worker.id ?? 0,
          name: `${worker.firstName ?? "Unknown"} ${worker.lastName ?? "Worker"}`,
          image: worker.profilePicture ?? "/placeholder.svg",
          rating: worker.stars ?? (Math.random() * 2 + 3).toFixed(1), // Random rating between 3-5 if not provided
          category: worker.category ?? "General",
          location: worker.address ?? "Manila, Philippines",
          hourlyRate: worker.hourly ?? Math.floor(Math.random() * 500) + 100, // Random rate if not provided
        }))

        setBookmarkedWorkers(workersData)
        setError("")
      } catch (err) {
        console.error("Failed to fetch bookmarked workers:", err)
        console.error("Error response:", err.response?.data)
        console.error("Error status:", err.response?.status)
        setError(
          err.response?.status === 401
            ? "Your session has expired. Please log in again."
            : err.response?.data?.replace("⚠️ ", "") || "Failed to load bookmarked workers. Please try again.",
        )
        if (err.response?.status === 401) {
          navigate("/login")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookmarkedWorkers()
  }, [navigate])

  const handleProfileClick = () => {
    navigate("/user-profile")
  }

  const handleHistoryClick = () => {
    navigate("/booking-history")
  }

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const confirmLogout = async () => {
    try {
      // Call backend logout endpoint to invalidate the session/cookie
      await axios.post(
        `${BACKEND_URL}/api/user/logout`,
        {},
        {
          withCredentials: true, // Send cookies
        },
      )
      console.log("User logged out")
      setShowLogoutModal(false)
      navigate("/login")
    } catch (err) {
      console.error("Failed to logout:", err)
      // Proceed with logout even if backend call fails
      setShowLogoutModal(false)
      navigate("/login")
    }
  }

  const cancelLogout = () => {
    setShowLogoutModal(false)
  }

  const handleViewProfile = (workerId) => {
    navigate(`/worker-profile-detail/${workerId}`)
  }

  // Filter workers based on search query and category
  const filteredWorkers = bookmarkedWorkers.filter((worker) => {
    const matchesSearch =
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === "all" || worker.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Get unique categories for the filter
  const categories = ["all", ...new Set(bookmarkedWorkers.map((worker) => worker.category))]

  // Render star ratings
  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="star-filled" />)
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStar key={i} className="star-half" />)
      } else {
        stars.push(<FaStar key={i} className="star-empty" />)
      }
    }

    return stars
  }

  return (
    <div className="profile-page">
      <UserNavbar activePage="user-profile" />

      <div className="profile-content">
        <h1 className="profile-title">BOOKMARKS</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="profile-container">
          {/* Sidebar - Matching the UserProfile sidebar */}
          <div className="profile-sidebar">
            <div
              className={`sidebar-item ${location.pathname === "/user-profile" ? "active" : ""}`}
              onClick={handleProfileClick}
            >
              <FaUser className="sidebar-icon" />
              <span>PROFILE</span>
            </div>
            <div className={`sidebar-item ${location.pathname === "/user-bookmarks" ? "active" : ""}`}>
              <FaBookmark className="sidebar-icon" />
              <span>BOOKMARKS</span>
            </div>
            <div
              className={`sidebar-item ${location.pathname === "/booking-history" ? "active" : ""}`}
              onClick={handleHistoryClick}
            >
              <FaHistory className="sidebar-icon" />
              <span>HISTORY</span>
            </div>
            <div className="sidebar-item logout" onClick={handleLogout}>
              <FaSignOutAlt className="sidebar-icon" />
              <span>LOG OUT</span>
            </div>
          </div>

          {/* Main Content - Bookmarked Workers */}
          <div className="profile-main">
            {/* Search and filter bar */}
            <div className="bookmarks-controls">
              <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="category-filter">
                <label>Filter by:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-select"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your bookmarks...</p>
              </div>
            ) : filteredWorkers.length > 0 ? (
              <div className="bookmarked-workers-grid">
                {filteredWorkers.map((worker) => (
                  <div key={worker.id} className="worker-card" onClick={() => handleViewProfile(worker.id)}>
                    <div className="worker-image-container">
                      <img src={worker.image || "/placeholder.svg"} alt={worker.name} className="worker-image" />
                      <div className="worker-category">{worker.category}</div>
                    </div>
                    <div className="worker-info">
                      <div className="worker-name-container">
                        <h3 className="worker-name">{worker.name}</h3>
                        <div className="worker-rating">
                          <span className="rating-value">{worker.rating}</span>
                          {renderStars(worker.rating)}
                        </div>
                      </div>

                      <div className="worker-location">
                        <FaMapMarkerAlt className="location-icon" />
                        <span>{worker.location}</span>
                      </div>

                      <div className="worker-details">
                        <div className="hourly-rate">₱{worker.hourlyRate}/hr</div>
                        <button className="view-profile-btn">View Profile</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FaBookmark className="empty-icon" />
                <h3>No bookmarks found</h3>
                {searchQuery || selectedCategory !== "all" ? (
                  <p>Try adjusting your search or filter criteria</p>
                ) : (
                  <p>You haven't bookmarked any workers yet. Browse workers and bookmark your favorites!</p>
                )}
                <button className="browse-workers-btn" onClick={() => navigate("/user-browse")}>
                  Browse Workers
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && <LogoutConfirmation onConfirm={confirmLogout} onCancel={cancelLogout} />}
      <Footer />
    </div>
  )
}

export default UserBookmarks