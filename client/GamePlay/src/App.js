import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import PlayMe from "./PlayMe";
import Buy from "./Buy";
import Select from "./Select";
import LeaderBoard from "./LeaderBoard";
import Profile from "./Profile";
import Marketplace from "./Marketplace";
import LobbyPage from "./LobbyPage";

const App = () => {
    const [importedData, setImportedData] = useState(null);

    // Callback function to receive imported data from Select
    const handleImportedData = (data) => {
        console.log("not yet");
        setImportedData(data);
        console.log("setImportedData", data);
    };

    return (
        <>
          
          <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/buy" element={<Buy />} /> */}
            

            <Route path="/leaderBoard" element={<LeaderBoard/> } />
            <Route path="/profile" element={<Profile/> } />
            <Route path="/marketplace" element={<Marketplace/> } />
            <Route path="/lobby" element={<LobbyPage/> } />
            
    
            {/* Pass imported data to PlayMe */}
            <Route
              path="/play-me"
              element={<PlayMe importedData={importedData}/>}
            />
    
            {/* Render Select component and provide the callback */}
            {/* <Route
              path="/import"
              element={<Select onFileUpload={handleImportedData} />}
            /> */}
          </Routes>
        </>
      );

}

export default App;