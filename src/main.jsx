import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { UserDataProvider } from "./context/UserContext.jsx";
import CaptainContext from "./context/CaptainContext.jsx";
import SocketProvider from "./context/SocketContext.jsx";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CaptainContext>
      <BrowserRouter>
        <SocketProvider>
          <UserDataProvider>
            <App />
          </UserDataProvider>
        </SocketProvider>
      </BrowserRouter>
    </CaptainContext>
  </StrictMode>
);
