
import { useState, useEffect } from 'react'
import {  ResponsiveAreaBump } from '@nivo/bump'

import { getData } from "../api"

const sum = arr => arr.reduce((acc, cur) => acc + cur, 0)
const fetchData = ({
  setData,
  countries,
}) => {

  getData({
    tableName: "exports",
    columns: ["CO_ANO", "KG_LIQUIDO", "CO_PAIS"],
    format: "json",
    aggregate: "KG_LIQUIDO",
  }).then(data => {

    const years = Array.from({ length: 2023 - 1997 + 1 }, (_, i) => i + 1997)

    const byKey = data
      .reduce(
        (acc, cur) => ({...acc, [cur.CO_PAIS]: []}), 
        {}
      )

    data.forEach(
      d => {
        byKey[d.CO_PAIS] = [{
          x: d.CO_ANO,
          y: parseInt(d.KG_LIQUIDO)
        }, ...byKey[d.CO_PAIS]]
      }
    )

    const onArray = Object.entries(byKey)
      .reduce(
        (acc, [id, data]) => [...acc, {id, data}]
        , [])
      .sort(
        (a, b) => 
          sum(a.data.map(d=>d.y))
          - sum(b.data.map(d=>d.y))
      )
      .reverse()
      .slice(0, 10)
      .map(({id, data}) => ({
        id: id,
        data: years.map(year => 
          data.find(d => d.x === `${year}`) || {x: `${year}`, y: 0}
        )
      }))
      .map(({id, data}) => ({
        id: countries[id] || id,
        idx: id,
        data: data.sort((a, b) => 
          parseInt(a.x) - parseInt(b.x)
        )
      }))

    setData(onArray)
  });
}

export default function CountriesVsTime(){

  const [data, setData] = useState([]);

  let startedFetching = false;
  useEffect(() => {
    if (startedFetching) return
    startedFetching = true;
    getData({
      tableName: "countries",
      columns: ["CO_PAIS", "CO_PAIS_ISOA3", "NO_PAIS_ING"],
      format: "json",
    }).then(data => {
      const countries = {};
      data.forEach(d => countries[parseInt(d.CO_PAIS)] = d.NO_PAIS_ING)
      fetchData({setData, countries});
    })
  }, [])

  return (
    <div className=" h-full w-full flex flex-col items-center justify-start">
      <div className="h-[600px] w-[1200px] mb-20">
        <ResponsiveAreaBump
          data={data} 
          margin={{ top: 40, right: 300, bottom: 40, left: 100 }}
          spacing={20} 
          colors={{ scheme: 'nivo' }}
          axisTop={null}
          blendMode="multiply" 
          startLabel={false}
          endLabel="id"
          axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -90,
              legend: '',
              legendPosition: 'middle',
          }}
        />
      </div>
    </div>
  )
}
