import { Link } from "react-router-dom"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#003366] text-white px-8 py-4 w-full">
      <div className="flex justify-between items-center max-w-6xl mx-auto flex-wrap gap-4">
        <div className="flex flex-col">
          <span className="text-base font-bold text-white">TARABAHO</span>
          <span className="text-sm text-blue-500">TARA! TRABAHO</span>
        </div>

        <div className="text-xs text-white/70">
          <p className="m-0">&copy; {currentYear} TARABAHO. All rights reserved.</p>
        </div>

        <div className="flex gap-6">
          <Link to="/terms" className="text-xs text-white/70 no-underline hover:text-blue-500 transition-colors duration-300">Terms</Link>
          <Link to="/privacy" className="text-xs text-white/70 no-underline hover:text-blue-500 transition-colors duration-300">Privacy</Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer