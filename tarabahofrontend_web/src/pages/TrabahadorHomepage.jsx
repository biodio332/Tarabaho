"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import TrabahadorNavbar from "../components/TrabahadorNavbar"
import Footer from "../components/Footer"
import "../styles/TrabahadorHomepage.css"

const TrabahadorHomepage = () => {
  const [trabahadorName, setTrabahadorName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"

  useEffect(() => {
    const fetchTrabahadorProfile = async () => {
      try {
        // Get username from localStorage
        const username = localStorage.getItem("username")

        if (!username) {
          setError("User not logged in")
          setIsLoading(false)
          return
        }

        // Fetch worker data
        const response = await axios.get(`${BACKEND_URL}/api/worker/all`, {
          withCredentials: true,
        })

        // Find the worker with matching username
        const workerData = response.data.find((worker) => worker.username === username)

        if (workerData) {
          // Set the first name from the worker data
          setTrabahadorName(workerData.firstName || "")
        } else {
          setError("Worker profile not found")
        }
      } catch (err) {
        console.error("Failed to fetch worker profile:", err)
        setError("Failed to load profile data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrabahadorProfile()
  }, [])

  return (
    <div className="trabahador-homepage">
      {/* Navigation Bar */}
      <TrabahadorNavbar activePage="homepage" />

      {/* Main Content */}
      <div className="trabahador-main-content">
        <div className="trabahador-content-overlay">
          <div className="trabahador-welcome-container">
            <div className="trabahador-logo-container">
              <div className="trabahador-logo">
                T A R A B A H
                <svg
                  className="trabahador-logo-icon"
                  width="60"
                  height="60"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="12" r="8" stroke="#0078FF" strokeWidth="2" fill="none" />
                  <path d="M18 18L22 22" stroke="#0078FF" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="trabahador-tagline">T A R A ! T R A B A H O</div>
            </div>

            {isLoading ? (
              <div className="trabahador-loading">Loading...</div>
            ) : error ? (
              <div className="trabahador-error">{error}</div>
            ) : (
              <h1 className="trabahador-welcome-heading">
                WELCOME {trabahadorName ? trabahadorName.toUpperCase() : "TRABAHADOR"}!
              </h1>
            )}

            <div className="trabahador-actions">
              <Link to="/trabahador-history" className="trabahador-action-button">
                VIEW HISTORY
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default TrabahadorHomepage