import * as d3 from 'd3';
import { useState, useEffect } from 'react'
import { ResponsiveBar } from '@nivo/bar'

import { getData } from "../api"

import ncm from "../ncm_ing.json"

export default function BarCountryProduct(){

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [keys, setKeys] = useState([]);
  const [filteredKeys, setFilteredKeys] = useState([]);
  const [maxValue, setMaxValue] = useState(null);


  const getOrderOfMagnitude = number => 
    number === 0 ? 0: Math.floor(Math.log10(Math.abs(number)))

  useEffect(() => {
    const max = data
      .map(obj => filteredKeys
        .reduce((acc, cur) => acc + obj[cur], 0)
      )
      .reduce((acc, cur) => Math.max(acc, cur), 0)
    const orderOfMagnitude = getOrderOfMagnitude(max);
    const newData = data.map(obj => {
      const newObject = {country: obj.country}
      filteredKeys.forEach(key => {
        newObject[key] = (obj[key] * Math.pow(10, - orderOfMagnitude)).toFixed(2)
      })
      return newObject
    })

    setFilteredData(newData)
    setMaxValue(max)

  }, [filteredKeys])

  let startedFetching = false;
  useEffect(() => {

    if (startedFetching) return
    startedFetching = true;

    Promise.all([
      getData({
        tableName: "countries",
        columns: ["CO_PAIS", "NO_PAIS_ING", "CO_PAIS_ISOA3"],
        format: "json",
      }),
      getData({
        tableName: "exports",
        columns: ["CO_PAIS", "CO_NCM_0", "KG_LIQUIDO"],
        aggregate: "KG_LIQUIDO",
        format: "json"
      }),
    ]).then(([countriesData, exportData]) => {
      const countryNamesMap = {};
      countriesData.reverse().forEach(({CO_PAIS_ISOA3, NO_PAIS_ING, CO_PAIS}) => {
        countryNamesMap[parseFloat(CO_PAIS)] = CO_PAIS_ISOA3;
      });

      const aggCountry = {};
      exportData.forEach(({CO_PAIS}) => aggCountry[`${CO_PAIS}`] = 0)
      exportData.forEach(({CO_PAIS, KG_LIQUIDO}) => 
        aggCountry[CO_PAIS] += parseFloat(KG_LIQUIDO)
      )

      const tenMostCountries = Object.entries(aggCountry)
        .map(([country, kg]) => [kg, country])
        .sort((a, b) => a[0] - b[0])
        .reverse()
        .slice(0, 10)
        .map(([kg, country]) => country)

      const dataFilteredByCountry = exportData
        .filter(({CO_PAIS}) => tenMostCountries.includes(CO_PAIS))

      const aggCategory = {};
      exportData.forEach(({CO_NCM_0}) => aggCategory[CO_NCM_0] = 0)
      exportData.forEach(({CO_NCM_0, KG_LIQUIDO}) => 
        aggCategory[CO_NCM_0] += parseFloat(KG_LIQUIDO)
      )

      const tenMostCategories = Object.entries(aggCategory)
        .map(([cat, kg]) => [kg, cat])
        .sort()
        .reverse()
        .slice(0, 10)
        .map(([kg, cat]) => cat)

      const convertCategoryName = category => 
        ncm[category] || ncm[category + "00"] || ncm[category + "0000"] || category;

      const filteredData =  dataFilteredByCountry
        .filter(({CO_NCM_0}) => tenMostCategories.includes(CO_NCM_0))
    
      const preBar = {}
      tenMostCountries.forEach(country => {
        preBar[country] = {}
        tenMostCategories.forEach(category => preBar[country][category] = 0)
      })
      filteredData.forEach(({CO_NCM_0, CO_PAIS, KG_LIQUIDO}) => {
        preBar[CO_PAIS][CO_NCM_0] += parseFloat(KG_LIQUIDO)
      })

      const keys = tenMostCategories.map(convertCategoryName)

      const bar = tenMostCountries.map( country => {
        const line = {country: countryNamesMap[country]}
        tenMostCategories.forEach(category => {
          const catName = convertCategoryName(category)
          line[catName] = preBar[country][category]
        })
        return line
      })
        
      setData(bar);
      setFilteredData(bar);

      setKeys(keys);
      setFilteredKeys(keys);
    });

  }, [])

  return (
    <div className=" h-full w-full flex flex-col items-center justify-start">
      <div className="h-[500px] w-[1000px] ">
        <ResponsiveBar
            data={filteredData}
            keys={keys}
            indexBy="country"
            margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
            padding={0.3}
            valueScale={{ type: 'linear' }}
            indexScale={{ type: 'band', round: true }}
            colors={{ scheme: 'category10' }}
            borderColor={{
                from: 'color',
                modifiers: [
                    [
                        'darker',
                        1.6
                    ]
                ]
            }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Country',
                legendPosition: 'middle',
                legendOffset: 32
            }}
            axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: `Product (1e${getOrderOfMagnitude(maxValue)} KG)`,
                legendPosition: 'middle',
                legendOffset: -40
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{
                from: 'color',
                modifiers: [
                    [
                        'darker',
                        1.6
                    ]
                ]
            }}
            legends={[
                {
                    onClick: ({id}) => {
                      if(filteredKeys.includes(id))
                        setFilteredKeys(filteredKeys.filter(
                          key => key !== id
                        ))
                      else
                        setFilteredKeys([id, ...filteredKeys])
                    },
                    dataFrom: 'keys',
                    anchor: 'top-right',
                    direction: 'column',
                    justify: false,
                    translateX: 120,
                    translateY: 0,
                    itemsSpacing: 2,
                    itemWidth: 300,
                    itemHeight: 20,
                    itemDirection: 'left-to-right',
                    itemOpacity: 0.85,
                    symbolSize: 20,
                    effects: [
                        {
                            on: 'hover',
                            style: {
                                itemOpacity: 1,
                            }
                        },
                    ]
                }
            ]}
            role="application"
            ariaLabel="Nivo bar chart demo"
            barAriaLabel={e=>e.id+": "+e.formattedValue+" in country: "+e.indexValue}
        />
      </div>
    </div>
  )
}
