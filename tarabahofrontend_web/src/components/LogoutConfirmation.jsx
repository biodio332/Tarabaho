"use client"

const LogoutConfirmation = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 w-[90%] max-w-[500px] shadow-xl text-center border-3 border-[#0078ff]">
        <h2 className="text-2xl font-bold mb-8 text-gray-800">ARE YOU SURE YOU WANT TO LOG OUT?</h2>

        <div className="flex justify-center gap-8">
          <button
            className="flex items-center gap-2 bg-white text-[#ff3b30] border border-[#ff3b30] rounded px-8 py-3 font-semibold text-base cursor-pointer transition-all hover:bg-[#fff0f0]"
            onClick={onConfirm}
          >
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

          <button
            className="bg-white text-[#0078ff] border border-[#0078ff] rounded px-8 py-3 font-semibold text-base cursor-pointer transition-all hover:bg-[#f0f7ff]"
            onClick={onCancel}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  )
}

export default LogoutConfirmation
