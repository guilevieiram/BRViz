import { useState, useEffect } from 'react'
import { ResponsiveGeoMap } from '@nivo/geo'
import * as worldCountries from "../../world_countries.json"

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
