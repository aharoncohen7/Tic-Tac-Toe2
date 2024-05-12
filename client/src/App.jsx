import { createContext, useEffect, useState } from "react"
import { MenuPage } from "./pages/MenuPage"
import { WelcomePage } from "./pages/WelcomePage"
import { ChoosePlayerPage } from "./pages/ChoosePlayerPage";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { PlayBoard } from "./pages/PlayBoard";
import { JoinGame } from "./pages/JoinGame";
import { Waiting } from "./pages/Waiting";
import io from 'socket.io-client';
import { PlayBoardSolo } from "./pages/‏‏PlayBoardSolo";
import { Setting } from "./pages/Setting";
const socket = io('http://localhost:3000', {autoConnect: false});

export const PlayerContext = createContext(io())

const router = createBrowserRouter([
  {
    path: "/",
    element: <MenuPage />,
  },
  {
    path: "joingame",
    element: <JoinGame />,
  },
  {
    path: "waiting",
    element: <Waiting />,
  },
  {
    path: "setting",
    element: <Setting />,
  },
  {
    path: "chooseplayer",
    element: <ChoosePlayerPage />,
  },
  {
    path: "playboard",
    element: <PlayBoard />,
  },
  {
    path: "playboardsolo",
    element: <PlayBoardSolo />,
  },
]);


function App() {
  const [player, setPlayer] = useState({play:null, status: null});

  useEffect(()=>{
    return ()=> socket.disconnect() }, [])
  
  return (
    <PlayerContext.Provider value={{ player, setPlayer , socket}}>
        <RouterProvider router={router} />
    </PlayerContext.Provider>
  )
}

export default App
