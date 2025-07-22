"use client"

import { useNavigate } from "react-router-dom"
import backgroundImage from "../assets/images/homepage.png"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import "../styles/Homepage.css"

const Homepage = () => {
  const navigate = useNavigate()

  const handleExploreClick = () => {
    navigate("/signin")
  }

  return (
    <div className="homepage-container">
      {/* NAVIGATION BAR */}
      <Navbar activePage="home" />

      {/* MAIN CONTENT */}
      <div className="main-content" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="content-overlay">
          <div className="content-top">
            <div className="main-logo">
              T A R A B A H
              <svg className="main-logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" stroke="#0078FF" strokeWidth="2.5" fill="none" />
                <path d="M18 18L22 22" stroke="#0078FF" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="12" cy="12" r="4" fill="rgba(0, 120, 255, 0.1)" />
              </svg>
            </div>
            <div className="tagline">T A R A ! T R A B A H O</div>
            <div className="description-container">
              <div className="description">
                <p>
                  Tarabaho: Tara! Trabaho is a platform designed to connect individuals seeking help with day-to-day
                  tasks and those looking for job opportunities or side hustles. Whether it's running errands, cleaning,
                  tutoring, or other tasks, Tarabaho makes it easy to hire or be hired for specific jobs or durations.
                </p>
                <p>
                  The platform empowers Filipinos, especially those seeking flexible work, by providing a gateway to
                  earn, learn, and grow—all while fostering a sense of community and collaboration.
                </p>
                <p>
                  For teenagers aged 15–18, Tarabaho places a special emphasis on safety, balance, and responsibility.
                  Tasks suitable for their age group, such as tutoring or light errands, are available with work hour
                  limitations to prioritize education.
                </p>
                <p>
                  With built-in tools for safe communication, task tracking, and secure payments, Tarabaho ensures a
                  user-friendly and secure environment. Join today and explore a platform where opportunities meet
                  flexibility and growth!
                </p>
              </div>
            </div>
            <div className="content-bottom">
              <button className="explore-button" onClick={handleExploreClick}>
                EXPLORE
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Homepage
