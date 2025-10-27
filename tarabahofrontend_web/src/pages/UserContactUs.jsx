"use client"

import { useState } from "react"
import "../styles/Admin-contact-us.css"
import UserNavbar from "../components/UserNavbar"
import Footer from "../components/Footer"
import ContactUs from "./ContactUs"
const UserContactUs = () => {
  
  return (
    <div>
      <UserNavbar/>
      <ContactUs/>
      <Footer/>
    </div>
  )
}

export default UserContactUs
