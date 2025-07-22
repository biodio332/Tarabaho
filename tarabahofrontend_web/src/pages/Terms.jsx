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
            <li>
              <a href="#introduction">Introduction</a>
            </li>
            <li>
              <a href="#eligibility">Eligibility</a>
            </li>
            <li>
              <a href="#account">Account Responsibilities</a>
            </li>
            <li>
              <a href="#services">Services Provided</a>
            </li>
            <li>
              <a href="#payment">Payment Terms</a>
            </li>
            <li>
              <a href="#ratings">Ratings and Reviews</a>
            </li>
            <li>
              <a href="#prohibited">Prohibited Activities</a>
            </li>
            <li>
              <a href="#safety">Safety Guidelines</a>
            </li>
            <li>
              <a href="#suspension">Account Suspension</a>
            </li>
            <li>
              <a href="#liability">Limitation of Liability</a>
            </li>
            <li>
              <a href="#changes">Changes to Terms</a>
            </li>
            <li>
              <a href="#contact">Contact Information</a>
            </li>
          </ul>
        </div>

        <section className="legal-section">
          <span id="introduction" className="section-anchor"></span>
          <h2>1. Introduction</h2>
          <p>Welcome to Tarabaho!</p>
          <p>
            Tarabaho is a platform that connects TESDA-accredited individuals, out-of-school youth, and skilled workers
            with employers seeking services for various tasks and projects.
          </p>
          <p>
            By using our platform (web or mobile app), you agree to comply with these Terms and Conditions. Please read
            them carefully.
          </p>
        </section>

        <section className="legal-section">
          <span id="eligibility" className="section-anchor"></span>
          <h2>2. Eligibility</h2>
          <ul>
            <li>Minimum age to join as a Trabahador: 15 years old</li>
            <li>Minimum age to post or hire as an Employer: 18 years old</li>
            <li>Priority is given to TESDA-accredited individuals and out-of-school youth.</li>
            <li>Users must provide accurate and truthful information upon registration.</li>
          </ul>
        </section>

        <section className="legal-section">
          <span id="account" className="section-anchor"></span>
          <h2>3. Account Responsibilities</h2>
          <ul>
            <li>You are responsible for maintaining the security of your account.</li>
            <li>Any activity under your account is your responsibility.</li>
            <li>Report any unauthorized account activity to Tarabaho Support immediately.</li>
          </ul>
        </section>

        <section className="legal-section">
          <span id="services" className="section-anchor"></span>
          <h2>4. Services Provided</h2>
          <ul>
            <li>
              <strong>Employers:</strong> Can post jobs, search and hire Trabahadors, chat securely, and process
              payments through the platform.
            </li>
            <li>
              <strong>Trabahadors:</strong> Can create profiles, browse job opportunities, accept jobs, and get rated
              after job completion.
            </li>
            <li>
              Tarabaho acts only as a facilitator and is not responsible for the actual work or external payment
              arrangements.
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <span id="payment" className="section-anchor"></span>
          <h2>5. Payment Terms</h2>
          <ul>
            <li>Payments are processed through approved gateways (e.g., GCash, PayMongo).</li>
            <li>Tarabaho may charge a small service fee on transactions (disclosed during booking).</li>
            <li>Trabahadors must have a verified e-wallet or bank account for payouts.</li>
          </ul>
        </section>

        <section className="legal-section">
          <span id="ratings" className="section-anchor"></span>
          <h2>6. Ratings and Reviews</h2>
          <ul>
            <li>Employers can rate workers after a job is completed.</li>
            <li>Ratings must be fair, honest, and respectful.</li>
            <li>Abusive, fake, or malicious reviews are prohibited and may be removed by Tarabaho.</li>
          </ul>
        </section>

        <section className="legal-section">
          <span id="prohibited" className="section-anchor"></span>
          <h2>7. Prohibited Activities</h2>
          <ul>
            <li>Falsifying identities, skills, or certifications.</li>
            <li>Conducting payments outside of the Tarabaho platform.</li>
            <li>Harassment, discrimination, or abuse of any user.</li>
            <li>Uploading fraudulent certifications or false information.</li>
          </ul>
        </section>

        <section className="legal-section">
          <span id="safety" className="section-anchor"></span>
          <h2>8. Safety Guidelines</h2>
          <ul>
            <li>Always communicate within the platform.</li>
            <li>For minors (ages 13–17), inform a guardian before accepting jobs.</li>
            <li>Prefer safe, public meeting locations whenever possible.</li>
          </ul>
        </section>

        <section className="legal-section">
          <span id="suspension" className="section-anchor"></span>
          <h2>9. Account Suspension and Termination</h2>
          <ul>
            <li>Tarabaho reserves the right to suspend or permanently ban accounts violating these Terms.</li>
            <li>Serious violations (e.g., fraud, harassment) will result in immediate termination without refund.</li>
          </ul>
        </section>

        <section className="legal-section">
          <span id="liability" className="section-anchor"></span>
          <h2>10. Limitation of Liability</h2>
          <ul>
            <li>Tarabaho is not responsible for any loss, injury, or dispute that arises outside of the platform.</li>
            <li>
              We only facilitate connections — we do not guarantee job outcomes or payment security outside the
              platform.
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <span id="changes" className="section-anchor"></span>
          <h2>11. Changes to Terms</h2>
          <ul>
            <li>Tarabaho may update these Terms and Conditions as needed.</li>
            <li>Major changes will be notified through email or in-app alerts.</li>
            <li>Continued use after changes means you accept the updated Terms.</li>
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
            <li>Be honest.</li>
            <li>Stay professional.</li>
            <li>Use the platform properly.</li>
            <li>Keep all transactions safe and inside the platform.</li>
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

export default Terms
