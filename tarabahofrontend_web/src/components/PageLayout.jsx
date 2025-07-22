import UserNavbar from "./UserNavbar"
import AdminNavbar from "./AdminNavbar"
import Footer from "./Footer"

const PageLayout = ({ children, userType = "user" }) => {
  return (
    <div className="page-layout">
      {userType === "admin" ? <AdminNavbar /> : <UserNavbar />}
      <main className="page-content">{children}</main>
      <Footer />
    </div>
  )
}

export default PageLayout
