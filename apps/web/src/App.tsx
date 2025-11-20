import { Route, Routes } from "react-router-dom";
import { LandingPage } from "./routes/LandingPage";
import { RoomPage } from "./routes/RoomPage";
import { WinnerPage } from "./routes/WinnerPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/r/:roomId" element={<RoomPage />} />
      <Route path="/w/:roomId/:playerId" element={<WinnerPage />} />
    </Routes>
  );
}

export default App
