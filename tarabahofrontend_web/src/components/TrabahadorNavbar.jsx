import { Link } from "react-router-dom"
import logo from "../assets/images/logowhite.png"

const TrabahadorNavbar = ({ activePage }) => {
  return (
    <nav className="bg-blue-900 px-8 py-4 flex items-center justify-between flex-shrink-0 shadow-lg sticky top-0 z-[100] w-full box-border">
      <div className="flex items-center justify-start">
        <Link to="/graduate-homepage">
          <img 
            src={logo || "/placeholder.svg"} 
            alt="Tarabaho Logo" 
            className="h-12 object-contain mr-3 transition-transform duration-300 hover:scale-105 align-middle"
          />
        </Link>
      </div>
      <div className="flex items-center gap-8">
        <Link 
          to="/graduate-homepage" 
          className={`text-white no-underline font-semibold text-base tracking-wide px-4 py-2 rounded-lg transition-all duration-300 relative flex items-center justify-center
            ${activePage === "homepage" ? "font-bold bg-white/15" : ""}
            hover:bg-white/10 hover:text-white
            after:content-[''] after:absolute after:w-0 after:h-[2px] after:bottom-0 after:left-0 after:right-0 after:mx-auto after:bg-white after:transition-all after:duration-300
            hover:after:w-full ${activePage === "homepage" ? "after:w-full" : ""}`}
        >
          HOME
        </Link>
        <Link 
          to="/graduate-contact" 
          className={`text-white no-underline font-semibold text-base tracking-wide px-4 py-2 rounded-lg transition-all duration-300 relative flex items-center justify-center
            ${activePage === "contact" ? "font-bold bg-white/15" : ""}
            hover:bg-white/10 hover:text-white
            after:content-[''] after:absolute after:w-0 after:h-[2px] after:bottom-0 after:left-0 after:right-0 after:mx-auto after:bg-white after:transition-all after:duration-300
            hover:after:w-full ${activePage === "contact" ? "after:w-full" : ""}`}
        >
          CONTACT US
        </Link>
        
        <Link 
          to="/graduate-about" 
          className={`text-white no-underline font-semibold text-base tracking-wide px-4 py-2 rounded-lg transition-all duration-300 relative flex items-center justify-center
            ${activePage === "about" ? "font-bold bg-white/15" : ""}
            hover:bg-white/10 hover:text-white
            after:content-[''] after:absolute after:w-0 after:h-[2px] after:bottom-0 after:left-0 after:right-0 after:mx-auto after:bg-white after:transition-all after:duration-300
            hover:after:w-full ${activePage === "about" ? "after:w-full" : ""}`}
        >
          ABOUT US
        </Link>
        <Link 
          to="/graduate-profile" 
          className={`text-white no-underline font-semibold text-base tracking-wide px-4 py-2 rounded-lg transition-all duration-300 relative flex items-center justify-center
            ${activePage === "profile" ? "font-bold bg-white/15" : ""}
            hover:bg-white/10 hover:text-white
            after:content-[''] after:absolute after:w-0 after:h-[2px] after:bottom-0 after:left-0 after:right-0 after:mx-auto after:bg-white after:transition-all after:duration-300
            hover:after:w-full ${activePage === "profile" ? "after:w-full" : ""}`}
        >
          PROFILE
        </Link>
      </div>
    </nav>
  )
}

export default TrabahadorNavbar