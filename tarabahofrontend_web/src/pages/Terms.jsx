"use client"

import { useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import UserNavbar from "../components/UserNavbar"
import AdminNavbar from "../components/AdminNavbar"
import TrabahadorNavbar from "../components/TrabahadorNavbar"
import Footer from "../components/Footer"
import "../styles/legal-pages.css"

const Terms = () => {
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [userType, setUserType] = useState(null)

  // Check user login status on component mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const storedUserType = localStorage.getItem("userType")

    if (isLoggedIn && storedUserType) {
      setUserType(storedUserType)
    }
  }, [])

  // Show back to top button when scrolling down
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true)
      } else {
        setShowBackToTop(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // Render the appropriate navbar based on user type
  const renderNavbar = () => {
    switch (userType) {
      case "user":
        return <UserNavbar />
      case "admin":
        return <AdminNavbar />
      case "trabahador":
        return <TrabahadorNavbar activePage="" />
      default:
        return <Navbar />
    }
  }

  return (
    <div className="legal-page">
      {renderNavbar()}

      <div className="legal-content">
        <h1 className="legal-title">Terms and Conditions</h1>

        <div className="table-of-contents">
          <h3>Quick Navigation</h3>
          <ul className="toc-list">
            <li><a href="#introduction">Introduction</a></li>
            <li><a href="#eligibility">Eligibility</a></li>
            <li><a href="#account">Account Responsibilities</a></li>
            <li><a href="#services">Services Provided</a></li>
            <li><a href="#verification">TESDA Verification</a></li>
            <li><a href="#portfolio">Portfolio Usage</a></li>
            <li><a href="#prohibited">Prohibited Activities</a></li>
            <li><a href="#privacy">Data Privacy</a></li>
            <li><a href="#suspension">Account Suspension</a></li>
            <li><a href="#liability">Limitation of Liability</a></li>
            <li><a href="#changes">Changes to Terms</a></li>
            <li><a href="#contact">Contact Information</a></li>
          </ul>
        </div>

        <section className="legal-section">
          <span id="introduction" className="section-anchor"></span>
          <h2>1. Introduction</h2>
          <p>Welcome to Tarabaho!</p>
          <p>
            Tarabaho is a platform that helps <strong>TESDA-accredited graduates</strong> and skilled professionals
            showcase their verified digital portfolios, making it easier for clients and employers to discover their talents.
          </p>
          <p>
            By using our platform, you agree to these Terms and Conditions. Please read them carefully.
          </p>
        </section>

        <section className="legal-section">
          <span id="eligibility" className="section-anchor"></span>
          <h2>2. Eligibility</h2>
          <ul>
            <li>Users must be at least 15 years old to create an account.</li>
            <li>TESDA graduates must upload valid certificates to create verified portfolios.</li>
            <li>Employers/clients must be at least 18 years old to browse and connect with graduates.</li>
            <li>All users must provide accurate and truthful information upon registration.</li>
          </ul>
        </section>

        <section className="legal-section">
          <span id="account" className="section-anchor"></span>
          <h2>3. Account Responsibilities</h2>
          <ul>
            <li>You are responsible for keeping your account credentials secure.</li>
            <li>Any activity under your account is your responsibility.</li>
            <li>Report unauthorized use to Tarabaho Support immediately.</li>
          </ul>
        </section>

        <section className="legal-section">
          <span id="services" className="section-anchor"></span>
          <h2>4. Services Provided</h2>
          <ul>
            <li><strong>Graduates:</strong> Can create and manage digital portfolios, upload TESDA certificates, and share their profiles.</li>
            <li><strong>Employers/Clients:</strong> Can browse and view verified graduate portfolios for potential collaboration or hiring.</li>
            <li>Tarabaho acts only as a <em>portfolio platform</em> and does not handle payments, contracts, or direct hiring.</li>
          </ul>
        </section>

        <section className="legal-section">
          <span id="verification" className="section-anchor"></span>
          <h2>5. TESDA Verification</h2>
          <ul>
            <li>TESDA graduates must upload valid certificates for verification.</li>
            <li>Any falsified or fraudulent documents will lead to account suspension or termination.</li>
          </ul>
        </section>

        <section className="legal-section">
          <span id="portfolio" className="section-anchor"></span>
          <h2>6. Portfolio Usage</h2>
          <ul>
            <li>Graduates are responsible for keeping their portfolio information accurate and updated.</li>
            <li>Employers may view and evaluate portfolios but must contact graduates outside the platform for hiring arrangements.</li>
            <li>Tarabaho is not liable for any agreements, payments, or disputes that occur outside the platform.</li>
          </ul>
        </section>

        <section className="legal-section">
          <span id="prohibited" className="section-anchor"></span>
          <h2>7. Prohibited Activities</h2>
          <ul>
            <li>Uploading false or fraudulent certifications.</li>
            <li>Impersonating another person or providing misleading information.</li>
            <li>Using the platform for harassment, discrimination, or unlawful activity.</li>
          </ul>
        </section>

        <section className="legal-section">
          <span id="privacy" className="section-anchor"></span>
          <h2>8. Data Privacy</h2>
          <p>
            Tarabaho follows the <strong>Data Privacy Act of 2012</strong>. Personal data, certificates, and portfolio
            details are stored securely and only used for platform purposes. We will never sell or misuse your information.
          </p>
        </section>

        <section className="legal-section">
          <span id="suspension" className="section-anchor"></span>
          <h2>9. Account Suspension and Termination</h2>
          <ul>
            <li>Tarabaho reserves the right to suspend or terminate accounts that violate these Terms.</li>
            <li>Fraudulent certificates or repeated policy violations will result in permanent removal.</li>
          </ul>
        </section>

        <section className="legal-section">
          <span id="liability" className="section-anchor"></span>
          <h2>10. Limitation of Liability</h2>
          <ul>
            <li>Tarabaho is not responsible for outcomes, payments, or disputes outside the platform.</li>
            <li>We only provide a secure space for showcasing verified portfolios.</li>
          </ul>
        </section>

        <section className="legal-section">
          <span id="changes" className="section-anchor"></span>
          <h2>11. Changes to Terms</h2>
          <ul>
            <li>We may update these Terms and Conditions as necessary.</li>
            <li>Significant changes will be communicated via in-app notifications or email.</li>
            <li>Continued use of Tarabaho means you accept the updated Terms.</li>
          </ul>
        </section>

        <section className="legal-section">
          <span id="contact" className="section-anchor"></span>
          <h2>12. Contact Information</h2>
          <p>For questions, concerns, or support:</p>
          <ul>
            <li>📧 Email: support@tarabaho.com</li>
            <li>📞 Phone: +63 (2) 8123-4567</li>
          </ul>
        </section>

        <section className="quick-reminders">
          <h2>Quick Reminders</h2>
          <ul>
            <li>Be truthful when uploading certifications.</li>
            <li>Keep portfolios professional and updated.</li>
            <li>Tarabaho does not handle contracts or payments.</li>
            <li>Respect other users and follow community standards.</li>
          </ul>
        </section>

        <div className="last-updated">
          <p>Last Updated: September 22, 2025</p>
        </div>
      </div>

      {/* Back to top button */}
      <div className={`back-to-top ${showBackToTop ? "visible" : ""}`} onClick={scrollToTop}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </div>

      <Footer />
    </div>
  )
}

export default Terms
