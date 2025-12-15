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
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
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
          const response = await fetch(`${BACKEND_URL}/api/contact/submit`, {
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
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-[#001233] via-[#023e8a] to-[#0077b6] font-sans overflow-x-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:30px_30px] opacity-30"></div>
      </div>

      <main className="relative z-10 flex-grow w-full flex flex-col md:flex-row px-6 lg:px-12 pt-12 pb-12 lg:pt-14 lg:pb-16">
        {/* Left Section */}
        <div className="flex-1 flex flex-col justify-start px-4 lg:px-12 pt-6 pb-8 text-center md:text-left animate-fade-in-up">
          <div className="inline-block mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-semibold border border-white/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Get in Touch
            </span>
          </div>
          <h1 className="text-white text-5xl lg:text-60xl xl:text-7xl font-bold mb-6 leading-tight">
            Contact
            <span className="block bg-gradient-to-r from-blue-200 via-white to-indigo-200 bg-clip-text text-transparent">
              Us
            </span>
          </h1>
          <p className="text-white/90 text-lg lg:text-xl leading-relaxed mb-12 max-w-[550px] mx-auto md:mx-0 font-light">
            Got questions, feedback, or partnership inquiries? We'd love to hear from you! At Tarabaho, we're always
            open to improving our platform and helping our users get the best experience possible.
          </p>
          <div className="mt-8 space-y-6">
            <div className="group flex items-center justify-center md:justify-start gap-4 text-white text-lg lg:text-xl p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-default">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M2 7L12 14L22 7" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <span className="font-medium">Tarabaho67@gmail.com</span>
            </div>
            <div className="group flex items-center justify-center md:justify-start gap-4 text-white text-lg lg:text-xl p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-default">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <path
                    d="M22 16.92V19.92C22 20.4704 21.7893 20.9996 21.4142 21.3747C21.0391 21.7498 20.5099 21.9605 19.96 21.96C18.2 22.09 16.48 21.81 14.9 21.14C13.42 20.5192 12.0783 19.6295 10.94 18.52C9.82856 17.3823 8.93825 16.0404 8.32 14.56C7.64 12.97 7.36 11.25 7.49 9.49C7.48952 8.94159 7.69938 8.41334 8.07319 8.03847C8.447 7.66359 8.97388 7.45211 9.52 7.45H12.52C13.5887 7.44094 14.5157 8.2087 14.68 9.26C14.7685 9.81312 14.9074 10.3528 15.09 10.87C15.3339 11.5426 15.1761 12.2856 14.69 12.77L13.69 13.77C14.2293 15.0375 15.0499 16.1698 16.09 17.09C17.0102 18.1301 18.1425 18.9507 19.41 19.49L20.41 18.49C20.8944 18.0039 21.6374 17.8461 22.31 18.09C22.8272 18.2726 23.3669 18.4115 23.92 18.5C24.9887 18.6667 25.7402 19.6516 25.69 20.74L22 16.92Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-medium">Support: (+63) 994 289 6704</span>
            </div>
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="flex-[1.2] flex items-center justify-center px-4 py-8 animate-fade-in-up animation-delay-300">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 lg:p-12 w-full max-w-[600px] shadow-2xl border border-white/20 relative overflow-hidden">
            {/* Decorative gradient overlay */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"></div>
                  <h2 className="text-white text-3xl lg:text-4xl font-bold">
                    We'd love to hear from you!
                  </h2>
                  <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"></div>
                </div>
                <p className="text-white/80 text-sm lg:text-base">Fill out the form below and we'll get back to you soon</p>
              </div>
              
              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-100 flex items-start gap-3 animate-slide-down">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-semibold mb-1">Error</p>
                    <p className="text-sm">{errorMessage}</p>
                  </div>
                </div>
              )}
              {submitSuccess && (
                <div className="mb-6 p-4 rounded-xl bg-green-500/20 backdrop-blur-sm border border-green-400/30 text-green-100 flex items-start gap-3 animate-slide-down">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-semibold mb-1">Success!</p>
                    <p className="text-sm">Message sent successfully! We'll get back to you soon.</p>
                  </div>
                </div>
              )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col">
                <label htmlFor="fullName" className="text-white text-sm font-semibold mb-2.5 flex items-center gap-1">
                  Full Name <span className="text-red-400 text-base">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting || submitSuccess}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/95 text-gray-800 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white disabled:bg-gray-200 disabled:cursor-not-allowed transition-all duration-200 border border-transparent focus:border-blue-300"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex flex-col">
                  <label htmlFor="email" className="text-white text-sm font-semibold mb-2.5 flex items-center gap-1">
                    Email <span className="text-red-400 text-base">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting || submitSuccess}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/95 text-gray-800 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white disabled:bg-gray-200 disabled:cursor-not-allowed transition-all duration-200 border border-transparent focus:border-blue-300"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                <div className="flex-1 flex flex-col">
                  <label htmlFor="phone" className="text-white text-sm font-semibold mb-2.5 flex items-center gap-1">
                    Phone Number <span className="text-red-400 text-base">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting || submitSuccess}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/95 text-gray-800 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white disabled:bg-gray-200 disabled:cursor-not-allowed transition-all duration-200 border border-transparent focus:border-blue-300"
                      placeholder="(+63) 123 456 7890"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <label htmlFor="address" className="text-white text-sm font-semibold mb-2.5 flex items-center gap-1">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={isSubmitting || submitSuccess}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/95 text-gray-800 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white disabled:bg-gray-200 disabled:cursor-not-allowed transition-all duration-200 border border-transparent focus:border-blue-300"
                    placeholder="Your address (optional)"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label htmlFor="message" className="text-white text-sm font-semibold mb-2.5 flex items-center gap-1">
                  Your Message <span className="text-red-400 text-base">*</span>
                </label>
                <div className="relative">
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    maxLength={maxMessageLength}
                    disabled={isSubmitting || submitSuccess}
                    className="w-full px-4 py-3.5 rounded-xl bg-white/95 text-gray-800 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white disabled:bg-gray-200 disabled:cursor-not-allowed transition-all duration-200 resize-y min-h-[150px] border border-transparent focus:border-blue-300"
                    placeholder="Tell us what's on your mind..."
                  ></textarea>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-white/70 text-xs flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Required field
                  </p>
                  <p className={`text-sm font-medium transition-colors ${
                    formData.message.length > maxMessageLength * 0.9 
                      ? 'text-red-400' 
                      : formData.message.length > maxMessageLength * 0.7 
                        ? 'text-yellow-400' 
                        : 'text-white/80'
                  }`}>
                    {formData.message.length}/{maxMessageLength} characters
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || submitSuccess}
                  className="group w-full max-w-[240px] mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-xl font-bold text-base uppercase tracking-wide hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 active:shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : submitSuccess ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Message Sent!
                      </>
                    ) : (
                      <>
                        Send Message
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </>
                    )}
                  </span>
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      </main>

      <style>{`
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

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
        }

        .animate-slide-down {
          animation: slide-down 0.4s ease-out forwards;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #6366f1);
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #4f46e5);
        }
      `}</style>
    </div>
  );
};

export default ContactUs;