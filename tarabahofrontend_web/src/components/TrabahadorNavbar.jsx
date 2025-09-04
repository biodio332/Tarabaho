import { Link } from "react-router-dom"
import logo from "../assets/images/logowhite.png"
import "../styles/TrabahadorNavbar.css"

const TrabahadorNavbar = ({ activePage }) => {
  return (
    <nav className="trabahador-navbar">
      <div className="navbar-logo">
        <Link to="/graduate-homepage">
          <img src={logo || "/placeholder.svg"} alt="Tarabaho Logo" className="logo-img" />
        </Link>
      </div>
      <div className="navbar-links">
        <Link to="/graduate-homepage" className={activePage === "homepage" ? "active" : ""}>
          HOME
        </Link>

        <Link to="/graduate-contact" className={activePage === "contact" ? "active" : ""}>
          CONTACT US
        </Link>

        <Link to="/graduate-history" className={activePage === "history" ? "active" : ""}>
          HISTORY
        </Link>
        <Link to="/graduate-about" className={activePage === "about" ? "active" : ""}>
          ABOUT US
        </Link>
        <Link to="/graduate-profile" className={activePage === "profile" ? "active" : ""}>
          PROFILE
        </Link>
      </div>
    </nav>
  )
}

export default TrabahadorNavbar
