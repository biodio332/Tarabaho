import { Link, useLocation } from "react-router-dom"
import logo from "../assets/images/logowhite.png"
import "../styles/Admin-navbar.css"

const AdminNavbar = () => {
  const location = useLocation()

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-logo">
        <img src={logo || "/placeholder.svg"} alt="Tarabaho Logo" className="logo" />
      </div>

      <div className="admin-navbar-links">
        <Link to="/admin/homepage" className={location.pathname === "/admin/homepage" ? "active" : ""}>
          HOME
        </Link>
        <Link to="/admin/contact" className={location.pathname === "/admin/contact" ? "active" : ""}>
          CONTACT US
        </Link>
        <Link to="/admin/about" className={location.pathname === "/admin/about" ? "active" : ""}>
          ABOUT US
        </Link>
        <Link to="/admin/profile" className={location.pathname === "/admin/profile" ? "active" : ""}>
          PROFILE
        </Link>
      </div>
    </nav>
  )
}

export default AdminNavbar
