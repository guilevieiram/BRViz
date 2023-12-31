import { useState, useEffect } from 'react'
import { ResponsiveStream } from '@nivo/stream'
import { ResponsiveGeoMap } from '@nivo/geo'
import { getData } from "../api"

import ncm from "../ncm_ing.json"
import * as worldCountries from "../../world_countries.json"

const sum = arr => arr.reduce((acc, cur) => acc + cur, 0)
const years = Array.from({ length: 2023 - 1997 + 1 }, (_, i) => i + 1997)

const fetchData = ({
  setData,
  setKeys,
  country,
  onError,
}) => {
  getData({
    tableName: "exports",
    columns: ["CO_ANO", "CO_NCM_0", "KG_LIQUIDO"],
    format: "json",
    aggregate: "KG_LIQUIDO",
    filterColumn: "CO_PAIS",
    filterValue: `${parseFloat(country)}`
  }).then(data => {

    if(!data.length) {
      alert(`No information available for this country.`, )
      onError();
      return 
    }

    const byYear = years.map(y => ({}))

    data.forEach(row => {
      const year = row.CO_ANO;
      const code = row.CO_NCM_0;
      const weight = row.KG_LIQUIDO;
      byYear[parseInt(year) - 1997][code] = weight
    })

    const tenMost = Object.entries(byYear.slice(-1)[0])
      .map(([key, val]) => ({key, val}))
      .sort((a, b) => a.val - b.val)
      .reverse()
      .slice(0, 5)
      .map(({key}) => key)
      
    const byYearFiltered = byYear
      .map(y => tenMost 
        .reduce((cur, key) => { 
          return Object.assign(cur, { [ncm[key]]: parseInt(y[key] || 0) })
        }, {})
      )

    setKeys(tenMost.map(key => ncm[key]))
    setData(byYearFiltered)
  });
}

export default function WeightOverTimeByCountry(){

  const [data, setData] = useState([]);
  const [keys, setKeys] = useState([]);
  const [country, setCountry] = useState(null);
  const [countryName, setCountryName] = useState(null);
  const [countries, setCountries] = useState(null);
  const [countriesNames, setCountriesNames] = useState(null);
  const onError = () => setCountry(null);

  const boxWidth = 1000 / (years.length - 1); 
  let startedFetching = false;
  useEffect(() => {
    if (startedFetching) return
    startedFetching = true;

    getData({
      tableName: "countries",
      columns: ["CO_PAIS", "NO_PAIS_ING", "CO_PAIS_ISOA3"],
      format: "json",
    }).then(data => {
      const countryMap = {};
      const countryNamesMap = {};

      data.reverse().forEach(({CO_PAIS_ISOA3, NO_PAIS_ING, CO_PAIS}) => {
        countryMap[CO_PAIS_ISOA3] = CO_PAIS;
        countryNamesMap[CO_PAIS_ISOA3] = NO_PAIS_ING;
      });

      setCountries(countryMap)
      setCountriesNames(countryNamesMap)
    })

  }, [])

  useEffect(() => {
    if (!country) return 
    fetchData({setData, setKeys, country, onError});
  }, [country])

  if (!countries) return <></>
  return (
    <div className=" h-full w-full flex flex-col items-center justify-start">
    
    {
      !country

      ?<>
        <h1>Choose your country:</h1>
        <div className="h-[500px] w-[1000px] mt-6">
          <ResponsiveGeoMap
            features={worldCountries.features}
            borderWidth={0.5}
            fillColor="#fff"
            borderColor="#000"
            enableGraticule={true}
            graticuleLineColor="#666666"
            projectionType="equalEarth"
            projectionScale={180}
            onClick={data => {
              setCountry(countries[data.id])
              setCountryName(countriesNames[data.id])
            }}
          />
        </div>
      </>
      
      :<>
        
        <div className="text-center">
          <h1>{countryName}</h1>
          <button 
            onClick={() => {
              setCountry(null)
              setCountryName(null)
            }}
            className="bg-indigo-700 text-white py-2 px-6 rounded-lg text-xl"
          >⬅</button>
        </div>
        <div className="h-[400px] w-[1000px] mb-4">
          <ResponsiveStream
            data={data} 
            keys={keys}
            width={1000}
            height={400}
            enableGridX={true}
            enableGridY={true}
            offsetType="silhouette"
            colors={{ scheme: 'nivo' }}
            axisBottom={{
              orient: 'bottom',
              tickPadding: 5,
            }}
            axisLeft={{
              orient: 'left',
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: '',
              legendOffset: -40
            }}
            />
        </div>
        <div style={{
          width: `${1000 + boxWidth}px`,
          marginLeft: `${boxWidth}px`
        }} className="flex flex-row justify-around">
          {years.map(
            (year, idx) => <p key={idx} style={{
              width: `${boxWidth}px`,
              transform: `translate(${-boxWidth/2}px, 0px)`
            }} className="text-center text-lg">{year}</p>
          )}
        </div>
      </>
    }
    </div>
  )

}
