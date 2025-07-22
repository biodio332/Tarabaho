"use client"

import "../styles/TrabahadorLogoutConfirmation.css"

const TrabahadorLogoutConfirmation = ({ onConfirm, onCancel }) => {
  return (
    <div className="logout-modal-overlay">
      <div className="logout-modal">
        <h2 className="logout-modal-title">ARE YOU SURE YOU WANT TO LOG OUT?</h2>

        <div className="logout-modal-actions">
          <button className="logout-confirm-button" onClick={onConfirm}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 17L21 12L16 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            LOG OUT
          </button>

          <button className="logout-cancel-button" onClick={onCancel}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  )
}

export default TrabahadorLogoutConfirmation