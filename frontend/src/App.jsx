import {useState, useRef, useEffect} from "react"
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Example from "./pages/Example";
import Bump from "./pages/Bump";
import CountriesVsTime from "./pages/CountriesVsTime";
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
    Component: Example
  },
  {
    path: "bump", 
    name: "Example of a bump plot",
    Component: Bump
  },
  {
    path: "cvt", 
    name: "Countries vs time",
    Component: CountriesVsTime
  },
]

/*
 * Page wrapper for any pages inside the main router.
 *
 */
const Page = ({openModal, children}) => (
  <div className={`
    min-h-screen min-w-screen 
    h-fit
    flex flex-col items-center justify-start
    h-screen
    bg-gray-200 dark:bg-gray-200
    text-gray-800 dark:text-gray-800
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
      {children}
    </div>
  </div>
)


/**
 * Application entrypoint.
 *
 * Contains routing logic and renders the main components
 * */
export default function App() {
  const [modal, setModal] = useState(false); // modal state

  return (
      <BrowserRouter >
        
        {!modal ? <></> :
          (<Modal 
            isOpen={modal} 
            onClose={() => setModal(false)} 
            routes={routes}
          />)
        }

        <Routes>
          <Route path="/">
            <Route index element={
              <Page > 
                <Home openModal={() => setModal(true)}/> 
              </Page>
            }/>

            {
              routes.map(({path, Component}, index) => (
                <Route path={path} key={index} element={
                  <Page openModal={() => setModal(true)}>
                    <Component/>
                  </Page>
                }/>
              ))
            }

          </Route>
        </Routes>
      </BrowserRouter>
  )
}
