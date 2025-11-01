import React, { useRef, useState, useEffect, useContext } from "react";
import { IoLocationSharp } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import CaptainDetails from "../components/CaptainDetails";
import RidePopUp from "../components/RidePopUp";
import CaptainLiveTracking from "../components/CaptainLiveTracking";
import gsap from "gsap";
import axios from "../utils/axios";
import { useGSAP } from "@gsap/react";
import ConfirmRidePopUp from "../components/ConfirmRidePopUp";
import { SocketContext } from "../context/SocketContext";
import { CaptainDataContext } from "../context/CaptainContext";

const CaptainHome = () => {
  const [ridePanelPopUp, setRidepanelpoUp] = useState(false);
  const [confirmRidePanelPopUp, setConfirmRidepanelPopUp] = useState(false);
  const [ride, setRide] = useState(null);
  const ridePanelPopUpRef = useRef(null);
  const confirmRidePanelPopUpRef = useRef(null);

  const { captain } = useContext(CaptainDataContext);
  const { socket } = useContext(SocketContext);
  const [isLocationEnabled] = useState(true); // Always enable location tracking

  const navigate = useNavigate();
  // useEffect(() => {
  //   socket.emit("join", { userId: captain._id, userType: "captain" });

  //   const updateLocation = () => {
  //     if (navigator.geolocation) {
  //       navigator.geolocation.getCurrentPosition((position) => {
  //         console.log({ userId: captain   ._id, location: location });

  //         const location = {
  //           ltd: position.coords.latitude,
  //           lng: position.coords.longitude,
  //         };
  //         socket.emit("update-location-captain", {
  //           userId: captain._id,
  //           location: location,
  //         });
  //       });
  //     }
  //   };

  //   const locationInterval = setInterval(updateLocation, 10000); // update every 5 seconds
  //   updateLocation(); // initial call
  // });

  useEffect(() => {
    if (!captain || !captain._id) return; // Prevent error if captain is not loaded
    socket.emit("join", { userId: captain._id, userType: "captain" });
  }, [captain, socket]);

  useEffect(() => {
    if (!isLocationEnabled || !captain || !captain._id) return;

    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const location = {
            ltd: position.coords.latitude,
            lng: position.coords.longitude,
          };
          socket.emit("update-location-captain", {
            userId: captain._id,
            location: location,
          });
        });
      }
    };

    const locationInterval = setInterval(updateLocation, 10000);
    updateLocation();

    return () => clearInterval(locationInterval);
  }, [isLocationEnabled, captain, socket]);

  useEffect(() => {
    if (!socket) return;

    // Listen for new ride requests
    socket.on("new-ride-request", (data) => {
      console.log("New ride request received:", data);
      setRide(data.ride);
      // Show the ride request popup to the captain
      setRidepanelpoUp(true);
    });

    // Cleanup event listeners on unmount
    return () => {
      socket.off("new-ride-request");
    };
  }, [socket]);

  const [otpPanelOpen, setOtpPanelOpen] = useState(false);
  const [otp, setOtp] = useState("");

  async function confirmRide() {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/ride/confirm`,
        {
          rideId: ride._id,
          captainId: captain._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Store updated ride with OTP from response
      setRide(response.data);
      setRidepanelpoUp(false);
      setConfirmRidepanelPopUp(true);
      // Emit socket event to notify user
      socket.emit("ride-confirmed", { ride: response.data });
    } catch (error) {
      console.error("Failed to confirm ride:", error);
      alert(error.response?.data?.message || "Failed to confirm ride");
    }
  }

  async function startRide() {
    try {
      // Backend defines start-ride as GET with query params; use axios.get
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/ride/start-ride`,
        {
          params: {
            rideId: ride._id,
            otp: otp,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setOtpPanelOpen(false);
      setConfirmRidepanelPopUp(false);
      navigate("/captain-riding", { state: { ride } });

      // Emit socket event to notify user
      socket.emit("ride-started", { ride: response.data });
    } catch (error) {
      console.error("Failed to start ride:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to start ride";
      alert(errorMessage);

      // If OTP invalid, clear input for retry
      if (errorMessage.includes("OTP")) {
        setOtp("");
      }
    }
  }

  useEffect(() => {
    const panel = ridePanelPopUpRef.current;
    if (!panel) return;

    gsap.to(panel, {
      y: ridePanelPopUp ? 0 : "100%",
      duration: 0.3,
      ease: "power2.inOut",
    });
  }, [ridePanelPopUp]);

  return (
    <div className="h-screen">
      <div className="fixed p-3 top-0 flex items-center justify-between w-full">
        <img
          className="w-16"
          src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
          alt=""
        />
        <Link className="h-10 w-10 bg-white text-center justify-center rounded-full"></Link>
      </div>
      <div className="h-3/5">
        <CaptainLiveTracking />
      </div>

      <div className="h-2/5 p-6">
        <CaptainDetails />
      </div>

      {/* Ride Request Panel */}
      {ride && (
        <div
          ref={ridePanelPopUpRef}
          className="fixed w-full z-10 bottom-0 bg-white px-3 py-6 pt-12"
          style={{ transform: "translateY(100%)" }}
        >
          <RidePopUp
            ride={ride}
            confirmRide={confirmRide}
            setRidepanelpoUp={setRidepanelpoUp}
            setConfirmRidepanelPopUp={setConfirmRidepanelPopUp}
          />
        </div>
      )}

      {/* Confirm Ride Panel */}
      {confirmRidePanelPopUp && (
        <div className="fixed w-full z-20 bottom-0 bg-white px-3 py-6 pt-12">
          <ConfirmRidePopUp
            ride={ride}
            setConfirmRidepanelPopUp={setConfirmRidepanelPopUp}
            setRidepanelpoUp={setRidepanelpoUp}
            setOtpPanelOpen={setOtpPanelOpen}
          />
        </div>
      )}

      {/* OTP Panel */}
      {otpPanelOpen && (
        <div className="fixed w-full z-20 bottom-0 bg-white px-3 py-6 pt-12">
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-2">
              Enter OTP to Start Ride
            </h3>
            {ride?.otp && (
              <p className="text-base text-gray-600 mb-4">
                Ask the user for OTP: <strong>{ride.otp}</strong>
              </p>
            )}
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="w-full p-2 border rounded mb-4"
              maxLength="6"
            />
            <button
              onClick={startRide}
              className="w-full bg-black text-white py-2 rounded-lg"
              disabled={otp.length !== 6}
            >
              Start Ride
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaptainHome;
