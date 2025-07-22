"use client"

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import UserNavbar from "../components/UserNavbar";
import Footer from "../components/Footer";
import "../styles/WorkerProfileDetail.css";
import { FaStar, FaRegStar, FaBookmark } from "react-icons/fa";

import martinJohnTImg from "../assets/images/martin.png";
import edreyVImg from "../assets/images/edreyval.png";
import jieRImg from "../assets/images/polbin1.png";
import kentMImg from "../assets/images/kent m.png";

const WorkerProfileDetail = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [worker, setWorker] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [similarWorkers, setSimilarWorkers] = useState([]);
  const [error, setError] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // Use Vite environment variable

  useEffect(() => {
    const fetchWorkerData = async () => {
      setError("");
      try {
        console.log(`Fetching worker details for ID: ${workerId}`);
        const workerResponse = await axios.get(`${BACKEND_URL}/api/worker/${workerId}`, {
          withCredentials: true,
        });
        console.log("Worker response:", workerResponse.data);
        const fetchedWorker = workerResponse.data;

        const workerData = {
          id: fetchedWorker.id ?? 0,
          firstName: fetchedWorker.firstName ?? "Unknown",
          lastName: fetchedWorker.lastName ?? "Worker",
          profilePicture: fetchedWorker.profilePicture ?? "/placeholder.svg?height=300&width=300",
          stars: fetchedWorker.stars ?? 0,
          hourly: fetchedWorker.hourly ?? 0,
          birthday: fetchedWorker.birthday ?? "N/A",
          email: fetchedWorker.email ?? "N/A",
          address: fetchedWorker.address ?? "N/A",
          contactNo: fetchedWorker.phoneNumber ?? "N/A",
          description: fetchedWorker.biography ?? "No description available.",
          services: fetchedWorker.categories?.map(category => category.name) ?? [],
        };
        setWorker(workerData);
      } catch (workerErr) {
        console.error("Failed to fetch worker:", workerErr);
        setError(
          workerErr.response?.status === 401
            ? "Your session has expired. Please log in again."
            : workerErr.response?.data?.replace("⚠️ ", "") || "Failed to load worker details. Please try again."
        );
        if (workerErr.response?.status === 401) {
          console.log("Redirecting to login due to 401 error for worker");
          navigate("/login");
        }
        return;
      }

      try {
        console.log(`Fetching ratings for worker ID: ${workerId}`);
        const ratingsResponse = await axios.get(`${BACKEND_URL}/api/rating/worker/${workerId}`, {
          withCredentials: true,
        });
        console.log("Ratings response:", ratingsResponse.data);
        const fetchedRatings = ratingsResponse.data;
        const ratingsData = fetchedRatings.map(rating => {
          console.log("Processing rating:", rating);
          return {
            id: rating.id ?? 0,
            user: `${rating.user?.firstname ?? "Anonymous"} ${rating.user?.lastname ?? ""}`,
            userImage: rating.user?.profilePicture ?? getUserImage(rating.user?.firstname ?? "default"),
            rating: rating.rating ?? 0,
            comment: rating.comment ?? "No comment provided.",
          };
        });
        setRatings(ratingsData);
      } catch (ratingsErr) {
        console.error("Failed to fetch ratings:", ratingsErr);
        setRatings([]);
      }

      try {
        console.log(`Fetching similar workers for ID: ${workerId}`);
        const similarResponse = await axios.get(`${BACKEND_URL}/api/worker/${workerId}/similar`, {
          withCredentials: true,
        });
        console.log("Similar workers response:", similarResponse.data);
        const fetchedSimilarWorkers = similarResponse.data;
        const similarWorkersData = fetchedSimilarWorkers.map(similarWorker => ({
          id: similarWorker.id ?? 0,
          name: `${similarWorker.firstName ?? "Unknown"} ${similarWorker.lastName ?? "Worker"}`,
          image: similarWorker.profilePicture ?? "/placeholder.svg?height=150&width=150",
          stars: similarWorker.stars ?? 0,
          hourly: similarWorker.hourly ?? 0,
          description: similarWorker.biography ?? "No description available.",
        }));
        setSimilarWorkers(similarWorkersData);
      } catch (similarErr) {
        console.error("Failed to fetch similar workers:", similarErr);
        setSimilarWorkers([]);
      }

      try {
        console.log(`Fetching bookmark status for worker ID: ${workerId}`);
        const bookmarkResponse = await axios.get(`${BACKEND_URL}/api/bookmarks/worker/${workerId}`, {
          withCredentials: true,
        });
        console.log("Bookmark status:", bookmarkResponse.data);
        setIsBookmarked(bookmarkResponse.data);
      } catch (bookmarkErr) {
        console.error("Failed to fetch bookmark status:", bookmarkErr);
        setIsBookmarked(false);
      }
    };

    fetchWorkerData();
  }, [workerId, navigate]);

  const getUserImage = (firstName) => {
    switch (firstName.toLowerCase()) {
      case "martin":
        return martinJohnTImg;
      case "edrey":
        return edreyVImg;
      case "jie":
        return jieRImg;
      case "kent":
        return kentMImg;
      default:
        return "/placeholder.svg?height=50&width=50";
    }
  };

  const renderStars = (rating = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? <FaStar key={i} className="star-filled" /> : <FaRegStar key={i} className="star-empty" />
      );
    }
    return stars;
  };

  const handleBookNow = () => {
    navigate(`/booking/${workerId}/payment`, {
      state: { selectedCategory: location.state?.selectedCategory },
    });
  };

  const toggleBookmark = async () => {
    try {
      console.log(`Toggling bookmark for worker ID: ${workerId}`);
      const response = await axios.post(
        `${BACKEND_URL}/api/bookmarks/worker/${workerId}`,
        {},
        {
          withCredentials: true,
        }
      );
      console.log("Bookmark toggle response:", response.data);
      setIsBookmarked(response.data);
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  const handleSelectWorker = (workerId) => {
    navigate(`/worker-profile-detail/${workerId}`, {
      state: { selectedCategory: location.state?.selectedCategory },
    });
  };

  if (error) {
    return (
      <div className="page-container">
        <UserNavbar activePage="user-browse" />
        <div className="content-container">
          <div className="error-message">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="page-container">
        <UserNavbar activePage="user-browse" />
        <div className="content-container">
          <div className="loading">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="worker-profile-detail-page">
      <UserNavbar activePage="user-browse" />
      <div className="worker-profile-hero">
        <div className="worker-profile-container">
          <div className="worker-profile-header">
            <div className="worker-image-container">
              <img
                src={worker.profilePicture}
                alt={`${worker.firstName} ${worker.lastName}`}
                className="worker-image"
              />
            </div>
            <div className="worker-info">
              <div className="worker-name-bookmark">
                <h1>
                  {worker.firstName} {worker.lastName}
                </h1>
                <button
                  className={`bookmark-button ${isBookmarked ? "bookmarked" : ""}`}
                  onClick={toggleBookmark}
                  aria-label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
                >
                  <FaBookmark />
                </button>
              </div>
              <p className="worker-description">{worker.description}</p>
              <div className="worker-rating">{renderStars(worker.stars)}</div>
              <div className="worker-rate">₱{worker.hourly.toFixed(2)}/hour</div>
              <div className="worker-services">
                {worker.services.map((service, index) => (
                  <span key={index} className="service-tag">
                    {service}
                  </span>
                ))}
              </div>
              <button className="book-now-button" onClick={handleBookNow}>
                Book Now
              </button>
            </div>
            <div className="personal-info-box">
              <h3>Personal Information</h3>
              <div className="info-item">
                <span className="info-label">Birthday:</span>
                <span className="info-value">{worker.birthday}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{worker.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Address:</span>
                <span className="info-value">{worker.address}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Contact no.:</span>
                <span className="info-value">{worker.contactNo}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="worker-profile-content">
        <div className="worker-profile-container">
          <div className="reviews-section">
            <h2 className="section-title">
              <span className="icon">≡</span> Reviews
            </h2>
            {ratings.length > 0 ? (
              <div className="reviews-grid">
                {ratings.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="reviewer-info">
                      <img
                        src={review.userImage}
                        alt={review.user}
                        className="reviewer-image"
                      />
                      <div className="reviewer-details">
                        <div className="reviewer-name">{review.user}</div>
                        <div className="reviewer-rating">{renderStars(review.rating)}</div>
                      </div>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No reviews yet.</p>
            )}
          </div>
          <div className="similar-workers-section">
            <h2 className="section-title">Similar people</h2>
            {similarWorkers.length > 0 ? (
              <div className="similar-workers-grid">
                {similarWorkers.map((similarWorker) => (
                  <div key={similarWorker.id} className="similar-worker-card">
                    <div className="similar-worker-image-container">
                      <img
                        src={similarWorker.image}
                        alt={similarWorker.name}
                        className="similar-worker-image"
                      />
                    </div>
                    <div className="similar-worker-rating">{renderStars(similarWorker.stars)}</div>
                    <p className="similar-worker-description">{similarWorker.description}</p>
                    <div className="similar-worker-rate">₱{similarWorker.hourly.toFixed(2)}/hour</div>
                    <button className="select-worker-btn" onClick={() => handleSelectWorker(similarWorker.id)}>
                      Select
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No similar workers found.</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WorkerProfileDetail;