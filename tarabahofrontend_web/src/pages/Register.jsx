"use client"

import { useNavigate } from "react-router-dom"
import logo from "../assets/images/logowhite.png"
import Footer from "../components/Footer"
import "../styles/Register.css"

const Register = () => {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate("/signin")
  }

  const handleRegisterAsUser = () => {
    navigate("/register-user")
  }

  const handleRegisterAsWorker = () => {
    navigate("/register-worker")
  }

  const handleRegisterAsAdmin = () => {
    navigate("/register-admin")
  }

  return (
    
    <div className="register-page">
      <div className="register-container">
        <button className="back-button" onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 19L8 12L15 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="register-content">
          <div className="logo-container">
            <img src={logo || "/placeholder.svg"} alt="Tarabaho Logo" className="logo" />
          </div>

          <div className="registration-heading">REGISTRATION</div>

          <div className="register-options">
            <button className="register-option-button" onClick={handleRegisterAsUser}>
              REGISTER AS USER
            </button>
            <button className="register-option-button" onClick={handleRegisterAsWorker}>
              REGISTER AS WORKER
            </button>
          </div>

          <div className="admin-register-container">
            <button className="admin-register-button" onClick={handleRegisterAsAdmin}>
              REGISTER AS ADMIN
            </button>
          </div>

          <button className="back-link-button" onClick={handleBack}>
            Back
          </button>
        </div>
      </div>
      <Footer/>
    </div>
  )
}

export default Register
