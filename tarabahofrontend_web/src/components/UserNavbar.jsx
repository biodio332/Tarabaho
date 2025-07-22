import { Link, useLocation } from "react-router-dom"
import logo from "../assets/images/logowhite.png"
import "../styles/User-navbar.css"

const UserNavbar = () => {
  const location = useLocation()

  return (
    <nav className="user-navbar">
      <div className="user-navbar-logo">
        <img src={logo || "/placeholder.svg"} alt="Tarabaho Logo" className="logo" />
      </div>

      <div className="user-navbar-links">
        <Link to="/user-home" className={location.pathname === "/user-home" ? "active" : ""}>
          HOME
        </Link>

        <Link to="/user-browse" className={location.pathname === "/user-browse" ? "active" : ""}>
          BROWSE
        </Link>
        <Link to="/user-contact" className={location.pathname === "/user-contact" ? "active" : ""}>
          CONTACT US
        </Link>
        <Link to="/user-about" className={location.pathname === "/user-about" ? "active" : ""}>
          ABOUT US
        </Link>
        <Link to="/user-profile" className={location.pathname === "/user-profile" ? "active" : ""}>
          PROFILE
        </Link>
      </div>
    </nav>
  )
}

export default UserNavbar
