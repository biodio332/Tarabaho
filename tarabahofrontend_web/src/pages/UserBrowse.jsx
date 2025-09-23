"use client"

import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import UserNavbar from "../components/UserNavbar"
import "../styles/User-Browse.css"
import Footer from "../components/Footer"
import {
  Card,
  CardBody,
  Typography,
  Input,
  Button,
  Spinner,
  Avatar,
  Chip,
} from "@material-tailwind/react"

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

const Browse = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showResults, setShowResults] = useState(false)
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  // Function to construct Supabase image URL (reused from original)
  const getImageUrl = (avatar) => {
    const SUPABASE_STORAGE_URL = "https://your-supabase-project.supabase.co/storage/v1/object/public/images"
    if (!avatar) {
      return "https://via.placeholder.com/150?text=No+Image"
    }
    if (avatar.startsWith("http")) {
      return avatar
    }
    return `${SUPABASE_STORAGE_URL}${avatar.startsWith("/") ? "" : "/"}${avatar}`
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a search query.")
      return
    }

    setIsLoading(true)
    setError("")
    setSearchResults([])
    setShowResults(true)

    try {
      const response = await axios.get(`${backendUrl}/api/portfolio/search`, {
        params: { query: searchQuery },
        withCredentials: true,
      })
      const data = Array.isArray(response.data) ? response.data : []
      setSearchResults(data)
      if (data.length === 0) {
        setError("No matching portfolios found.")
      }
    } catch (err) {
      console.error("Failed to search portfolios:", err)
      setError(
        err.response?.status === 401
          ? "Please log in to search portfolios."
          : `Failed to search portfolios: ${err.message}`
      )
    } finally {
      setIsLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setError("")
    setShowResults(false)
  }

  return (
    <ErrorBoundary>
      <div className="browse-page">
        <UserNavbar activePage="user-browse" />

        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px] opacity-50"></div>
          
          <div className="relative z-10 container mx-auto px-6 py-20">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight mb-6 animate-fade-in-up">
                Discover Skilled Professionals
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed animate-fade-in-up animation-delay-300">
                Find the perfect Trabahador for your project with our intelligent search
              </p>
              <div className="animate-fade-in-up animation-delay-600">
                <Chip 
                  value="Over 100+ Active Professionals" 
                  color="blue" 
                  className="bg-white/10 text-white border-white/20 backdrop-blur-sm"
                />
              </div>
            </div>
          </div>

          {/* Animated wave at bottom */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1200 120" className="w-full h-24 fill-white animate-wave">
              <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z"></path>
            </svg>
          </div>
        </div>

        {/* Search Section */}
        <div className="relative bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="container mx-auto px-6 py-16">
            <div className="text-center mb-12">
              <Typography variant="h4" color="blue" className="font-light mb-4">
                Search Professionals
              </Typography>
              <Typography variant="lead" color="blue-gray" className="max-w-2xl mx-auto">
                Enter keywords like "web developer", "graphic design", "information technology", or specific skills
              </Typography>
            </div>

            {/* Enhanced Search Bar */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
                <div className="relative">
                  <div className="flex gap-3 items-center">
                    <div className="flex-grow relative">
                      <Input
                        type="text"
                        label="Search portfolios (e.g., 'information technology', 'web developer', 'photography')"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                        className="pr-12 text-lg"
                        disabled={isLoading}
                        error={!!error}
                      />
                      {error && (
                        <div className="absolute -bottom-6 left-0 text-red-500 text-sm">
                          {error}
                        </div>
                      )}
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    <Button 
                      onClick={handleSearch} 
                      color="blue" 
                      size="lg" 
                      disabled={isLoading || !searchQuery.trim()}
                      className="px-8 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isLoading ? (
                        <Spinner className="h-5 w-5" />
                      ) : (
                        "Search"
                      )}
                    </Button>
                  </div>
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                
                {/* Search suggestions */}
                {searchQuery && !isLoading && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-2">Try searching for:</p>
                    <div className="flex flex-wrap gap-2">
                      {['Web Development', 'Graphic Design', 'Photography', 'Content Writing', 'Digital Marketing', 'Information Technology'].map((suggestion) => (
                        <Chip
                          key={suggestion}
                          value={suggestion}
                          color="blue"
                          variant="outlined"
                          className="cursor-pointer hover:bg-blue-50 transition-colors"
                          onClick={() => {
                            setSearchQuery(suggestion)
                            handleSearch()
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results Section */}
            {showResults && (
              <div className="max-w-7xl mx-auto">
                {searchResults.length > 0 && (
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <Typography variant="h5" color="blue" className="font-light">
                        {searchResults.length} Professional{searchResults.length !== 1 ? 's' : ''} Found
                      </Typography>
                      <Typography variant="small" color="gray">
                        for "{searchQuery}"
                      </Typography>
                    </div>
                    <Button 
                      variant="text" 
                      color="blue"
                      onClick={clearSearch}
                      className="font-medium"
                    >
                      Clear Search
                    </Button>
                  </div>
                )}

                {isLoading ? (
                  <div className="flex flex-col items-center py-16">
                    <Spinner className="h-12 w-12 mb-4" />
                    <Typography color="blue-gray" className="text-lg">
                      Searching for "{searchQuery}"...
                    </Typography>
                  </div>
                ) : error ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <Typography variant="h6" color="amber" className="mb-2">
                      No Results Found
                    </Typography>
                    <Typography color="gray" className="max-w-md mx-auto">
                      {error}
                    </Typography>
                    <div className="mt-6">
                      <Button 
                        variant="text" 
                        color="blue"
                        onClick={clearSearch}
                        className="font-medium"
                      >
                        Try Another Search
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {searchResults.map((portfolio) => (
                      <Link
                        key={portfolio.graduateId}
                        to={`/portfolio/${portfolio.graduateId}?share=${portfolio.shareToken}`}
                        className="group"
                      >
                        <Card className="h-full overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-white/80 backdrop-blur-sm border-0">
                          {/* Image Card */}
                          <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
                            <Avatar
                              src={getImageUrl(portfolio.avatar)}
                              alt={portfolio.fullName}
                              size="xxl"
                              className="relative z-10 mx-auto mt-6 w-32 h-32 border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>

                          <CardBody className="pt-6 pb-8 text-center relative">
                            {/* Name and Title */}
                            <Typography variant="h5" className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                              {portfolio.fullName}
                            </Typography>
                            
                            {portfolio.professionalTitle && (
                              <div className="mb-4">
                                <Chip
                                  value={portfolio.professionalTitle}
                                  color="blue"
                                  className="bg-blue-50 text-blue-700 border-blue-200 font-medium"
                                />
                              </div>
                            )}

                            {/* Course Type Badge */}
                            {portfolio.primaryCourseType && (
                              <div className="mb-6">
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                  </svg>
                                  {portfolio.primaryCourseType}
                                </div>
                              </div>
                            )}

                            {/* Summary */}
                            {portfolio.professionalSummary && (
                              <Typography 
                                variant="small" 
                                color="gray" 
                                className="text-sm leading-relaxed line-clamp-3 mb-6 px-2"
                              >
                                {portfolio.professionalSummary}
                              </Typography>
                            )}

                            {/* View Portfolio Button */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <Button 
                                size="sm" 
                                color="blue" 
                                variant="gradient"
                                className="font-medium shadow-lg hover:shadow-xl"
                              >
                                View Portfolio
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </Button>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </CardBody>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}

                {/* No results empty state */}
                {searchResults.length === 0 && !isLoading && showResults && (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 11a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <Typography variant="h4" color="blue-gray" className="mb-4">
                      No Professionals Found
                    </Typography>
                    <Typography color="gray" className="max-w-lg mx-auto mb-8">
                      We couldn't find any professionals matching "{searchQuery}". Try different keywords or check your spelling.
                    </Typography>
                    <div className="space-x-4">
                      <Button 
                        color="blue" 
                        onClick={clearSearch}
                        className="font-medium"
                      >
                        New Search
                      </Button>
                      <Link to="/">
                        <Button variant="text" color="blue">
                          Browse Categories
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Popular Searches Section (when no results shown) */}
            {!showResults && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <Typography variant="h5" color="blue-gray" className="font-light mb-4">
                    Popular Searches
                  </Typography>
                  <Typography color="gray">
                    Start your search with these popular terms
                  </Typography>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    'Web Development', 'Graphic Design', 'Photography', 
                    'Content Writing', 'Digital Marketing', 'Social Media',
                    'Video Editing', 'SEO', 'Copywriting', 'Branding',
                    'UI/UX Design', 'Mobile App'
                  ].map((term) => (
                    <Button
                      key={term}
                      variant="outlined"
                      color="blue"
                      size="sm"
                      className="font-medium hover:bg-blue-50 transition-colors capitalize"
                      onClick={() => {
                        setSearchQuery(term)
                        handleSearch()
                      }}
                    >
                      {term}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes wave {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-10px);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animate-wave {
          animation: wave 4s ease-in-out infinite;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .grid-cols-1.md\\:grid-cols-2.xl\\:grid-cols-3 {
            grid-template-columns: repeat(1, minmax(0, 1fr));
          }
        }
      `}</style>
    </ErrorBoundary>
  )
}

export default Browse