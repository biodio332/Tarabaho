"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import UserNavbar from "../components/UserNavbar"
import "../styles/User-browse-category.css"
import { FaStar, FaRegStar } from "react-icons/fa"
import Footer from "../components/Footer"


const UserBrowseCategory = () => {
  const { categoryName } = useParams() // e.g., "cleaning"
  const [workers, setWorkers] = useState([])
  const [category, setCategory] = useState(null)
  const [error, setError] = useState("")
  const BACKEND_URL = "http://localhost:8080"

  // Fallback banner images
  const categoryBanners = {
    cleaning: cleaningBanner,
    errands: errandsBanner,
    tutoring: tutoringBanner,
    babysitting: babysittingBanner,
    gardening: gardeningBanner,
  }

  useEffect(() => {
    const fetchCategoryAndWorkers = async () => {
      try {
        // Capitalize categoryName for backend
        const formattedCategoryName =
          categoryName.charAt(0).toUpperCase() + categoryName.slice(1)

        // Fetch category details
        const categoryResponse = await axios.get(`${BACKEND_URL}/api/categories`, {
          withCredentials: true,
        })
        const foundCategory = categoryResponse.data.find(
          (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
        )
        setCategory(foundCategory)

        // Fetch workers
        const workersResponse = await axios.get(
          `${BACKEND_URL}/api/worker/category/${formattedCategoryName}/workers`,
          { withCredentials: true }
        )
        setWorkers(workersResponse.data)
      } catch (err) {
        console.error(`Failed to fetch data for ${categoryName}:`, err)
        setError("Failed to load workers. Please try again.")
      }
    }
    fetchCategoryAndWorkers()
  }, [categoryName])

  // Placeholder star rating function
  const renderStars = (rating = 5) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <FaStar key={i} className="star-filled" />
        ) : (
          <FaRegStar key={i} className="star-empty" />
        )
      )
    }
    return stars
  }

  // Capitalize category name for display
  const displayCategoryName = categoryName
    ? categoryName.charAt(0).toUpperCase() + categoryName.slice(1)
    : "Category"

  return (
    <div className={`browse-category-page ${categoryName.toLowerCase()}`}>
      <UserNavbar activePage="user-browse" />

      {/* Banner Section */}
      <div className="service-banner">
        <img
          src={
            category?.bannerUrl
              ? `${BACKEND_URL}${category.bannerUrl}`
              : categoryBanners[categoryName.toLowerCase()] || "/placeholder.svg"
          }
          alt={`${displayCategoryName} Service`}
          className="banner-img"
        />
        <div className="banner-overlay">
          <h1 className="banner-title">{displayCategoryName.toUpperCase()}</h1>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="sort-container">
          <span className="sort-label">Sort by</span>
          <select className="sort-dropdown">
            <option value="rating">Rating</option>
            <option value="price">Price</option>
            <option value="experience">Experience</option>
          </select>
        </div>
        <div className="search-container">
          <input type="text" className="search-input" placeholder="Search" />
        </div>
      </div>

      {/* Service Providers Grid */}
      <div className="service-providers-grid">
        {error && <div className="error-message">{error}</div>}
        {workers.length > 0 ? (
          workers.map((worker) => (
            <div key={worker.id} className="provider-card">
              <div className="provider-image">
                <img
                  src={
                    worker.profilePicture
                      ? `${BACKEND_URL}${worker.profilePicture}`
                      : "/placeholder.svg"
                  }
                  alt={`${worker.firstName} ${worker.lastName}`}
                />
              </div>
              <div className="provider-details">
                <div className="provider-rating">{renderStars()}</div>
                <p className="provider-description">
                  {worker.biography || "No biography available"}
                </p>
                <p className="provider-rate">₱63.00/hour</p> {/* Placeholder rate */}
                <button className="view-button">View</button>
              </div>
            </div>
          ))
        ) : (
          <p>No workers found for {displayCategoryName}.</p>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default UserBrowseCategory