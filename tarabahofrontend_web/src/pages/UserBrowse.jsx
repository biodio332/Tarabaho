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
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 via-indigo-700 to-purple-800 text-white overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[length:30px_30px] opacity-60"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
          
          {/* Floating orbs for depth */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-float-delayed"></div>
          
          <div className="relative z-10 container mx-auto px-6 py-24 md:py-32">
            <div className="text-center max-w-5xl mx-auto">
              <div className="inline-block mb-6 animate-fade-in-up">
                <Chip 
                  value="✨ Trusted Platform" 
                  className="bg-white/20 text-white border-white/30 backdrop-blur-md px-4 py-2 text-sm font-medium"
                />
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight mb-6 animate-fade-in-up animation-delay-200 leading-tight">
                Discover Skilled
                <span className="block bg-gradient-to-r from-blue-200 via-white to-purple-200 bg-clip-text text-transparent">
                  Professionals
                </span>
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-blue-50 mb-10 leading-relaxed max-w-3xl mx-auto animate-fade-in-up animation-delay-400 font-light">
                Find the perfect Trabahador for your project with our intelligent search platform
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in-up animation-delay-600">
                <Chip 
                  value="100+ Active Professionals" 
                  className="bg-white/15 text-white border-white/25 backdrop-blur-md px-5 py-2.5 font-semibold"
                />
                <Chip 
                  value="Verified Portfolios" 
                  className="bg-white/15 text-white border-white/25 backdrop-blur-md px-5 py-2.5 font-semibold"
                />
                <Chip 
                  value="Instant Search" 
                  className="bg-white/15 text-white border-white/25 backdrop-blur-md px-5 py-2.5 font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Enhanced animated wave at bottom */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-32 fill-white">
              <path d="M0,60 C300,100 600,20 900,60 C1050,80 1125,50 1200,60 L1200,120 L0,120 Z" className="animate-wave"></path>
            </svg>
          </div>
        </div>

        {/* Search Section */}
        <div className="relative bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>
          
          <div className="relative container mx-auto px-6 py-20">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                <Typography variant="h3" color="blue-gray" className="font-bold text-3xl md:text-4xl">
                  Search Professionals
                </Typography>
                <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
              </div>
              <Typography variant="lead" color="gray" className="max-w-2xl mx-auto text-lg font-normal">
                Enter keywords like "web developer", "graphic design", "information technology", or specific skills to find the perfect match
              </Typography>
            </div>

            {/* Enhanced Search Bar */}
            <div className="max-w-5xl mx-auto mb-16">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100/50 hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
                {/* Decorative gradient overlay */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                    <div className="flex-grow relative">
                      <div className="relative">
                        <Input
                          type="text"
                          label="Search portfolios (e.g., 'information technology', 'web developer', 'photography')"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                          className={`text-lg bg-gray-50/50 focus:bg-white transition-colors ${searchQuery.trim() ? 'pr-20' : 'pr-14'}`}
                          disabled={isLoading}
                          error={!!error}
                          containerProps={{ className: "min-w-0" }}
                        />
                        {/* Search icon - only show when no text */}
                        {!searchQuery.trim() && (
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        )}
                        {/* Clear button - only show when there's text */}
                        {searchQuery.trim() && (
                          <button
                            onClick={clearSearch}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-r-lg transition-all duration-200 z-10"
                            aria-label="Clear search"
                            type="button"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                      {error && (
                        <div className="absolute -bottom-6 left-0 flex items-center gap-2 text-red-500 text-sm font-medium mt-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {error}
                        </div>
                      )}
                    </div>
                    <Button 
                      onClick={handleSearch} 
                      color="blue" 
                      size="lg" 
                      disabled={isLoading || !searchQuery.trim()}
                      className="px-10 py-3 font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50 whitespace-nowrap"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Spinner className="h-5 w-5" />
                          <span>Searching...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>Search</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      )}
                    </Button>
                  </div>
                  
                  {/* Search suggestions */}
                  {searchQuery && !isLoading && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Quick suggestions:
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        {['Web Development', 'Graphic Design', 'Photography', 'Content Writing', 'Digital Marketing', 'Information Technology'].map((suggestion) => (
                          <Chip
                            key={suggestion}
                            value={suggestion}
                            color="blue"
                            variant="outlined"
                            className="cursor-pointer hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 font-medium"
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
            </div>

            {/* Results Section */}
            {showResults && (
              <div className="max-w-7xl mx-auto">
                {searchResults.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                        <Typography variant="h4" color="blue-gray" className="font-bold text-2xl">
                          {searchResults.length} Professional{searchResults.length !== 1 ? 's' : ''} Found
                        </Typography>
                      </div>
                      <Typography variant="small" color="gray" className="ml-4 text-base font-medium">
                        Results for <span className="text-blue-600 font-semibold">"{searchQuery}"</span>
                      </Typography>
                    </div>
                    <Button 
                      variant="outlined" 
                      color="blue"
                      onClick={clearSearch}
                      className="font-semibold px-6 py-2.5 border-2 hover:bg-blue-50 transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear Search
                    </Button>
                  </div>
                )}

                {isLoading ? (
                  <div className="flex flex-col items-center py-24">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
                      <Spinner className="h-16 w-16 relative z-10 text-blue-500" />
                    </div>
                    <Typography color="blue-gray" className="text-xl font-semibold mb-2">
                      Searching for professionals...
                    </Typography>
                    <Typography color="gray" className="text-base">
                      Finding matches for <span className="text-blue-600 font-medium">"{searchQuery}"</span>
                    </Typography>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                    {searchResults.map((portfolio, index) => (
                      <Link
                        key={portfolio.graduateId}
                        to={`/portfolio/${portfolio.graduateId}?share=${portfolio.shareToken}`}
                        className="group"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <Card className="h-full overflow-hidden hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 bg-white border border-gray-200/50 rounded-2xl relative animate-fade-in-up">
                          {/* Premium gradient overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-indigo-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-indigo-500/5 transition-all duration-500 rounded-2xl pointer-events-none"></div>
                          
                          {/* Image Card */}
                          <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 h-48 flex items-center justify-center">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)]"></div>
                            <Avatar
                              src={getImageUrl(portfolio.avatar)}
                              alt={portfolio.fullName}
                              size="xxl"
                              className="relative z-10 w-36 h-36 border-4 border-white shadow-2xl group-hover:scale-110 group-hover:shadow-3xl transition-all duration-500"
                            />
                            {/* Shine effect on hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          </div>

                          <CardBody className="pt-8 pb-10 text-center relative px-6">
                            {/* Name and Title */}
                            <Typography variant="h5" className="font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300 text-xl">
                              {portfolio.fullName}
                            </Typography>
                            
                            {portfolio.professionalTitle && (
                              <div className="mb-5">
                                <Chip
                                  value={portfolio.professionalTitle}
                                  color="blue"
                                  className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-2 border-blue-200 font-semibold px-4 py-1.5 text-sm shadow-sm"
                                />
                              </div>
                            )}

                            {/* Course Type Badge */}
                            {portfolio.primaryCourseType && (
                              <div className="mb-6">
                                <div className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-2 border-emerald-200 shadow-sm">
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
                                className="text-sm leading-relaxed line-clamp-3 mb-8 px-2 text-gray-600 font-normal"
                              >
                                {portfolio.professionalSummary}
                              </Typography>
                            )}

                            {/* View Portfolio Button */}
                            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-full px-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                              <Button 
                                size="md" 
                                color="blue" 
                                variant="gradient"
                                className="font-semibold shadow-xl hover:shadow-2xl w-full py-3 text-sm"
                                fullWidth
                              >
                                View Portfolio
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </Button>
                            </div>

                            {/* Decorative corner accent */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-bl-full transition-all duration-500 pointer-events-none"></div>
                            
                            {/* Bottom border accent */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          </CardBody>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}

                {/* No results empty state */}
                {searchResults.length === 0 && !isLoading && showResults && (
                  <div className="text-center py-24 px-6">
                    <div className="relative inline-block mb-8">
                      <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                      <div className="relative w-32 h-32 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto shadow-xl border-4 border-white">
                        <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    <Typography variant="h3" color="blue-gray" className="mb-4 font-bold text-3xl">
                      No Professionals Found
                    </Typography>
                    <Typography color="gray" className="max-w-xl mx-auto mb-10 text-lg leading-relaxed">
                      We couldn't find any professionals matching <span className="text-blue-600 font-semibold">"{searchQuery}"</span>. Try different keywords, check your spelling, or browse our popular searches below.
                    </Typography>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      <Button 
                        color="blue" 
                        onClick={clearSearch}
                        className="font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                        size="lg"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        New Search
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Popular Searches Section (when no results shown) */}
            {!showResults && (
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <div className="inline-flex items-center gap-2 mb-4">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                    <Typography variant="h4" color="blue-gray" className="font-bold text-2xl md:text-3xl">
                      Popular Searches
                    </Typography>
                    <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                  </div>
                  <Typography color="gray" className="text-base font-normal">
                    Start your search with these popular terms or explore trending categories
                  </Typography>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {[
                    'Web Development', 'Graphic Design', 'Photography', 
                    'Content Writing', 'Digital Marketing', 'Social Media',
                    'Video Editing', 'SEO', 'Copywriting', 'Branding',
                    'UI/UX Design', 'Mobile App'
                  ].map((term, index) => (
                    <Button
                      key={term}
                      variant="outlined"
                      color="blue"
                      size="md"
                      className="font-semibold hover:bg-blue-50 hover:border-blue-300 hover:shadow-md hover:scale-105 transition-all duration-200 capitalize py-3 border-2 rounded-xl"
                      onClick={() => {
                        setSearchQuery(term)
                        handleSearch()
                      }}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {term}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>

     <style>{`
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
          transform: translateX(0) scaleY(1);
        }
        25% {
          transform: translateX(-5px) scaleY(1.05);
        }
        50% {
          transform: translateX(-10px) scaleY(1);
        }
        75% {
          transform: translateX(-5px) scaleY(1.05);
        }
      }

      @keyframes float {
        0%, 100% {
          transform: translateY(0px) translateX(0px);
        }
        33% {
          transform: translateY(-20px) translateX(10px);
        }
        66% {
          transform: translateY(10px) translateX(-10px);
        }
      }

      @keyframes float-delayed {
        0%, 100% {
          transform: translateY(0px) translateX(0px);
        }
        33% {
          transform: translateY(20px) translateX(-15px);
        }
        66% {
          transform: translateY(-15px) translateX(15px);
        }
      }

      .animate-fade-in-up {
        animation: fade-in-up 0.8s ease-out forwards;
        opacity: 0;
      }

      .animate-wave {
        animation: wave 6s ease-in-out infinite;
      }

      .animate-float {
        animation: float 8s ease-in-out infinite;
      }

      .animate-float-delayed {
        animation: float-delayed 10s ease-in-out infinite;
      }

      .animation-delay-200 {
        animation-delay: 0.2s;
      }

      .animation-delay-300 {
        animation-delay: 0.3s;
      }

      .animation-delay-400 {
        animation-delay: 0.4s;
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

      /* Smooth scroll behavior */
      html {
        scroll-behavior: smooth;
      }

      /* Enhanced card hover effects */
      .group:hover .group-hover\\:shadow-3xl {
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      }

      /* Custom scrollbar for better aesthetics */
      ::-webkit-scrollbar {
        width: 10px;
      }

      ::-webkit-scrollbar-track {
        background: #f1f1f1;
      }

      ::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, #3b82f6, #6366f1);
        border-radius: 5px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, #2563eb, #4f46e5);
      }

      @media (max-width: 768px) {
        .grid-cols-1\\.md\\:grid-cols-2\\.xl\\:grid-cols-3 {
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }
      }
    `}</style>
    </ErrorBoundary>
  )
}

export default Browse