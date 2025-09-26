"use client"

import { useState } from "react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import "../styles/Admin-contact-us.css"

const ContactUs = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      console.log("Contact form data:", formData)
      setIsSubmitting(false)
      setSubmitSuccess(true)

      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false)
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          address: "",
          message: "",
        })
      }, 3000)
    }, 1500)
  }

  return (
    <div className="admin-contact-page-container">
      {/* MAIN CONTENT */}
      <div className="admin-contact-content">
        <div className="admin-contact-left">
          <h1 className="admin-contact-heading">CONTACT US</h1>
          <p className="admin-contact-description">
            Got questions, feedback, or partnership inquiries? We'd love to hear from you! At Tarabaho, we're always
            open to improving our platform and helping our users get the best experience possible.
          </p>

          <div className="admin-contact-info">
            <div className="admin-contact-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="white" strokeWidth="2" />
                <path d="M2 7L12 14L22 7" stroke="white" strokeWidth="2" />
              </svg>
              <span>info@Tarabaho.com</span>
            </div>

            <div className="admin-contact-item">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22 16.92V19.92C22 20.4704 21.7893 20.9996 21.4142 21.3747C21.0391 21.7498 20.5099 21.9605 19.96 21.96C18.2 22.09 16.48 21.81 14.9 21.14C13.42 20.5192 12.0783 19.6295 10.94 18.52C9.82856 17.3823 8.93825 16.0404 8.32 14.56C7.64 12.97 7.36 11.25 7.49 9.49C7.48952 8.94159 7.69938 8.41334 8.07319 8.03847C8.447 7.66359 8.97388 7.45211 9.52 7.45H12.52C13.5887 7.44094 14.5157 8.2087 14.68 9.26C14.7685 9.81312 14.9074 10.3528 15.09 10.87C15.3339 11.5426 15.1761 12.2856 14.69 12.77L13.69 13.77C14.2293 15.0375 15.0499 16.1698 16.09 17.09C17.0102 18.1301 18.1425 18.9507 19.41 19.49L20.41 18.49C20.8944 18.0039 21.6374 17.8461 22.31 18.09C22.8272 18.2726 23.3669 18.4115 23.92 18.5C24.9887 18.6667 25.7402 19.6516 25.69 20.74L22 16.92Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Support: (+63) 123 456 7890</span>
            </div>
          </div>
        </div>

        <div className="admin-contact-right">
          <div className="admin-contact-form-container">
            <h2 className="admin-form-heading">We'd love to hear from you!</h2>

            <form onSubmit={handleSubmit} className="admin-contact-form">
              <div className="admin-form-group">
                <label htmlFor="fullName">
                  Full Name: <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting || submitSuccess}
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label htmlFor="email">
                    Email: <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting || submitSuccess}
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="phone">
                    Phone number: <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting || submitSuccess}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label htmlFor="address">Address:</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={isSubmitting || submitSuccess}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="message">
                  Your Message: <span className="required">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting || submitSuccess}
                ></textarea>
              </div>

              <button type="submit" className="admin-send-button" disabled={isSubmitting || submitSuccess}>
                {isSubmitting ? "Sending..." : submitSuccess ? "Message Sent!" : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>  
    </div>
  )
}

export default ContactUs
