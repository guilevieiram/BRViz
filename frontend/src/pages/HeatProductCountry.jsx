import * as d3 from 'd3';
import { useState, useEffect } from 'react'
import { ResponsiveHeatMap } from '@nivo/heatmap'

import { getData } from "../api"

import ncm from "../ncm_ing.json"

export default function hearProductCountry(){
  const [exports, setExports] = useState([]);

  const logScale = d3.scaleLog()
    .domain([1e4, 1e11]) 
    .range([0, 1]);
  const colorScale = d3.scaleSequential(d3.interpolateBlues)
    .domain([0, 1]);
  const scale = value => colorScale(logScale(value));

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
        .sort((a, b) => a[0] - b[0])
        .reverse()
        .slice(0, 10)
        .map(([kg, cat]) => cat)

      const filteredData =  dataFilteredByCountry
        .filter(({CO_NCM_0}) => tenMostCategories.includes(CO_NCM_0))

      const heatmap = tenMostCountries.map(country => ({
        id: countryNamesMap[country],
        data: tenMostCategories.map(category => {
          const line = filteredData.find(({CO_PAIS, CO_NCM_0}) => 
            CO_PAIS == country && CO_NCM_0 == category);

          return {
            x: ncm[category],
            y: line ? parseFloat(line.KG_LIQUIDO) : 0,
          };
        })
      }));

      setExports(heatmap);
    });

  }, [])

  return (
    <div className=" h-full w-full flex flex-col items-center justify-start">
      <div className="h-[500px] w-[1000px] ">
        <ResponsiveHeatMap
            data={exports}
            margin={{ top: 200, right: 90, bottom: 60, left: 90 }}
            valueFormat=">-.2s"
            axisTop={{
                tickSize: 5,
                tickPadding: 10,
                tickRotation: -50,
                legend: '',
                legendOffset: 46
            }}
            axisRight={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Country',
                legendPosition: 'middle',
                legendOffset: 70
            }}
            axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Country',
                legendPosition: 'middle',
                legendOffset: -72
            }}
            colors={({value}) => {
              return scale(value+1)
            }}
            emptyColor="#555555"
            legends={[
                {
                    anchor: 'bottom',
                    translateX: 0,
                    translateY: 30,
                    length: 400,
                    thickness: 8,
                    direction: 'row',
                    tickPosition: 'after',
                    tickSize: 3,
                    tickSpacing: 4,
                    tickOverlap: false,
                    tickFormat: '>-.2s',
                    title: 'Log( Weight[KG] )  →',
                    titleAlign: 'start',
                    titleOffset: 4
                }
            ]}
        />
      </div>
    </div>
  )
}
