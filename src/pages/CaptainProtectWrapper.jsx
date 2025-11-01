import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CaptainDataContext } from "../context/CaptainContext";
import axios from "../utils/axios";

const CaptainProtectWrapper = ({ children }) => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { captain, setCaptain } = useContext(CaptainDataContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/captainlogin");
    }
  }, [token]);
  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      navigate("/captainlogin");
      return;
    }

    const fetchProfile = async () => {
      try {
        console.log("Fetching captain profile...");
        const res = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/captain/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Profile response:", res.data);
        if (res.data?.captain) {
          setCaptain(res.data.captain);
        } else {
          console.error("No captain data in response");
          throw new Error("Invalid profile response");
        }
      } catch (err) {
        console.error(
          "Captain profile fetch error:",
          err?.response?.data || err
        );
        localStorage.removeItem("token");
        navigate("/captainlogin");
      } finally {
        setIsLoading(false);
      }
    };

    // Always fetch profile on mount to ensure fresh data
    fetchProfile();
  }, [token, navigate, setCaptain]);

  if (isLoading) {
    return <div>Loading....</div>;
  }

  return <>{children}</>;
};

export default CaptainProtectWrapper;
