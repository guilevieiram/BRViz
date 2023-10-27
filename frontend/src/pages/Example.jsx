import { useState, useEffect } from 'react'
import { ResponsiveGeoMap } from '@nivo/geo'
import * as worldCountries from "../../world_countries.json"

import { getData } from "../api"

export default function Example(){

  const [countries, setCountries] = useState([]);
  
  let startedFetching = false;
  useEffect(() => {

    if (startedFetching) return
    startedFetching = true;

    getData({
      tableName: "countries",
      columns: ["CO_PAIS", "CO_PAIS_ISON3"]
    }).then(data => {
      setCountries(data)
      console.log(data)
    });

  }, [])

  return (
    <div className=" h-full w-full flex flex-col items-center justify-start">
      <div className="h-[500px] w-[800px] ">
        <ResponsiveGeoMap
            features={worldCountries.features}
            borderWidth={0.5}
        />
      </div>
    </div>
  )
}
