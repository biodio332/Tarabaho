import { Link } from "react-router-dom"
import logo from "../assets/images/logowhite.png"
import "../styles/navbar.css"

const Navbar = ({ activePage }) => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo || "/placeholder.svg"} alt="Tarabaho Logo" className="logo" />
      </div>

      <div className="navbar-links">
        <Link to="/" className={activePage === "home" ? "active" : ""}>
          HOME
        </Link>
        <Link to="/contact" className={activePage === "contact" ? "active" : ""}>
          CONTACT US
        </Link>
        <Link to="/about" className={activePage === "about" ? "active" : ""}>
          ABOUT US
        </Link>
        <Link to="/signin" className={activePage === "signin" ? "active" : ""}>
          SIGN IN
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
