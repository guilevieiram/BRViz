import {useState, useRef, useEffect} from "react"
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Example from "./pages/Example";
import Modal from "./Modal";

/*
 * Insert all the routes/pages necessary for the main application 
 * and visualization.
 *
 * Follow the pattern given by the Example component.
*/
const routes = [
  {
    path: "example", 
    name: "Example",
    component: Example
  },
  {
    path: "example", 
    name: "Example number two",
    component: Example
  },
]

// HOC to wrap inner component in a full page.
const withPage = (Wrapped, openModal) => props => (
  <div className={`
    min-h-screen min-w-screen 
    flex flex-col items-center justify-start
    h-screen
    bg-gray-200 dark:bg-gray-800
    text-gray-800 dark:text-gray-200
  `}>
    {
      !openModal ? <></> :
      <button 
        onClick={openModal}
        className={`
          pt-16 py-4 px-24  
          text-xl bg-indigo-400 rounded-full
          -translate-y-1/2
          hover:scale-[1.02] transition-transform
        `}
      >EXPLORE</button>
    }
    <div className="h-full w-full flex items-center justify-center">
      <Wrapped {...props}/>
    </div>
  </div>
)

/**
 * Application entrypoint.
 *
 * Contains routing logic and renders the main components
 * */
export default function App() {
  const HomePage = withPage(Home);
  
  const [modal, setModal] = useState(false);
  const openModal = () => setModal(true);

  return (
      <BrowserRouter >
        <Modal isOpen={modal} onClose={()=>setModal(false)} routes={routes}/>
        <Routes>
          <Route path="/">
            <Route index element={<HomePage openModal={openModal}/>} />
            {
              routes.map(({path, component}, index) => {
                const Component = withPage(component, openModal);
                return <Route path={path} element={<Component />} key={index}/>
              })
            }
          </Route>
        </Routes>
      </BrowserRouter>
  )
}
