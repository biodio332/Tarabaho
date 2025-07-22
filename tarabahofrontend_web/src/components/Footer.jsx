import { Link } from "react-router-dom"
import "../styles/Footer.css"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-branding">
          <span className="footer-title">TARABAHO</span>
          <span className="footer-tagline">TARA! TRABAHO</span>
        </div>

        <div className="footer-copyright">
          <p>&copy; {currentYear} TARABAHO. All rights reserved.</p>
        </div>

        <div className="footer-links">
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
