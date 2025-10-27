"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const maxMessageLength = 2000;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:8080/api/contact/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (response.ok) {
        setSubmitSuccess(true);
        console.log("Contact form submitted:", await response.json());
        setTimeout(() => {
          setSubmitSuccess(false);
          setFormData({
            fullName: "",
            email: "",
            phone: "",
            address: "",
            message: "",
          });
        }, 3000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Failed to submit form. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-r from-[#001233] to-[#023e8a] font-sans overflow-x-hidden">
      <main className="flex-grow w-full flex flex-col md:flex-row px-6 lg:px-12 py-8">
        {/* Left Section */}
        <div className="flex-1 flex flex-col justify-center px-4 lg:px-12 py-8 text-center md:text-left">
          <h1 className="text-white text-4xl lg:text-5xl font-bold uppercase mb-6">
            Contact Us
          </h1>
          <p className="text-white/90 text-lg leading-relaxed mb-12 max-w-[500px] mx-auto md:mx-0">
            Got questions, feedback, or partnership inquiries? We'd love to hear from you! At Tarabaho, we're always
            open to improving our platform and helping our users get the best experience possible.
          </p>
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-center md:justify-start gap-4 text-white text-lg">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M2 7L12 14L22 7" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span>info@Tarabaho.com</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-4 text-white text-lg">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                <path
                  d="M22 16.92V19.92C22 20.4704 21.7893 20.9996 21.4142 21.3747C21.0391 21.7498 20.5099 21.9605 19.96 21.96C18.2 22.09 16.48 21.81 14.9 21.14C13.42 20.5192 12.0783 19.6295 10.94 18.52C9.82856 17.3823 8.93825 16.0404 8.32 14.56C7.64 12.97 7.36 11.25 7.49 9.49C7.48952 8.94159 7.69938 8.41334 8.07319 8.03847C8.447 7.66359 8.97388 7.45211 9.52 7.45H12.52C13.5887 7.44094 14.5157 8.2087 14.68 9.26C14.7685 9.81312 14.9074 10.3528 15.09 10.87C15.3339 11.5426 15.1761 12.2856 14.69 12.77L13.69 13.77C14.2293 15.0375 15.0499 16.1698 16.09 17.09C17.0102 18.1301 18.1425 18.9507 19.41 19.49L20.41 18.49C20.8944 18.0039 21.6374 17.8461 22.31 18.09C22.8272 18.2726 23.3669 18.4115 23.92 18.5C24.9887 18.6667 25.7402 19.6516 25.69 20.74L22 16.92Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Support: (+63) 123 456 7890</span>
            </div>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="flex-[1.2] flex items-center justify-center px-4 py-8">
          <div className="bg-[#003c82]/70 rounded-lg p-6 lg:p-10 w-full max-w-[550px] shadow-2xl">
            <h2 className="text-white text-2xl lg:text-3xl font-semibold text-center mb-8">
              We'd love to hear from you!
            </h2>
            {errorMessage && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{errorMessage}</div>
            )}
            {submitSuccess && (
              <div className="bg-green-100 text-green-700 p-3 rounded mb-4">Message sent successfully!</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col">
                <label htmlFor="fullName" className="text-white text-sm font-medium mb-2">
                  Full Name <span className="text-[#ff6b6b]">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting || submitSuccess}
                  className="p-3 rounded bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0078ff]/50 disabled:bg-gray-200"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex flex-col">
                  <label htmlFor="email" className="text-white text-sm font-medium mb-2">
                    Email <span className="text-[#ff6b6b]">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting || submitSuccess}
                    className="p-3 rounded bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0078ff]/50 disabled:bg-gray-200"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <label htmlFor="phone" className="text-white text-sm font-medium mb-2">
                    Phone Number <span className="text-[#ff6b6b]">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting || submitSuccess}
                    className="p-3 rounded bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0078ff]/50 disabled:bg-gray-200"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label htmlFor="address" className="text-white text-sm font-medium mb-2">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={isSubmitting || submitSuccess}
                  className="p-3 rounded bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0078ff]/50 disabled:bg-gray-200"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="message" className="text-white text-sm font-medium mb-2">
                  Your Message <span className="text-[#ff6b6b]">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  maxLength={maxMessageLength}
                  disabled={isSubmitting || submitSuccess}
                  className="p-3 rounded bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0078ff]/50 disabled:bg-gray-200 resize-y min-h-[150px]"
                ></textarea>
                <p className="text-white/80 text-sm mt-1">
                  {formData.message.length}/{maxMessageLength} characters
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || submitSuccess}
                className="w-full max-w-[200px] mx-auto bg-[#0078ff] text-white py-3 px-6 rounded font-semibold uppercase tracking-wide hover:bg-[#0056b3] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-md disabled:bg-[#0078ff]/50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isSubmitting ? "Sending..." : submitSuccess ? "Message Sent!" : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactUs;