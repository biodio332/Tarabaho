"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import logo from "../assets/images/logowhite.png"
import styles from "../styles/register-admin.module.css"

const RegisterAdmin = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    password: "",
    email: "",
    address: "",
  })
  const [error, setError] = useState(null)
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post(`${BACKEND_URL}/api/admin/register`, formData, {
        headers: { "Content-Type": "application/json" },
      })
      console.log("Registration response:", res.data)
      alert("Registration successful!")
      navigate("/admin-login")
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message)
      const errorMessage = err.response?.data || "Error registering admin"
      setError(errorMessage)
    }
  }

  const handleBack = () => {
    navigate("/register")
  }

  return (
    <div className={styles.registerAdminContainer}>
      <button className={styles.backButton} onClick={handleBack}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <form onSubmit={handleSubmit} className={styles.registerAdminForm}>
        <div className={styles.formLeftSection}>
          <div className={styles.logoSection}>
            <div className={styles.logoContainer}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <img src={logo || "/placeholder.svg"} alt="Tarabaho Logo" className={styles.logo} />
              </div>
            </div>
          </div>

          <div className={styles.leftContent}>
            <h2 className={styles.formTitle}>Administrator Sign-Up Form</h2>
            <p className={styles.formDescription}>
              Sign up now and get started quickly. Create your admin account with a few clicks.
            </p>
            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="username">
                Username <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">
                Password <span className={styles.required}>*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className={styles.formRightSection}>
          <div className={styles.rightContent}>
            <div className={styles.nameGroup}>
              <label>Your name</label>
              <div className={styles.nameInputs}>
                <input
                  type="text"
                  name="firstname"
                  placeholder="First"
                  value={formData.firstname}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="lastname"
                  placeholder="Last"
                  value={formData.lastname}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">
                Email address <span className={styles.required}>*</span>
              </label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="address">
                Address <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className={styles.signupButton}>
              Sign Up
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default RegisterAdmin