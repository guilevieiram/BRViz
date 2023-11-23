import {useState, useRef, useEffect} from "react"
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Modal from "./Modal";
import Home from "./pages/Home";
import CategoryOverTime from "./pages/CategoryOverTime";
import CountriesVsTime from "./pages/CountriesVsTime";
import WeightOverTimeByCountry from "./pages/WeightOverTimeByCountry";
import HeatProductCountry from "./pages/HeatProductCountry";
import HeatTransportCountry from "./pages/HeatTransportCountry";
import BarCountryProduct from "./pages/BarCountryProduct";
import Sunburst from "./pages/Sunburst";
import Bump from "./pages/Bump";
import Swarm from "./pages/Swarm";
import ChoroPleth from "./pages/ChoroPleth";

/*
 * Insert all the routes/pages necessary for the main application 
 * and visualization.
 *
 * Follow the pattern given by the Example component.
*/
const routes = [
  {
    path: "category-over-time", 
    name: "Category Stratification Over time",
    Component: CategoryOverTime
  },
  {
    path: "countries-over-time", 
    name: "Countries Commerce Over time",
    Component: CountriesVsTime
  },
  {
    path: "weight-over-time",
    name: "Weight Over Time Stratified by Country", 
    Component: WeightOverTimeByCountry , 
  },
  {
    path: "heat-product-country",
    name: "Heatmap of Product by Country", 
    Component: HeatProductCountry, 
  },
  {
    path: "heat-transport-country",
    name: "Heatmap of Transportation by Country", 
    Component: HeatTransportCountry, 
  },
  {
    path: "bar-country-product",
    name: "Bar plot by Country and Product", 
    Component: BarCountryProduct, 
  },
  {
    path: "sunburst",
    name: "Repartition of the Exports by Year and category",
    Component: Sunburst
  },
  {
    path : "swarm",
    name: "Transports per Category by Year",
    Component: Swarm
  },
  {
    path : "choropleth",
    name: "Exports on the Globe by year",
    Component: ChoroPleth
  }
]

/*
 * Page wrapper for any pages inside the main router.
 *
 */
const Page = ({openModal, children}) => (
  <div className={`
    min-h-screen min-w-screen 
    flex flex-col items-center justify-start
    text-gray-800 dark:text-gray-800
    overflow-x-none
    overflow-y-none
    bg-gradient-to-br from-indigo-100 to-blue-200
  `}>
    {
      !openModal ? <></> :
      <button 
        onClick={openModal}
        className={`
          pt-16 py-4 px-24  
          text-white
          text-xl bg-indigo-700 rounded-full
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
