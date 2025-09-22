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
                  <strong>Tarabaho: Tara! Trabaho</strong> is a platform designed to help{" "}
                  <strong>employers and clients</strong> easily discover skilled TESDA-accredited
                  professionals through verified digital portfolios.
                </p>
                <p>
                  Instead of sifting through unverified listings, users can browse professional
                  profiles that showcase certifications, skills, and past projects — all in one
                  trusted space.
                </p>
                <p>
                  The platform makes it simple to:
                  <ul>
                    <li>Search by skills or category to find the right graduate for your needs.</li>
                    <li>
                      View complete portfolios with certifications, work samples, and testimonials.
                    </li>
                  </ul>
                </p>
                <p>
                  With Tarabaho, users gain confidence knowing they are engaging with verified, skilled
                  professionals, making it easier to match the right person to the right opportunity.
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
