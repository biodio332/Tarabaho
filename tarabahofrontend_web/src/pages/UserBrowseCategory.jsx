"use client"

import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import UserNavbar from "../components/UserNavbar"
import Footer from "../components/Footer"
import styles from "../styles/user-browse-category.module.css"
import { FaStar, FaRegStar, FaSearch, FaFilter, FaMapMarkerAlt } from "react-icons/fa"

const getImageUrl = (profilePicture) => {
  const SUPABASE_STORAGE_URL = "https://your-supabase-project.supabase.co/storage/v1/object/public"
  if (!profilePicture) {
    return "/placeholder.svg?height=200&width=200"
  }
  if (profilePicture.startsWith("http")) {
    return profilePicture
  }
  return `${SUPABASE_STORAGE_URL}${profilePicture.startsWith("/") ? "" : "/"}${profilePicture}`
}

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message || "An unexpected error occurred."}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const UserBrowseCategory = () => {
  const { categoryName } = useParams()
  const navigate = useNavigate()
  const [workers, setWorkers] = useState([])
  const [filteredWorkers, setFilteredWorkers] = useState([])
  const [category, setCategory] = useState(null)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("rating")
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })
  const [ratingFilter, setRatingFilter] = useState(0)
  const [favorites, setFavorites] = useState([])
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  useEffect(() => {
    const fetchCategoryAndWorkers = async () => {
      setIsLoading(true)
      try {
        const categoryResponse = await axios.get(`${backendUrl}/api/categories`, {
          withCredentials: true,
        })
        const data = Array.isArray(categoryResponse.data) ? categoryResponse.data : []
        const foundCategory = data.find(
          (cat) => cat && cat.name && cat.name.toLowerCase() === categoryName.toLowerCase(),
        )
        if (!foundCategory) {
          setError("Category not found.")
          setIsLoading(false)
          return
        }
        setCategory(foundCategory)

        const formattedCategoryName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1)
        const workersResponse = await axios.get(
          `${backendUrl}/api/worker/category/${formattedCategoryName}/available`,
          {
            withCredentials: true,
          },
        )
        setWorkers(workersResponse.data)
        setFilteredWorkers(workersResponse.data)
        setError("")
      } catch (err) {
        console.error(`Failed to fetch data for ${categoryName}:`, err)
        setError(
          err.response?.status === 401
            ? "Your session has expired. Please log in again."
            : err.response?.data?.replace("⚠️ ", "") || "Failed to load workers. Please try again.",
        )
        if (err.response?.status === 401) {
          navigate("/login")
        }
      } finally {
        setIsLoading(false)
      }
    }

    const savedFavorites = localStorage.getItem("favoriteWorkers")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }

    fetchCategoryAndWorkers()
  }, [categoryName, navigate, backendUrl])

  useEffect(() => {
    let updatedWorkers = [...workers]
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      updatedWorkers = updatedWorkers.filter((worker) => {
        const fullName = `${worker.firstName || ""} ${worker.lastName || ""}`.toLowerCase()
        const bio = (worker.biography || "").toLowerCase()
        return fullName.includes(query) || bio.includes(query)
      })
    }
    updatedWorkers = updatedWorkers.filter(
      (worker) => worker.hourly >= priceRange.min && worker.hourly <= priceRange.max,
    )
    if (ratingFilter > 0) {
      updatedWorkers = updatedWorkers.filter((worker) => (worker.stars || 0) >= ratingFilter)
    }
    updatedWorkers.sort((a, b) => {
      if (sortBy === "rating") {
        return (b.stars || 0) - (a.stars || 0)
      } else if (sortBy === "price_low") {
        return (a.hourly || 0) - (b.hourly || 0)
      } else if (sortBy === "price_high") {
        return (b.hourly || 0) - (a.hourly || 0)
      } else if (sortBy === "name") {
        const nameA = `${a.firstName || ""} ${a.lastName || ""}`.toLowerCase()
        const nameB = `${b.firstName || ""} ${b.lastName || ""}`.toLowerCase()
        return nameA.localeCompare(nameB)
      }
      return 0
    })
    setFilteredWorkers(updatedWorkers)
  }, [searchQuery, sortBy, workers, priceRange, ratingFilter])

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const handlePriceChange = (e, type) => {
    const value = Number.parseInt(e.target.value)
    setPriceRange((prev) => ({ ...prev, [type]: value }))
  }

  const handleRatingFilterChange = (rating) => {
    setRatingFilter(rating === ratingFilter ? 0 : rating)
  }

  const clearFilters = () => {
    setPriceRange({ min: 0, max: 1000 })
    setRatingFilter(0)
    setSearchQuery("")
  }

  const toggleFavorite = (workerId) => {
    let newFavorites
    if (favorites.includes(workerId)) {
      newFavorites = favorites.filter((id) => id !== workerId)
    } else {
      newFavorites = [...favorites, workerId]
    }
    setFavorites(newFavorites)
    localStorage.setItem("favoriteWorkers", JSON.stringify(newFavorites))
  }

  const renderStars = (rating = 0) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <FaStar key={i} className={styles.starFilled} />
        ) : (
          <FaRegStar key={i} className={styles.starEmpty} />
        ),
      )
    }
    return stars
  }

  const handleViewWorker = (workerId) => {
    navigate(`/worker-profile-detail/${workerId}`, {
      state: { selectedCategory: categoryName.charAt(0).toUpperCase() + categoryName.slice(1) },
    })
  }

  const displayCategoryName = categoryName ? categoryName.charAt(0).toUpperCase() + categoryName.slice(1) : "Category"

  return (
    <ErrorBoundary>
      <div className={styles.browseCategoryPage}>
        <UserNavbar activePage="user-browse" />

        <div className={styles.categoryHeader}>
          <div className={styles.categoryHeaderContent}>
            <h1>{displayCategoryName} Workers</h1>
            <p>Find skilled {displayCategoryName.toLowerCase()} professionals for your needs</p>
          </div>
        </div>

        <div className={styles.browseControls}>
          <div className={styles.searchFilterContainer}>
            <div className={styles.searchContainer}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchQuery}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.filterSortContainer}>
              <div className={styles.sortContainer}>
                <label htmlFor="sort-select">Sort by:</label>
                <select id="sort-select" value={sortBy} onChange={handleSortChange} className={styles.sortSelect}>
                  <option value="rating">Highest Rating</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
              </div>
              <button className={styles.filterButton} onClick={toggleFilters}>
                <FaFilter /> Filters
              </button>
            </div>
          </div>

          {showFilters && (
            <div className={styles.filtersPanel}>
              <div className={styles.filterSection}>
                <h3>Price Range (₱)</h3>
                <div className={styles.priceInputs}>
                  <input
                    type="number"
                    min="0"
                    max={priceRange.max}
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange(e, "min")}
                    className={styles.priceInput}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    min={priceRange.min}
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange(e, "max")}
                    className={styles.priceInput}
                  />
                </div>
              </div>

              <div className={styles.filterSection}>
                <h3>Minimum Rating</h3>
                <div className={styles.ratingFilter}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => handleRatingFilterChange(star)}
                      className={`${styles.filterStar} ${ratingFilter >= star ? styles.active : ""}`}
                    >
                      <FaStar />
                    </span>
                  ))}
                  {ratingFilter > 0 && (
                    <button className={styles.clearRating} onClick={() => handleRatingFilterChange(0)}>
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <button className={styles.clearFiltersButton} onClick={clearFilters}>
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        <div className={styles.workersContainer}>
          {isLoading ? (
            <div className={styles.loadingSpinner}>
              <div className={styles.spinner}></div>
              <p>Loading workers...</p>
            </div>
          ) : error ? (
            <div className={styles.errorMessage}>{error}</div>
          ) : filteredWorkers.length === 0 ? (
            <div className={styles.noResults}>
              <h3>No workers found</h3>
              <p>Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className={styles.workersGrid}>
              {filteredWorkers.map((worker) => {
                const displayName =
                  worker.firstName && worker.lastName
                    ? `${worker.firstName} ${worker.lastName}`
                    : worker.username || "Unknown Worker"
                return (
                  <div key={worker.id} className={styles.workerCard}>
                    <div className={styles.workerCardContent} onClick={() => handleViewWorker(worker.id)}>
                      <div className={styles.workerImageContainer}>
                        <img
                          src={getImageUrl(worker.profilePicture) || "/placeholder.svg"}
                          alt={displayName}
                          className={styles.workerImage}
                        />
                      </div>
                      <div className={styles.workerDetails}>
                        <h3 className={styles.workerName}>{displayName}</h3>
                        <div className={styles.workerRating}>{renderStars(worker.stars || 0)}</div>
                        <p className={styles.workerBio}>
                          {worker.biography
                            ? worker.biography.length > 100
                              ? `${worker.biography.substring(0, 100)}...`
                              : worker.biography
                            : "No description available"}
                        </p>
                        {worker.address && (
                          <div className={styles.workerLocation}>
                            <FaMapMarkerAlt className={styles.locationIcon} />
                            <span>{worker.address}</span>
                          </div>
                        )}
                      </div>
                      <div className={styles.workerFooter}>
                        <div className={styles.workerPrice}>₱{worker.hourly?.toFixed(2) || "0.00"}/hour</div>
                        <button className={styles.viewProfileButton}>View Profile</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </ErrorBoundary>
  )
}

export default UserBrowseCategory