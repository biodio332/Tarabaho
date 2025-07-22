"use client"

import { useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import UserNavbar from "../components/UserNavbar"
import AdminNavbar from "../components/AdminNavbar"
import TrabahadorNavbar from "../components/TrabahadorNavbar"
import Footer from "../components/Footer"
import "../styles/legal-pages.css"

const Privacy = () => {
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
        <h1 className="legal-title">Privacy Policy</h1>

        <div className="table-of-contents">
          <h3>Quick Navigation</h3>
          <ul className="toc-list">
            <li>
              <a href="#introduction">Introduction</a>
            </li>
            <li>
              <a href="#information">Information We Collect</a>
            </li>
            <li>
              <a href="#use">How We Use Your Information</a>
            </li>
            <li>
              <a href="#protection">How We Protect Your Information</a>
            </li>
            <li>
              <a href="#sharing">Sharing of Information</a>
            </li>
            <li>
              <a href="#rights">User Rights</a>
            </li>
            <li>
              <a href="#retention">Data Retention</a>
            </li>
            <li>
              <a href="#cookies">Cookies Policy</a>
            </li>
            <li>
              <a href="#changes">Changes to Privacy Policy</a>
            </li>
            <li>
              <a href="#contact">Contact Information</a>
            </li>
          </ul>
        </div>

        <section className="legal-section">
          <span id="introduction" className="section-anchor"></span>
          <h2>1. Introduction</h2>
          <p>At Tarabaho, your privacy is very important to us.</p>
          <p>
            This Privacy Policy explains how we collect, use, and protect your personal information when you use our
            platform (website and mobile app).
          </p>
          <p>By using Tarabaho, you agree to the practices described in this Privacy Policy.</p>
        </section>

        <section className="legal-section">
          <span id="information" className="section-anchor"></span>
          <h2>2. Information We Collect</h2>
          <p>We may collect the following types of information:</p>

          <h3>Personal Information:</h3>
          <p>Name, email address, phone number, birthday, address, TESDA certifications, skills, etc.</p>

          <h3>Job-Related Information:</h3>
          <p>Job postings, job applications, work experience, reviews, ratings.</p>

          <h3>Payment Information:</h3>
          <p>E-wallet details (e.g., GCash number) or bank account information for payments and payouts.</p>

          <h3>Location Information:</h3>
          <p>Real-time location (for GPS tracking, job matching nearby).</p>

          <h3>Technical Information:</h3>
          <p>Device information, browser type, IP address, and cookies for system optimization and analytics.</p>
        </section>

        <section className="legal-section">
          <span id="use" className="section-anchor"></span>
          <h2>3. How We Use Your Information</h2>
          <p>We use your information for the following purposes:</p>
          <ul>
            <li>To create and manage your account.</li>
            <li>To match workers and employers based on skills and location.</li>
            <li>To process payments securely.</li>
            <li>To send notifications about jobs, applications, or platform updates.</li>
            <li>To improve and personalize your experience on Tarabaho.</li>
            <li>To comply with legal obligations (e.g., fraud prevention).</li>
          </ul>
        </section>

        <section className="legal-section">
          <span id="protection" className="section-anchor"></span>
          <h2>4. How We Protect Your Information</h2>
          <ul>
            <li>All communications are secured through HTTPS encryption.</li>
            <li>Sensitive data (e.g., passwords, payment information) are encrypted and securely stored.</li>
            <li>We limit access to personal information to authorized employees only.</li>
            <li>Regular security audits and system updates help keep your data safe.</li>
          </ul>
        </section>

        <section className="legal-section">
          <span id="sharing" className="section-anchor"></span>
          <h2>5. Sharing of Information</h2>
          <p>Tarabaho does not sell or rent your personal information to third parties.</p>
          <p>We only share information:</p>
          <ul>
            <li>With employers or workers when matching jobs.</li>
            <li>With third-party service providers (e.g., payment processors) necessary to operate Tarabaho.</li>
            <li>When required by law or to protect our platform and users.</li>
          </ul>
        </section>

        <section className="legal-section">
          <span id="rights" className="section-anchor"></span>
          <h2>6. User Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the information we have about you.</li>
            <li>Correct inaccurate information.</li>
            <li>Request deletion of your data.</li>
            <li>Withdraw your consent at any time (subject to legal or contractual obligations).</li>
          </ul>
          <p>You can manage your information through your Account Settings or contact our support team.</p>
        </section>

        <section className="legal-section">
          <span id="retention" className="section-anchor"></span>
          <h2>7. Data Retention</h2>
          <p>We retain your personal information only for as long as necessary:</p>
          <ul>
            <li>While your account is active.</li>
            <li>As required to comply with legal obligations, resolve disputes, and enforce agreements.</li>
          </ul>
        </section>

        <section className="legal-section">
          <span id="cookies" className="section-anchor"></span>
          <h2>8. Cookies Policy</h2>
          <ul>
            <li>We use cookies to improve website functionality and user experience.</li>
            <li>You can manage or disable cookies through your browser settings.</li>
          </ul>
        </section>

        <section className="legal-section">
          <span id="changes" className="section-anchor"></span>
          <h2>9. Changes to this Privacy Policy</h2>
          <ul>
            <li>We may update this Privacy Policy from time to time.</li>
            <li>Significant changes will be communicated via email or app notifications.</li>
            <li>Continued use of Tarabaho means you accept the updated Privacy Policy.</li>
          </ul>
        </section>

        <section className="legal-section">
          <span id="contact" className="section-anchor"></span>
          <h2>10. Contact Information</h2>
          <p>If you have questions, concerns, or requests regarding your data:</p>
          <ul>
            <li>📧 Email: privacy@tarabaho.com</li>
            <li>📞 Phone: +63 (2) 8123-4567</li>
          </ul>
        </section>

        <section className="quick-reminders">
          <h2>Quick Reminders</h2>
          <ul>
            <li>Your data is safe with us.</li>
            <li>We never sell your information.</li>
            <li>You control your own data.</li>
          </ul>
        </section>

        <div className="last-updated">
          <p>Last Updated: April 27, 2023</p>
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

export default Privacy
