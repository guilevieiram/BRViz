import { useState, useEffect } from 'react'
import { ResponsiveGeoMap } from '@nivo/geo'
import * as worldCountries from "../../world_countries.json"
import YearSlider from './YearSlider'
import "./Styles.css"

import { getData } from "../api"

export default function Example(){

  const [exports, setExports] = useState([]);
  
  let startedFetching = false;
  useEffect(() => {

    if (startedFetching) return
    startedFetching = true;

    getData({
      tableName: "exports",
      columns: ["CO_ANO", "CO_MES", "CO_NCM", "KG_LIQUIDO"],
      format: "json"
    }).then(data => {
      setExports(data)
      console.log(data)
    });

  }, [])

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleYearChange = (event) => {
      setSelectedYear(event.target.value);
  };

  return (
    <div className=" h-full w-full flex flex-col items-center justify-start">
      <div className="h-[500px] w-[800px] ">
        <ResponsiveGeoMap
            features={worldCountries.features}
            borderWidth={0.5}
        />
        <YearSlider 
            selectedYear={selectedYear} 
            handleYearChange={handleYearChange} 
        />
      </div>
    </div>
  )
}
