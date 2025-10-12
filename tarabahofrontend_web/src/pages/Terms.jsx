"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Footer from "../components/Footer"

const Terms = () => {
  const [showBackToTop, setShowBackToTop] = useState(false)
  const navigate = useNavigate()

  // Handle scroll for back-to-top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
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

  const handleBackClick = () => {
    navigate(-1)
  }

  return (
    <div className="w-screen flex flex-col min-h-screen bg-gradient-to-br from-[#f5f7fb] to-[#e8f0ff] overflow-x-hidden">
      {/* Back Button */}
        <div className="p-5">
          <button
            onClick={handleBackClick}
            className="px-5 py-2.5 text-black bg-white/10 border border-white/30 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
          >
            ← Back to Home
          </button>
        </div>


      <div className="flex-1 py-12 px-6 mx-auto max-w-[900px] w-full bg-white shadow-[0_10px_30px_rgba(0,120,255,0.1)] rounded-2xl relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-2 before:bg-gradient-to-r before:from-[#0078ff] before:to-[#00a1ff] max-md:py-8 max-md:px-4">
        <h1 className="text-5xl font-extrabold text-[#0078ff] mb-10 pb-6 border-b-2 border-[#e8f0ff] text-center relative tracking-tight after:content-[''] after:absolute after:bottom-[-2px] after:left-1/2 after:-translate-x-1/2 after:w-[100px] after:h-1 after:bg-gradient-to-r after:from-[#0078ff] after:to-[#00a1ff] after:rounded max-md:text-4xl max-sm:text-3xl">
          Terms and Conditions
        </h1>

        <div className="bg-[#f9fbff] rounded-xl p-6 mb-10 border border-[#e8f0ff] relative max-md:p-4">
          <h3 className="text-lg text-[#0078ff] mb-4 pb-2 border-b border-[#e8f0ff] text-center">
            Quick Navigation
          </h3>
          <ul className="list-none p-0 columns-2 gap-8 max-md:columns-1">
            <li className="mb-2 break-inside-avoid">
              <a href="#introduction" className="text-[#0066cc] no-underline transition-all duration-200 flex items-center hover:text-[#0078ff] hover:translate-x-[5px] before:content-['→'] before:mr-2 before:text-sm before:text-[#0078ff]">
                Introduction
              </a>
            </li>
            <li className="mb-2 break-inside-avoid">
              <a href="#eligibility" className="text-[#0066cc] no-underline transition-all duration-200 flex items-center hover:text-[#0078ff] hover:translate-x-[5px] before:content-['→'] before:mr-2 before:text-sm before:text-[#0078ff]">
                Eligibility
              </a>
            </li>
            <li className="mb-2 break-inside-avoid">
              <a href="#account" className="text-[#0066cc] no-underline transition-all duration-200 flex items-center hover:text-[#0078ff] hover:translate-x-[5px] before:content-['→'] before:mr-2 before:text-sm before:text-[#0078ff]">
                Account Responsibilities
              </a>
            </li>
            <li className="mb-2 break-inside-avoid">
              <a href="#services" className="text-[#0066cc] no-underline transition-all duration-200 flex items-center hover:text-[#0078ff] hover:translate-x-[5px] before:content-['→'] before:mr-2 before:text-sm before:text-[#0078ff]">
                Services Provided
              </a>
            </li>
            <li className="mb-2 break-inside-avoid">
              <a href="#verification" className="text-[#0066cc] no-underline transition-all duration-200 flex items-center hover:text-[#0078ff] hover:translate-x-[5px] before:content-['→'] before:mr-2 before:text-sm before:text-[#0078ff]">
                TESDA Verification
              </a>
            </li>
            <li className="mb-2 break-inside-avoid">
              <a href="#portfolio" className="text-[#0066cc] no-underline transition-all duration-200 flex items-center hover:text-[#0078ff] hover:translate-x-[5px] before:content-['→'] before:mr-2 before:text-sm before:text-[#0078ff]">
                Portfolio Usage
              </a>
            </li>
            <li className="mb-2 break-inside-avoid">
              <a href="#prohibited" className="text-[#0066cc] no-underline transition-all duration-200 flex items-center hover:text-[#0078ff] hover:translate-x-[5px] before:content-['→'] before:mr-2 before:text-sm before:text-[#0078ff]">
                Prohibited Activities
              </a>
            </li>
            <li className="mb-2 break-inside-avoid">
              <a href="#privacy" className="text-[#0066cc] no-underline transition-all duration-200 flex items-center hover:text-[#0078ff] hover:translate-x-[5px] before:content-['→'] before:mr-2 before:text-sm before:text-[#0078ff]">
                Data Privacy
              </a>
            </li>
            <li className="mb-2 break-inside-avoid">
              <a href="#suspension" className="text-[#0066cc] no-underline transition-all duration-200 flex items-center hover:text-[#0078ff] hover:translate-x-[5px] before:content-['→'] before:mr-2 before:text-sm before:text-[#0078ff]">
                Account Suspension
              </a>
            </li>
            <li className="mb-2 break-inside-avoid">
              <a href="#liability" className="text-[#0066cc] no-underline transition-all duration-200 flex items-center hover:text-[#0078ff] hover:translate-x-[5px] before:content-['→'] before:mr-2 before:text-sm before:text-[#0078ff]">
                Limitation of Liability
              </a>
            </li>
            <li className="mb-2 break-inside-avoid">
              <a href="#changes" className="text-[#0066cc] no-underline transition-all duration-200 flex items-center hover:text-[#0078ff] hover:translate-x-[5px] before:content-['→'] before:mr-2 before:text-sm before:text-[#0078ff]">
                Changes to Terms
              </a>
            </li>
            <li className="mb-2 break-inside-avoid">
              <a href="#contact" className="text-[#0066cc] no-underline transition-all duration-200 flex items-center hover:text-[#0078ff] hover:translate-x-[5px] before:content-['→'] before:mr-2 before:text-sm before:text-[#0078ff]">
                Contact Information
              </a>
            </li>
          </ul>
        </div>

        {/* === LEGAL SECTIONS === */}
        <section className="mb-12 p-6 rounded-xl transition-all duration-300 border border-transparent hover:bg-[#f9fbff] hover:border-[#e8f0ff] hover:shadow-[0_5px_15px_rgba(0,120,255,0.05)] hover:-translate-y-[3px] max-md:mb-8 max-md:p-4" id="introduction">
          <h2 className="text-2xl font-bold text-[#0056b3] mb-5 pb-3 border-b-2 border-[#e8f0ff] flex items-center before:content-['§'] before:mr-[10px] before:text-[#0078ff] before:font-normal before:text-3xl max-md:text-xl">
            1. Introduction
          </h2>
          <p className="mb-5 leading-7 text-[#444] text-base">
            Welcome to Tarabaho!
          </p>
          <p className="mb-5 leading-7 text-[#444] text-base">
            Tarabaho is a platform that helps <strong>TESDA-accredited graduates</strong> and skilled professionals
            showcase their verified digital portfolios, making it easier for clients and employers to discover their
            talents.
          </p>
          <p className="mb-5 leading-7 text-[#444] text-base">
            By using our platform, you agree to these Terms and Conditions. Please read them carefully.
          </p>
        </section>

        <section className="mb-12 p-6 rounded-xl transition-all duration-300 border border-transparent hover:bg-[#f9fbff] hover:border-[#e8f0ff] hover:shadow-[0_5px_15px_rgba(0,120,255,0.05)] hover:-translate-y-[3px] max-md:mb-8 max-md:p-4" id="eligibility">
          <h2 className="text-2xl font-bold text-[#0056b3] mb-5 pb-3 border-b-2 border-[#e8f0ff] flex items-center before:content-['§'] before:mr-[10px] before:text-[#0078ff] before:font-normal before:text-3xl max-md:text-xl">
            2. Eligibility
          </h2>
          <ul className="pl-[1.8rem] mb-5 list-none">
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              Users must be at least 15 years old to create an account.
            </li>
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              TESDA graduates must upload valid certificates to create verified portfolios.
            </li>
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              Employers/clients must be at least 18 years old to browse and connect with graduates.
            </li>
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              All users must provide accurate and truthful information upon registration.
            </li>
          </ul>
        </section>

        <section className="mb-12 p-6 rounded-xl transition-all duration-300 border border-transparent hover:bg-[#f9fbff] hover:border-[#e8f0ff] hover:shadow-[0_5px_15px_rgba(0,120,255,0.05)] hover:-translate-y-[3px] max-md:mb-8 max-md:p-4" id="account">
          <h2 className="text-2xl font-bold text-[#0056b3] mb-5 pb-3 border-b-2 border-[#e8f0ff] flex items-center before:content-['§'] before:mr-[10px] before:text-[#0078ff] before:font-normal before:text-3xl max-md:text-xl">
            3. Account Responsibilities
          </h2>
          <ul className="pl-[1.8rem] mb-5 list-none">
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              You are responsible for keeping your account credentials secure.
            </li>
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              Any activity under your account is your responsibility.
            </li>
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              Report unauthorized use to Tarabaho Support immediately.
            </li>
          </ul>
        </section>

        <section className="mb-12 p-6 rounded-xl transition-all duration-300 border border-transparent hover:bg-[#f9fbff] hover:border-[#e8f0ff] hover:shadow-[0_5px_15px_rgba(0,120,255,0.05)] hover:-translate-y-[3px] max-md:mb-8 max-md:p-4" id="services">
          <h2 className="text-2xl font-bold text-[#0056b3] mb-5 pb-3 border-b-2 border-[#e8f0ff] flex items-center before:content-['§'] before:mr-[10px] before:text-[#0078ff] before:font-normal before:text-3xl max-md:text-xl">
            4. Services Provided
          </h2>
          <ul className="pl-[1.8rem] mb-5 list-none">
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              <strong>Graduates:</strong> Can create and manage digital portfolios, upload TESDA certificates, and share
              their profiles.
            </li>
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              <strong>Employers/Clients:</strong> Can browse and view verified graduate portfolios for potential
              collaboration or hiring.
            </li>
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              Tarabaho acts only as a <em>portfolio platform</em> and does not handle payments, contracts, or direct
              hiring.
            </li>
          </ul>
        </section>

        <section className="mb-12 p-6 rounded-xl transition-all duration-300 border border-transparent hover:bg-[#f9fbff] hover:border-[#e8f0ff] hover:shadow-[0_5px_15px_rgba(0,120,255,0.05)] hover:-translate-y-[3px] max-md:mb-8 max-md:p-4" id="verification">
          <h2 className="text-2xl font-bold text-[#0056b3] mb-5 pb-3 border-b-2 border-[#e8f0ff] flex items-center before:content-['§'] before:mr-[10px] before:text-[#0078ff] before:font-normal before:text-3xl max-md:text-xl">
            5. TESDA Verification
          </h2>
          <ul className="pl-[1.8rem] mb-5 list-none">
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              TESDA graduates must upload valid certificates for verification.
            </li>
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              Any falsified or fraudulent documents will lead to account suspension or termination.
            </li>
          </ul>
        </section>

        <section className="mb-12 p-6 rounded-xl transition-all duration-300 border border-transparent hover:bg-[#f9fbff] hover:border-[#e8f0ff] hover:shadow-[0_5px_15px_rgba(0,120,255,0.05)] hover:-translate-y-[3px] max-md:mb-8 max-md:p-4" id="portfolio">
          <h2 className="text-2xl font-bold text-[#0056b3] mb-5 pb-3 border-b-2 border-[#e8f0ff] flex items-center before:content-['§'] before:mr-[10px] before:text-[#0078ff] before:font-normal before:text-3xl max-md:text-xl">
            6. Portfolio Usage
          </h2>
          <ul className="pl-[1.8rem] mb-5 list-none">
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              Graduates are responsible for keeping their portfolio information accurate and updated.
            </li>
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              Employers may view and evaluate portfolios but must contact graduates outside the platform for hiring
              arrangements.
            </li>
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              Tarabaho is not liable for any agreements, payments, or disputes that occur outside the platform.
            </li>
          </ul>
        </section>

        <section className="mb-12 p-6 rounded-xl transition-all duration-300 border border-transparent hover:bg-[#f9fbff] hover:border-[#e8f0ff] hover:shadow-[0_5px_15px_rgba(0,120,255,0.05)] hover:-translate-y-[3px] max-md:mb-8 max-md:p-4" id="prohibited">
          <h2 className="text-2xl font-bold text-[#0056b3] mb-5 pb-3 border-b-2 border-[#e8f0ff] flex items-center before:content-['§'] before:mr-[10px] before:text-[#0078ff] before:font-normal before:text-3xl max-md:text-xl">
            7. Prohibited Activities
          </h2>
          <ul className="pl-[1.8rem] mb-5 list-none">
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              Uploading false or fraudulent certifications.
            </li>
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              Impersonating another person or providing misleading information.
            </li>
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              Using the platform for harassment, discrimination, or unlawful activity.
            </li>
          </ul>
        </section>

        <section className="mb-12 p-6 rounded-xl transition-all duration-300 border border-transparent hover:bg-[#f9fbff] hover:border-[#e8f0ff] hover:shadow-[0_5px_15px_rgba(0,120,255,0.05)] hover:-translate-y-[3px] max-md:mb-8 max-md:p-4" id="privacy">
          <h2 className="text-2xl font-bold text-[#0056b3] mb-5 pb-3 border-b-2 border-[#e8f0ff] flex items-center before:content-['§'] before:mr-[10px] before:text-[#0078ff] before:font-normal before:text-3xl max-md:text-xl">
            8. Data Privacy
          </h2>
          <p className="mb-5 leading-7 text-[#444] text-base">
            Tarabaho follows the <strong>Data Privacy Act of 2012</strong>. Personal data, certificates, and portfolio
            details are stored securely and only used for platform purposes. We will never sell or misuse your
            information.
          </p>
        </section>

        <section className="mb-12 p-6 rounded-xl transition-all duration-300 border border-transparent hover:bg-[#f9fbff] hover:border-[#e8f0ff] hover:shadow-[0_5px_15px_rgba(0,120,255,0.05)] hover:-translate-y-[3px] max-md:mb-8 max-md:p-4" id="suspension">
          <h2 className="text-2xl font-bold text-[#0056b3] mb-5 pb-3 border-b-2 border-[#e8f0ff] flex items-center before:content-['§'] before:mr-[10px] before:text-[#0078ff] before:font-normal before:text-3xl max-md:text-xl">
            9. Account Suspension and Termination
          </h2>
          <ul className="pl-[1.8rem] mb-5 list-none">
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              Tarabaho reserves the right to suspend or terminate accounts that violate these Terms.
            </li>
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              Fraudulent certificates or repeated policy violations will result in permanent removal.
            </li>
          </ul>
        </section>

        <section className="mb-12 p-6 rounded-xl transition-all duration-300 border border-transparent hover:bg-[#f9fbff] hover:border-[#e8f0ff] hover:shadow-[0_5px_15px_rgba(0,120,255,0.05)] hover:-translate-y-[3px] max-md:mb-8 max-md:p-4" id="liability">
          <h2 className="text-2xl font-bold text-[#0056b3] mb-5 pb-3 border-b-2 border-[#e8f0ff] flex items-center before:content-['§'] before:mr-[10px] before:text-[#0078ff] before:font-normal before:text-3xl max-md:text-xl">
            10. Limitation of Liability
          </h2>
          <ul className="pl-[1.8rem] mb-5 list-none">
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              Tarabaho is not responsible for outcomes, payments, or disputes outside the platform.
            </li>
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              We only provide a secure space for showcasing verified portfolios.
            </li>
          </ul>
        </section>

        <section className="mb-12 p-6 rounded-xl transition-all duration-300 border border-transparent hover:bg-[#f9fbff] hover:border-[#e8f0ff] hover:shadow-[0_5px_15px_rgba(0,120,255,0.05)] hover:-translate-y-[3px] max-md:mb-8 max-md:p-4" id="changes">
          <h2 className="text-2xl font-bold text-[#0056b3] mb-5 pb-3 border-b-2 border-[#e8f0ff] flex items-center before:content-['§'] before:mr-[10px] before:text-[#0078ff] before:font-normal before:text-3xl max-md:text-xl">
            11. Changes to Terms
          </h2>
          <ul className="pl-[1.8rem] mb-5 list-none">
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              We may update these Terms and Conditions as necessary.
            </li>
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              Significant changes will be communicated via in-app notifications or email.
            </li>
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              Continued use of Tarabaho means you accept the updated Terms.
            </li>
          </ul>
        </section>

        <section className="mb-12 p-6 rounded-xl transition-all duration-300 border border-transparent hover:bg-[#f9fbff] hover:border-[#e8f0ff] hover:shadow-[0_5px_15px_rgba(0,120,255,0.05)] hover:-translate-y-[3px] max-md:mb-8 max-md:p-4" id="contact">
          <h2 className="text-2xl font-bold text-[#0056b3] mb-5 pb-3 border-b-2 border-[#e8f0ff] flex items-center before:content-['§'] before:mr-[10px] before:text-[#0078ff] before:font-normal before:text-3xl max-md:text-xl">
            12. Contact Information
          </h2>
          <p className="mb-5 leading-7 text-[#444] text-base">
            For questions, concerns, or support:
          </p>
          <ul className="pl-[1.8rem] mb-5 list-none">
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              📧 Email: support@tarabaho.com
            </li>
            <li className="mb-2 leading-7 text-[#444] relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-[#0078ff] before:text-xl before:leading-6">
              📞 Phone: +63 (2) 8123-4567
            </li>
          </ul>
        </section>

        <section className="bg-gradient-to-br from-[#f0f8ff] to-[#e6f3ff] p-8 rounded-xl border-l-8 border-[#0078ff] mt-12 relative overflow-hidden shadow-[0_8px_20px_rgba(0,120,255,0.1)] before:content-['!'] before:absolute before:top-[-15px] before:right-[20px] before:text-[8rem] before:font-bold before:text-[rgba(0,120,255,0.05)] before:leading-none max-md:p-6">
          <h2 className="text-xl text-[#0078ff] mb-6 flex items-center border-none before:content-['✓'] before:mr-[10px] before:bg-[#0078ff] before:text-white before:w-[30px] before:h-[30px] before:rounded-full before:flex before:items-center before:justify-center before:text-base max-md:text-lg">
            Quick Reminders
          </h2>
          <ul className="list-none pl-0">
            <li className="pl-8 relative font-medium mb-4 text-[#0056b3] before:content-['✓'] before:absolute before:left-0 before:text-white before:bg-[#0078ff] before:w-[22px] before:h-[22px] before:rounded-full before:flex before:items-center before:justify-center before:text-xs">
              Be truthful when uploading certifications.
            </li>
            <li className="pl-8 relative font-medium mb-4 text-[#0056b3] before:content-['✓'] before:absolute before:left-0 before:text-white before:bg-[#0078ff] before:w-[22px] before:h-[22px] before:rounded-full before:flex before:items-center before:justify-center before:text-xs">
              Keep portfolios professional and updated.
            </li>
            <li className="pl-8 relative font-medium mb-4 text-[#0056b3] before:content-['✓'] before:absolute before:left-0 before:text-white before:bg-[#0078ff] before:w-[22px] before:h-[22px] before:rounded-full before:flex before:items-center before:justify-center before:text-xs">
              Tarabaho does not handle contracts or payments.
            </li>
            <li className="pl-8 relative font-medium mb-4 text-[#0056b3] before:content-['✓'] before:absolute before:left-0 before:text-white before:bg-[#0078ff] before:w-[22px] before:h-[22px] before:rounded-full before:flex before:items-center before:justify-center before:text-xs">
              Respect other users and follow community standards.
            </li>
          </ul>
        </section>

        <div className="mt-16 text-center italic text-[#888] text-sm pt-6 border-t border-dashed border-[#e0e0e0]">
          <p>Last Updated: September 22, 2025</p>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Terms