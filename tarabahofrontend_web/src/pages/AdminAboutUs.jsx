import AdminNavbar from "../components/AdminNavbar"
import Footer from "../components/Footer"
import "../styles/About-us.css"

// Import team images
import aboutUsBanner from "../assets/images/about-us-banner.png"
import vicAndre from "../assets/images/vicAndre.png"
import polDaveQ from "../assets/images/polDaveQ.png"
import martinJohn from "../assets/images/martinJohn.png"
import DerickWayne from "../assets/images/DerickWayne.png"
import AngeloC from "../assets/images/AngeloC.png"

const AdminAboutUs = () => {
  return (
    <div className="about-us-page">
      <AdminNavbar />

      <div className="about-us-content">
        <h1 className="about-us-title">ABOUT US</h1>

        <div className="about-us-banner-container">
          <img
            src={aboutUsBanner || "/placeholder.svg?height=300&width=500"}
            alt="Tarabah Team"
            className="about-us-banner"
          />
        </div>

        <div className="about-us-description">
          <p>
            We are the passionate minds behind Tarabaho—a team of developers, innovators, and problem-solvers driven by
            one mission: to create a seamless platform that connects job seekers and employers with ease.
          </p>

          <p>
            What started as an idea quickly became a vision—to bridge the gap between opportunities and talent through
            intuitive technology. As developers, we understand the struggles of finding the right job and the challenges
            businesses face in hiring the right people. That's why we built Tarabaho—a platform designed not just for
            efficiency but also for real impact.
          </p>

          <p>
            From writing lines of code to designing an intuitive user experience, we are committed to building a
            platform that simplifies job searching and recruitment. Every feature we develop, every update we release,
            is done with the goal of making Tarabaho a game-changer in the employment space.
          </p>

          <p>
            We're not just building an app—we're shaping a future where opportunities are within reach for everyone.
          </p>

          <div className="about-us-tagline">
            <p>Built by developers.</p>
            <p>Inspired by opportunity.</p>
            <p>Made for you.</p>
          </div>
        </div>

        <h2 className="meet-devs-title">MEET THE DEVS BEHIND TARABAHO!</h2>

        <div className="dev-team-grid">
          <div className="dev-profile">
            <div className="dev-image-container">
              <img
                src={vicAndre || "/placeholder.svg?height=200&width=200"}
                alt="Vic Andre D. Bacusmo"
                className="dev-image"
              />
            </div>
            <h3 className="dev-name">Vic Andre D.</h3>
            <p className="dev-surname">Bacusmo</p>
          </div>

          <div className="dev-profile">
            <div className="dev-image-container">
              <img
                src={polDaveQ || "/placeholder.svg?height=200&width=200"}
                alt="Paul Dave Q. Binoya"
                className="dev-image"
              />
            </div>
            <h3 className="dev-name">Paul Dave Q.</h3>
            <p className="dev-surname">Binoya</p>
          </div>

          <div className="dev-profile">
            <div className="dev-image-container">
              <img
                src={martinJohn || "/placeholder.svg?height=200&width=200"}
                alt="Martin John V. Tabasa"
                className="dev-image"
              />
            </div>
            <h3 className="dev-name">Martin John V.</h3>
            <p className="dev-surname">Tabasa</p>
          </div>

          <div className="dev-profile">
            <div className="dev-image-container">
              <img
                src={DerickWayne || "/placeholder.svg?height=200&width=200"}
                alt="Derick Wayne A. Batucan"
                className="dev-image"
              />
            </div>
            <h3 className="dev-name">Derick Wayne A.</h3>
            <p className="dev-surname">Batucan</p>
          </div>

          <div className="dev-profile">
            <div className="dev-image-container">
              <img
                src={AngeloC || "/placeholder.svg?height=200&width=200"}
                alt="Angelo C. Quieta"
                className="dev-image"
              />
            </div>
            <h3 className="dev-name">Angelo C.</h3>
            <p className="dev-surname">Quieta</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default AdminAboutUs
