"use client"

import { useNavigate } from "react-router-dom"
import backgroundImage from "../assets/images/homepage.png"

const Homepage = () => {
  const navigate = useNavigate()

  const handleExploreClick = () => {
    navigate("/signin")
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* MAIN CONTENT */}
      <main className="flex-1 relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/60 to-slate-900/80" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex items-center justify-center min-h-full px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Hero Section */}
            <div className="space-y-6">
              {/* Main Logo/Title */}
              <div className="flex items-center justify-center space-x-3">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-wider">TARABAHO</h1>
                <div className="p-2 bg-primary/20 backdrop-blur-sm rounded-full border border-primary/30">
                  <svg
                    className="w-8 h-8 md:w-10 md:h-10 text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2.5" fill="none" />
                    <path d="M18 18L22 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="4" fill="rgba(59, 130, 246, 0.2)" />
                  </svg>
                </div>
              </div>

              {/* Tagline */}
              <p className="text-xl md:text-2xl text-blue-200 font-medium tracking-widest">TARA! TRABAHO</p>
            </div>

            {/* Description Section */}
            <div className="max-w-3xl mx-auto space-y-6 text-left">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 md:p-10 space-y-6">
                <div className="space-y-4 text-white/90 leading-relaxed">
                  <p className="text-lg md:text-xl text-balance">
                    <span className="font-semibold text-white">Tarabaho: Tara! Trabaho</span> is a platform designed to
                    help <span className="font-semibold text-blue-200">employers and clients</span> easily discover
                    skilled TESDA-accredited professionals through verified digital portfolios.
                  </p>

                  <p className="text-base md:text-lg text-balance">
                    Instead of sifting through unverified listings, users can browse professional profiles that showcase
                    certifications, skills, and past projects — all in one trusted space.
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-3">
                  <p className="text-lg font-medium text-white mb-4">The platform makes it simple to:</p>
                  <div className="space-y-3 text-white/90">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <p className="text-base md:text-lg">
                        Search by skills or category to find the right graduate for your needs.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <p className="text-base md:text-lg">
                        View complete portfolios with certifications, work samples, and testimonials.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-base md:text-lg text-white/90 text-balance">
                  With Tarabaho, users gain confidence knowing they are engaging with verified, skilled professionals,
                  making it easier to match the right person to the right opportunity.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <button
                onClick={handleExploreClick}
                className="group relative px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-primary/25 focus:outline-none focus:ring-4 focus:ring-primary/50"
              >
                <span className="relative z-10 tracking-wide">EXPLORE PLATFORM</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Homepage
