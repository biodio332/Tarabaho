"use client"

import { useState, useEffect } from "react"
import UserNavbar from "../components/UserNavbar"
import Footer from "../components/Footer"
import "../styles/About-us.css"

// Import team images
import aboutUsBanner from "../assets/images/about-us-banner.png"
import vicAndre from "../assets/images/vicAndre.png"
import polDaveQ from "../assets/images/polDaveQ.png"
import martinJohn from "../assets/images/martinJohn.png"
import DerickWayne from "../assets/images/DerickWayne.png"
import AngeloC from "../assets/images/AngeloC.png"

const UserAboutUs = () => {
  const [showBackToTop, setShowBackToTop] = useState(false)

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

  return (
    <div className="about-us-page">
      {/* Animated background elements */}
      <div className="about-us-background-elements">
        <div className="about-us-bg-orb about-us-bg-orb-1"></div>
        <div className="about-us-bg-orb about-us-bg-orb-2"></div>
      </div>

      {/* Hero Section */}
      <div className="about-us-hero">
        <div className="about-us-hero-content">
          <div className="about-us-hero-badge">
            <span>Our Story</span>
          </div>
          <h1 className="about-us-hero-title">
            About
            <span className="about-us-hero-title-gradient"> Us</span>
          </h1>
          <p className="about-us-hero-subtitle">
            Empowering TESDA graduates through innovation and opportunity
          </p>
        </div>
      </div>

      <div className="about-us-content">
        <div className="about-us-banner-container">
          <div className="about-us-banner-wrapper">
          <img
            src={aboutUsBanner || "/placeholder.svg?height=300&width=500"}
            alt="Tarabah Team"
            className="about-us-banner"
            loading="lazy"
          />
            <div className="about-us-banner-overlay"></div>
          </div>
        </div>

        <div className="about-us-description">
          <div className="about-us-description-card">
            <div className="about-us-description-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="about-us-description-intro">
              We are the passionate minds behind <strong className="about-us-brand-name">Tarabaho</strong>—a team of developers, innovators, and problem-solvers
            with one mission: to empower TESDA graduates by giving their skills the spotlight they deserve.
          </p>
          </div>

          <div className="about-us-description-text">
          <p>
            What started as a simple idea has grown into a vision—to build a trusted digital space where talent is verified,
            visible, and valued. Instead of focusing on traditional job postings, Tarabaho highlights what truly matters: the
            skills, certifications, and accomplishments of TESDA-accredited professionals.
          </p>

          <p>
            As developers, we understand how challenging it can be for skilled workers to stand out and for employers to find
              trustworthy talent. That's why we created Tarabaho as a portfolio-driven platform that bridges this gap—making it
            easier for clients to discover, evaluate, and connect with verified professionals.
          </p>

          <p>
            Every feature we design, from portfolio creation to TESDA verification, is crafted to build trust, credibility, and
              opportunity. We're not just showcasing profiles—we're redefining how skills are recognized and valued in the digital
            age.
          </p>
          </div>

          <div className="about-us-tagline">
            <div className="about-us-tagline-content">
              <div className="about-us-tagline-line"></div>
              <div className="about-us-tagline-text">
                <p className="about-us-tagline-item">
                  <span className="about-us-tagline-icon">💻</span>
                  Built by developers.
                </p>
                <p className="about-us-tagline-item">
                  <span className="about-us-tagline-icon">✨</span>
                  Inspired by opportunity.
                </p>
                <p className="about-us-tagline-item">
                  <span className="about-us-tagline-icon">❤️</span>
                  Made for you.
                </p>
              </div>
              <div className="about-us-tagline-line"></div>
            </div>
          </div>
        </div>

        <div className="meet-devs-section">
          <div className="meet-devs-header">
            <div className="meet-devs-line"></div>
            <h2 className="meet-devs-title">Meet the Devs Behind Tarabaho!</h2>
            <div className="meet-devs-line"></div>
          </div>
          <p className="meet-devs-subtitle">The passionate team building the future of professional portfolios</p>
        </div>

        <div className="dev-team-grid">
          <div className="dev-profile">
            <div className="dev-image-container">
              <div className="dev-image-wrapper">
              <img
                src={vicAndre || "/placeholder.svg?height=200&width=200"}
                alt="Vic Andre D. Bacusmo"
                className="dev-image"
                loading="lazy"
              />
                <div className="dev-image-overlay"></div>
              </div>
              <div className="dev-image-border"></div>
            </div>
            <div className="dev-info">
            <h3 className="dev-name">Vic Andre D.</h3>
            <p className="dev-surname">Bacusmo</p>
            </div>
          </div>

          <div className="dev-profile">
            <div className="dev-image-container">
              <div className="dev-image-wrapper">
              <img
                src={polDaveQ || "/placeholder.svg?height=200&width=200"}
                alt="Paul Dave Q. Binoya"
                className="dev-image"
                loading="lazy"
              />
                <div className="dev-image-overlay"></div>
              </div>
              <div className="dev-image-border"></div>
            </div>
            <div className="dev-info">
            <h3 className="dev-name">Paul Dave Q.</h3>
            <p className="dev-surname">Binoya</p>
            </div>
          </div>

          <div className="dev-profile">
            <div className="dev-image-container">
              <div className="dev-image-wrapper">
              <img
                src={martinJohn || "/placeholder.svg?height=200&width=200"}
                alt="Martin John V. Tabasa"
                className="dev-image"
                loading="lazy"
              />
                <div className="dev-image-overlay"></div>
              </div>
              <div className="dev-image-border"></div>
            </div>
            <div className="dev-info">
            <h3 className="dev-name">Martin John V.</h3>
            <p className="dev-surname">Tabasa</p>
            </div>
          </div>

          <div className="dev-profile">
            <div className="dev-image-container">
              <div className="dev-image-wrapper">
              <img
                src={DerickWayne || "/placeholder.svg?height=200&width=200"}
                alt="Derick Wayne A. Batucan"
                className="dev-image"
                loading="lazy"
              />
                <div className="dev-image-overlay"></div>
              </div>
              <div className="dev-image-border"></div>
            </div>
            <div className="dev-info">
            <h3 className="dev-name">Derick Wayne A.</h3>
            <p className="dev-surname">Batucan</p>
            </div>
          </div>

          <div className="dev-profile">
            <div className="dev-image-container">
              <div className="dev-image-wrapper">
              <img
                src={AngeloC || "/placeholder.svg?height=200&width=200"}
                alt="Angelo C. Quieta"
                className="dev-image"
                loading="lazy"
              />
                <div className="dev-image-overlay"></div>
              </div>
              <div className="dev-image-border"></div>
            </div>
            <div className="dev-info">
            <h3 className="dev-name">Angelo C.</h3>
            <p className="dev-surname">Quieta</p>
            </div>
          </div>
        </div>
      </div>

      {/* Back to top button */}
      <button
        className={`back-to-top ${showBackToTop ? "visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 15l-6-6-6 6" />
        </svg>
        <div className="back-to-top-ripple"></div>
      </button>

      <style>{`
        /* Global Typography Enhancements */
        .about-us-page {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        .about-us-background-elements {
          position: fixed;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }

        .about-us-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
        }

        .about-us-bg-orb-1 {
          top: 20%;
          left: 10%;
          width: 384px;
          height: 384px;
          background: rgba(59, 130, 246, 0.2);
          animation: float 8s ease-in-out infinite;
        }

        .about-us-bg-orb-2 {
          bottom: 20%;
          right: 10%;
          width: 384px;
          height: 384px;
          background: rgba(139, 92, 246, 0.2);
          animation: float-delayed 10s ease-in-out infinite;
        }

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

        @keyframes wave {
          0%, 100% {
            transform: translateX(0) scaleY(1);
          }
          50% {
            transform: translateX(-10px) scaleY(1.05);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .about-us-hero {
          position: relative;
          padding: 7rem 2rem 5rem;
          text-align: center;
          overflow: hidden;
          z-index: 1;
        }

        .about-us-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 30px 30px;
          opacity: 0.3;
        }

        .about-us-hero::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.3), transparent);
        }

        .about-us-hero-content {
          position: relative;
          z-index: 10;
          max-width: 800px;
          margin: 0 auto;
          animation: fade-in-up 0.8s ease-out;
        }

        .about-us-hero-badge {
          display: inline-block;
          padding: 0.75rem 2rem;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50px;
          margin-bottom: 2rem;
          font-size: 0.875rem;
          font-weight: 600;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          color: white;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .about-us-hero-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.2);
        }

        .about-us-hero-title {
          font-size: 6rem;
          font-weight: 900;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          color: white;
          margin-bottom: 1rem;
          line-height: 1.1;
          letter-spacing: -0.02em;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .about-us-hero-title-gradient {
          background: linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .about-us-hero-subtitle {
          font-size: 1.25rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          color: rgba(255, 255, 255, 0.95);
          font-weight: 400;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
          letter-spacing: 0.01em;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
        }


        .about-us-banner-container {
          width: 100%;
          max-width: 100%;
          display: flex;
          justify-content: center;
          margin-bottom: 3rem;
          padding: 0;
        }

        .about-us-banner-wrapper {
          position: relative;
          border-radius: 2rem;
          overflow: hidden;
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid rgba(255, 255, 255, 0.1);
          width: 100%;
          max-width: 100%;
        }

        .about-us-banner-wrapper::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 1;
          pointer-events: none;
        }

        .about-us-banner-wrapper:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 35px 90px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2);
        }

        .about-us-banner-wrapper:hover::before {
          opacity: 1;
        }

        .about-us-banner {
          width: 100%;
          max-width: 100%;
          height: auto;
          display: block;
          border-radius: 2rem;
          position: relative;
          z-index: 0;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          object-fit: cover;
        }

        .about-us-banner-wrapper:hover .about-us-banner {
          transform: scale(1.05);
        }

        .about-us-banner-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.1) 100%);
          pointer-events: none;
        }

        .about-us-description-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 2px solid rgba(255, 255, 255, 0.15);
          border-radius: 1.5rem;
          padding: 2.5rem;
          margin-bottom: 2.5rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .about-us-description-card:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }

        .about-us-description-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
        }

        .about-us-description-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          color: white;
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .about-us-description-icon::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .about-us-description-card:hover .about-us-description-icon {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 12px 30px rgba(59, 130, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .about-us-description-card:hover .about-us-description-icon::before {
          opacity: 1;
        }

        .about-us-description-icon svg {
          width: 24px;
          height: 24px;
        }

        .about-us-description-intro {
          font-size: 1.3rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          line-height: 1.85;
          color: white;
          font-weight: 500;
          letter-spacing: 0.01em;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .about-us-brand-name {
          color: #60a5fa;
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .about-us-description-text {
          margin-bottom: 3rem;
          padding: 0 0.5rem;
        }

        .about-us-description-text p {
          position: relative;
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          line-height: 1.9;
          color: rgba(255, 255, 255, 0.95);
          font-weight: 400;
          letter-spacing: 0.01em;
        }

        .about-us-description-text p::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.5rem;
          width: 4px;
          height: calc(100% - 1rem);
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 2px;
          opacity: 0.5;
          transition: opacity 0.3s ease;
        }

        .about-us-description-text p:hover::before {
          opacity: 0.8;
        }

        .about-us-tagline {
          margin: 4rem 0;
          padding: 3rem 2rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .about-us-tagline-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
          justify-content: center;
          flex-direction: column;
        }

        .about-us-tagline-line {
          flex: 1;
          min-width: 60px;
          height: 2px;
          background: linear-gradient(to right, transparent, #3b82f6, transparent);
        }

        .about-us-tagline-text {
          display: flex;
          flex-direction: row;
          gap: 2rem;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
        }

        .about-us-tagline-item {
          font-size: 1.35rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          font-weight: 700;
          color: white;
          display: flex;
          align-items: center;
          gap: 1rem;
          letter-spacing: 0.02em;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
          animation: fade-in-up 0.8s ease-out;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          transition: all 0.3s ease;
          cursor: default;
        }

        .about-us-tagline-item:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .about-us-tagline-item:nth-child(2) {
          animation-delay: 0.2s;
        }

        .about-us-tagline-item:nth-child(3) {
          animation-delay: 0.4s;
        }

        .about-us-tagline-icon {
          font-size: 1.75rem;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
          transition: transform 0.3s ease;
          display: inline-block;
        }

        .about-us-tagline-item:hover .about-us-tagline-icon {
          transform: scale(1.2) rotate(10deg);
        }

        .meet-devs-section {
          text-align: center;
          margin: 5rem 0 4rem;
          padding: 3rem 2rem;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border-radius: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .meet-devs-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          margin-bottom: 1rem;
        }

        .meet-devs-line {
          flex: 1;
          max-width: 100px;
          height: 2px;
          background: linear-gradient(to right, transparent, #3b82f6, transparent);
        }

        .meet-devs-title {
          font-size: 2.75rem;
          font-weight: 900;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          color: white;
          text-transform: none;
          letter-spacing: -0.02em;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          line-height: 1.2;
        }

        .meet-devs-subtitle {
          font-size: 1.2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          color: rgba(255, 255, 255, 0.85);
          font-weight: 400;
          margin-top: 0.5rem;
          letter-spacing: 0.01em;
          line-height: 1.6;
        }

        .dev-team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 2.5rem;
          justify-items: center;
          margin-bottom: 4rem;
        }

        .dev-profile {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: transform 0.3s ease;
          width: 100%;
          max-width: 220px;
          animation: fade-in-up 0.8s ease-out;
        }

        .dev-profile:nth-child(1) { animation-delay: 0.1s; }
        .dev-profile:nth-child(2) { animation-delay: 0.2s; }
        .dev-profile:nth-child(3) { animation-delay: 0.3s; }
        .dev-profile:nth-child(4) { animation-delay: 0.4s; }
        .dev-profile:nth-child(5) { animation-delay: 0.5s; }

        .dev-profile:hover {
          transform: translateY(-10px);
        }

        .dev-image-container {
          position: relative;
          width: 180px;
          height: 180px;
          margin-bottom: 1.5rem;
        }

        .dev-image-wrapper {
          width: 100%;
          height: 100%;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          transition: all 0.4s ease;
        }

        .dev-profile:hover .dev-image-wrapper {
          box-shadow: 0 16px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .dev-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .dev-profile:hover .dev-image {
          transform: scale(1.1);
        }

        .dev-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 0%, rgba(59, 130, 246, 0.3) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .dev-profile:hover .dev-image-overlay {
          opacity: 1;
        }

        .dev-image-border {
          position: absolute;
          inset: -4px;
          border-radius: 24px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .dev-profile:hover .dev-image-border {
          opacity: 1;
          animation: pulse 2s ease-in-out infinite;
        }

        .dev-info {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(5px);
          width: 100%;
          transition: all 0.3s ease;
        }

        .dev-profile:hover .dev-info {
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .dev-name {
          font-size: 1.3rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          font-weight: 700;
          margin-bottom: 0.25rem;
          color: white;
          letter-spacing: 0.01em;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
        }

        .dev-surname {
          font-size: 1.2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          font-weight: 600;
          color: #60a5fa;
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.01em;
        }

        .back-to-top {
          position: fixed;
          bottom: 30px;
          right: 1px;
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.5), 0 0 0 3px rgba(59, 130, 246, 0.2), 0 0 20px rgba(59, 130, 246, 0.3);
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          z-index: 100;
          border: 2px solid rgba(255, 255, 255, 0.3);
          position: relative;
          overflow: hidden;
        }

        .back-to-top.visible {
          opacity: 1;
          visibility: visible;
        }

        .back-to-top:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 15px 40px rgba(59, 130, 246, 0.7), 0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.5);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .back-to-top-ripple {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: scale(0);
          transition: transform 0.6s ease;
        }

        .back-to-top:active .back-to-top-ripple {
          transform: scale(1.5);
          opacity: 0;
        }

        @media (max-width: 768px) {
          .about-us-hero-title {
            font-size: 4rem;
            letter-spacing: -0.01em;
          }

          .about-us-hero-subtitle {
            font-size: 1.1rem;
            line-height: 1.65;
          }

          .about-us-description-intro {
            font-size: 1.2rem;
            line-height: 1.8;
          }

          .about-us-description-text p {
            font-size: 1.05rem;
            line-height: 1.85;
          }

          .about-us-tagline-text {
            flex-direction: column;
            gap: 1rem;
          }

          .about-us-tagline-item {
            font-size: 1.2rem;
          }

          .meet-devs-title {
            font-size: 2.25rem;
            letter-spacing: -0.01em;
          }

          .meet-devs-subtitle {
            font-size: 1.1rem;
          }

          .dev-team-grid {
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 2rem;
          }

          .dev-image-container {
            width: 150px;
            height: 150px;
          }
        }

        @media (max-width: 576px) {
          .about-us-hero {
            padding: 4rem 1rem 3rem;
          }

          .about-us-hero-title {
            font-size: 3rem;
            letter-spacing: -0.01em;
          }

          .about-us-hero-subtitle {
            font-size: 1rem;
            line-height: 1.6;
          }

          .about-us-description-intro {
            font-size: 1.15rem;
            line-height: 1.75;
          }

          .about-us-description-text p {
            font-size: 1rem;
            line-height: 1.8;
          }

          .about-us-tagline-text {
            flex-direction: column;
            gap: 0.75rem;
          }

          .about-us-tagline-item {
            font-size: 1.15rem;
          }

          .meet-devs-title {
            font-size: 1.5rem;
          }

          .dev-team-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }

          .dev-image-container {
            width: 130px;
            height: 130px;
          }

          .back-to-top {
            width: 56px;
            height: 56px;
            bottom: 20px;
            right: 30px;
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5), 0 0 0 2px rgba(59, 130, 246, 0.2), 0 0 15px rgba(59, 130, 246, 0.3);
          }
        }
      `}</style>
    </div>
  )
}

export default UserAboutUs
