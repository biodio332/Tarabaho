"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import logo from "../assets/images/logowhite.png"
import styles from "../styles/register-user.module.css"

const RegisterUser = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    contactNo: "",
    birthday: "",
    username: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState({})
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  // Check if user is admin on mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/admin/me`, {
          withCredentials: true,
        })
        if (response.status === 200 && response.data.username) {
          setIsAdmin(true)
        }
      } catch (err) {
        console.log("Not an admin or not authenticated:", err.message)
        setIsAdmin(false)
      }
    }
    checkAdminStatus()
  }, [backendUrl])

  // Initialize progress bar
  useEffect(() => {
    const progressBar = document.querySelector(`.${styles.formProgressBar}`)
    if (progressBar) {
      progressBar.style.width = step === 1 ? "50%" : "100%"
    }
  }, [step])

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validatePassword = (password) => {
    let strength = 0
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    setPasswordStrength(strength)
    return strength >= 3
  }

  const validateForm = () => {
    const newErrors = {}
    if (step === 1) {
      if (!formData.username.trim()) newErrors.username = "Username is required"
      if (!formData.password) newErrors.password = "Password is required"
      else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters"
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    }
    if (step === 2) {
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
      if (!formData.email.trim()) newErrors.email = "Email is required"
      else if (!validateEmail(formData.email)) newErrors.email = "Invalid email format"
      if (!formData.address.trim()) newErrors.address = "Address is required"
      if (!formData.contactNo.trim()) newErrors.contactNo = "Contact number is required"
      if (!formData.birthday) newErrors.birthday = "Birthday is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
    if (name === "password") {
      validatePassword(value)
    }
  }

  const handleNextStep = (e) => {
    e.preventDefault()
    console.log("Next button clicked")
    if (validateForm()) {
      setStep(2)
      try {
        const progressBar = document.querySelector(`.${styles.formProgressBar}`)
        if (progressBar) {
          progressBar.style.width = "100%"
        }
      } catch (error) {
        console.error("Error updating progress bar:", error)
      }
    }
  }

  const handlePrevStep = () => {
    console.log("Back button clicked")
    setStep(1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)

    const payload = {
      firstname: formData.firstName,
      lastname: formData.lastName,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      phoneNumber: formData.contactNo,
      birthday: formData.birthday,
      location: formData.address,
    }

    try {
      const registerUrl = isAdmin
        ? `${backendUrl}/api/admin/users/register`
        : `${backendUrl}/api/user/register`
      const res = await axios.post(registerUrl, payload, {
        withCredentials: true,
      })
      setLoading(false)

      const successMessage = document.querySelector(`.${styles.successMessage}`)
      if (successMessage) {
        successMessage.classList.add(styles.show)
      }

      setTimeout(() => {
        navigate(isAdmin ? "/admin/manage-users" : "/signin")
      }, 2000)
    } catch (err) {
      setLoading(false)
      setErrors({
        ...errors,
        general: err.response?.data || "Registration failed. Please try again.",
      })
    }
  }

  const handleBack = () => {
    navigate(isAdmin ? "/admin/manage-users" : "/register")
  }

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return "Very weak"
      case 1: return "Weak"
      case 2: return "Medium"
      case 3: return "Strong"
      case 4: return "Very strong"
      default: return ""
    }
  }

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return "#ff4d4d"
      case 1: return "#ff9933"
      case 2: return "#ffcc00"
      case 3: return "#99cc33"
      case 4: return "#00cc66"
      default: return "#ccc"
    }
  }

  return (
    <div className={styles.registerUserContainer}>
      <button className={styles.backButton} onClick={handleBack} aria-label="Go back">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className={styles.successMessage}>
        <div className={styles.successIcon}>✓</div>
        <h3>Registration Successful!</h3>
        <p>Redirecting to {isAdmin ? "manage users" : "login"} page...</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.registerUserForm}>
        <div className={styles.formProgress}>
          <div className={styles.formProgressBar}></div>
        </div>
        <div className={styles.formSteps}>
          <div className={`${styles.formStep} ${step >= 1 ? styles.active : ""} ${step > 1 ? styles.completed : ""}`}>
            <div className={styles.stepNumber}>1</div>
            <span className={styles.stepLabel}>Account</span>
          </div>
          <div className={`${styles.formStep} ${step >= 2 ? styles.active : ""}`}>
            <div className={styles.stepNumber}>2</div>
            <span className={styles.stepLabel}>Personal Info</span>
          </div>
        </div>

        <div className={styles.formLeftSection}>
          <div className={styles.logoSection}>
            <div className={styles.logoContainer}>
              <img src={logo || "/placeholder.svg"} alt="Tarabaho Logo" className={styles.logo} />
            </div>
          </div>

          <div className={styles.leftContent}>
            <h2 className={styles.formTitle}>Create Your Account</h2>
            <p className={styles.formDescription}>
              Join Tarabaho today and connect with opportunities that match your skills and schedule.
            </p>

            {errors.general && <div className={`${styles.errorMessage} ${styles.general}`}>{errors.general}</div>}

            {step === 1 && (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="username">
                    Username <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWithIcon}>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={errors.username ? styles.error : ""}
                      placeholder="Choose a username"
                    />
                  </div>
                  {errors.username && <div className={styles.errorText}>{errors.username}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password">
                    Password <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWithIcon}>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={errors.password ? styles.error : ""}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles.togglePassword}
                      tabIndex="0"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.password && <div className={styles.errorText}>{errors.password}</div>}

                  {formData.password && (
                    <div className={styles.passwordStrength}>
                      <div className={styles.strengthBars}>
                        <div
                          className={styles.strengthBar}
                          style={{ backgroundColor: passwordStrength >= 1 ? getPasswordStrengthColor() : "" }}
                        ></div>
                        <div
                          className={styles.strengthBar}
                          style={{ backgroundColor: passwordStrength >= 2 ? getPasswordStrengthColor() : "" }}
                        ></div>
                        <div
                          className={styles.strengthBar}
                          style={{ backgroundColor: passwordStrength >= 3 ? getPasswordStrengthColor() : "" }}
                        ></div>
                        <div
                          className={styles.strengthBar}
                          style={{ backgroundColor: passwordStrength >= 4 ? getPasswordStrengthColor() : "" }}
                        ></div>
                      </div>
                      <span className={styles.strengthText} style={{ color: getPasswordStrengthColor() }}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword">
                    Confirm Password <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWithIcon}>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={errors.confirmPassword ? styles.error : ""}
                      placeholder="Confirm your password"
                    />
                  </div>
                  {errors.confirmPassword && <div className={styles.errorText}>{errors.confirmPassword}</div>}
                </div>

                <button type="button" className={styles.nextButton} onClick={handleNextStep}>
                  Next
                </button>
              </>
            )}

            {step === 2 && (
              <div className={styles.formNavigation}>
                <button type="button" className={styles.prevButton} onClick={handlePrevStep}>
                  Back
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.formRightSection}>
          <div className={styles.rightContent}>
            {step === 2 && (
              <>
                <h3 className={styles.sectionTitle}>Personal Information</h3>

                <div className={styles.nameGroup}>
                  <label>
                    Your name <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.nameInputs}>
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={errors.firstName ? styles.error : ""}
                      />
                      {errors.firstName && <div className={styles.errorText}>{errors.firstName}</div>}
                    </div>
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={errors.lastName ? styles.error : ""}
                      />
                      {errors.lastName && <div className={styles.errorText}>{errors.lastName}</div>}
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email">
                    Email address <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWithIcon}>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? styles.error : ""}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  {errors.email && <div className={styles.errorText}>{errors.email}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="address">
                    Address <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWithIcon}>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={errors.address ? styles.error : ""}
                      placeholder="Your full address"
                    />
                  </div>
                  {errors.address && <div className={styles.errorText}>{errors.address}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="contactNo">
                    Contact no. <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWithIcon}>
                    <input
                      type="tel"
                      id="contactNo"
                      name="contactNo"
                      value={formData.contactNo}
                      onChange={handleChange}
                      className={errors.contactNo ? styles.error : ""}
                      placeholder="e.g., +63 912 345 6789"
                    />
                  </div>
                  {errors.contactNo && <div className={styles.errorText}>{errors.contactNo}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="birthday">
                    Birthday <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.inputWithIcon}>
                    <input
                      type="date"
                      id="birthday"
                      name="birthday"
                      value={formData.birthday}
                      onChange={handleChange}
                      className={errors.birthday ? styles.error : ""}
                    />
                  </div>
                  {errors.birthday && <div className={styles.errorText}>{errors.birthday}</div>}
                </div>

                <div className={styles.termsPrivacy}>
                  <p>
                    By signing up, you agree to our <a href="/terms">Terms of Service</a> and{" "}
                    <a href="/privacy">Privacy Policy</a>
                  </p>
                </div>

                <button
                  type="submit"
                  className={`${styles.signupButton} ${loading ? styles.loading : ""}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className={styles.spinner}></span>
                      Processing...
                    </>
                  ) : (
                    <>Sign Up</>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default RegisterUser