// src/components/VerifyEmail.jsx
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    // If no token or email → invalid link
    if (!token || !email) {
      alert("Invalid or missing verification link.");
      navigate("/signin");
      return;
    }

    // Call your backend API (still on Render, but user never sees it)
    axios
      .get("https://tarabaho-backend.onrender.com/api/graduate/verify-email", {
        params: { token, email },
        withCredentials: true, // important if you use HttpOnly cookies later
      })
      .then((res) => {
        alert("Email verified successfully! You can now log in.");
        navigate("/signin?verified=true");
      })
      .catch((err) => {
        const msg =
          err.response?.data?.message || "Verification failed. Link may be expired.";
        alert(msg);
        navigate("/signin");
      });
  }, [token, email, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f9fafb",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px 50px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          textAlign: "center",
          maxWidth: "400px",
        }}
      >
        <h2 style={{ margin: "0 0 16px 0", color: "#1f2937" }}>
          Verifying your email...
        </h2>
        <p style={{ color: "#6b7280", marginBottom: "24px" }}>
          Please wait while we confirm your account.
        </p>
        <div
          style={{
            border: "4px solid #e5e7eb",
            borderTop: "4px solid #3b82f6",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            animation: "spin 1s linear infinite",
            margin: "0 auto",
          }}
        />
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default VerifyEmail;