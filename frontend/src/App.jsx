import {useState, useRef, useEffect} from "react"
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Modal from "./Modal";
import Home from "./pages/Home";
import Example from "./pages/Example";
<<<<<<< HEAD
import CategoryOverTime from "./pages/CategoryOverTime";
import CountriesVsTime from "./pages/CountriesVsTime";
import WeightOverTimeByCountry from "./pages/WeightOverTimeByCountry";
import HeatProductCountry from "./pages/HeatProductCountry";
import HeatTransportCountry from "./pages/HeatTransportCountry";
import BarCountryProduct from "./pages/BarCountryProduct";
import SunburstPage from "./pages/SunburstPage";
=======
import Sunburst from "./pages/Sunburst";
>>>>>>> c3537e2 (swarmplot started)
import Bump from "./pages/Bump";
import Swarm from "./pages/Swarm";
import cloroPleth from "./pages/ChoroPleth";
import Modal from "./Modal";

/*
 * Insert all the routes/pages necessary for the main application 
 * and visualization.
 *
 * Follow the pattern given by the Example component.
*/
const routes = [
  {
    path: "category-over-time", 
    name: "Categories Over time",
    Component: CategoryOverTime
  },
  {
    path: "countries-over-time", 
    name: "Countries Over time",
    Component: CountriesVsTime
  },
  {
    path: "weight-over-time",
    name: "Weight over Time by Country", 
    Component: WeightOverTimeByCountry , 
  },
  {
    path: "heat-product-country",
    name: "Product by Country Heatmap", 
    Component: HeatProductCountry, 
  },
  {
    path: "heat-transport-country",
    name: "Transportation by Country Heatmap", 
    Component: HeatTransportCountry, 
  },
  {
    path: "bar-country-product",
    name: "Bar plot by Country and Product", 
    Component: BarCountryProduct, 
    path: "bump", 
    name: "Example of a bump plot",
    Component: Bump
  },
  {
    path: "sunburst",
    name: "Repartition of the exports by year and category",
    Component: Sunburst
  },
  {
    path : "swarm",
    name: "Example of a swarm plot",
    Component: Swarm
  },
  {
    path : "choropleth",
    name: "Example of a choropleth plot",
    Component: cloroPleth
  }
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
