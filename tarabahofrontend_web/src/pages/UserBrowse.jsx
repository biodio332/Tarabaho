"use client"

import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import UserNavbar from "../components/UserNavbar"
import "../styles/User-Browse.css"
import Footer from "../components/Footer"

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-message">
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message || "An unexpected error occurred."}</p>
        </div>
      )
    }
    return this.props.children
  }
}

// Function to construct Supabase image URL
const getImageUrl = (iconUrl) => {
  const SUPABASE_STORAGE_URL = "https://your-supabase-project.supabase.co/storage/v1/object/public/images"
  if (!iconUrl) {
    return "https://via.placeholder.com/150?text=No+Image"
  }
  if (iconUrl.startsWith("http")) {
    return iconUrl
  }
  return `${SUPABASE_STORAGE_URL}${iconUrl.startsWith("/") ? "" : "/"}${iconUrl}`
}

const Browse = () => {
  const [categories, setCategories] = useState([])
  const [error, setError] = useState("")
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  // Taglines for categories
  const categoryTaglines = {
    Cleaning: "Keep your space spotless",
    Errands: "Get your tasks done",
    Tutoring: "Learn with ease",
    Babysitting: "Care for your kids",
    Gardening: "Grow your green space",
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/categories`, {
          withCredentials: true,
        })
        // Normalize response data
        const data = Array.isArray(response.data) ? response.data : []
        console.log("Fetched categories:", data) // Debugging log
        setCategories(data)
        if (data.length === 0) {
          setError("No categories available.")
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err)
        setError(
          err.response?.status === 401
            ? "Please log in to view categories."
            : `Failed to load categories: ${err.message}`
        )
      }
    }
    fetchCategories()
  }, [backendUrl])

  // Normalize category name for consistency
  const normalizeCategoryName = (name) => {
    if (!name) return ""
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  }

  return (
    <ErrorBoundary>
      <div className="browse-page">
        <UserNavbar activePage="user-browse" />

        <div className="hero-section">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1 className="hero-title">
              Find on-demand help for your daily tasks anytime, anywhere with Tarabaho!
            </h1>
          </div>
        </div>

        <div className="browse-content">
          <button className="look-for-trabahador-button" aria-label="Look for Trabahador">
            Look for Trabahador
          </button>

          <p className="browse-description">
            Browse Trabahador profiles and find the perfect match for your task.
          </p>

          {error && <div className="error-message">{error}</div>}

          <div className="service-categories">
            {categories.length > 0 ? (
              categories.map((category) => {
                // Defensive checks
                if (!category || !category.name) {
                  console.warn("Invalid category:", category)
                  return null
                }
                const normalizedName = normalizeCategoryName(category.name)
                const imageSrc = getImageUrl(category.iconUrl)

                console.log(`Category: ${normalizedName}, Image Src: ${imageSrc}`) // Debugging log

                return (
                  <Link
                    key={category.id || category.name}
                    to={`/user-browse/${category.name.toLowerCase()}`}
                    className="service-category"
                    aria-label={`Browse ${category.name} Services`}
                  >
                    <div className={`service-icon ${category.name.toLowerCase()}-icon`}>
                      <img
                        src={imageSrc}
                        alt={category.name}
                        className="service-img"
                        onError={(e) => {
                          console.error(`Failed to load image for ${category.name}: ${imageSrc}`)
                          e.target.src = "https://via.placeholder.com/150?text=No+Image"
                        }}
                        onLoad={() => console.log(`Loaded image for ${category.name}: ${imageSrc}`)}
                      />
                    </div>
                    <div className="service-name">{category.name}</div>
                    <p className="service-tagline">
                      {category.tagline || categoryTaglines[normalizedName] || "Explore this service"}
                    </p>
                  </Link>
                )
              }).filter(Boolean)
            ) : (
              <p>No categories available.</p>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </ErrorBoundary>
  )
}

export default Browse