import { useState, useEffect } from 'react'
import {  ResponsiveAreaBump } from '@nivo/bump'

import { getData } from "../api"

const sum = arr => arr.reduce((acc, cur) => acc + cur, 0)

const fetchData = ({
  labels, 
  filterNCM,
  setData,
}) => {
  console.log("started fetching real data")
  const level = filterNCM.length / 2;
  const column = `CO_NCM_${level}`;
  const columnPrev = `CO_NCM_${level-1}`;

  getData({
    tableName: "exports",
    columns: ["CO_ANO", column, "KG_LIQUIDO"],
    format: "json",
    aggregate: "KG_LIQUIDO",
    filterColumn: level > 0 ? `CO_NCM_${level-1}` : "",
    filterValue: level > 0 ? filterNCM : ""
  }).then(data => {

    const byKey = data
      .reduce(
        (acc, cur) => ({...acc, [cur[column]]: []}), 
        {}
      )

    data.forEach(
      d => {
        byKey[d[column]] = [{
          x: d.CO_ANO,
          y: parseInt(d.KG_LIQUIDO)
        }, ...byKey[d[column]]]
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
      .map(
        ({id, data}) => ({
          //id: labels[id] || id,
          id: id,
          data: data.sort(
            (a, b) => parseInt(a.x) - parseInt(b.x)
          )
        }) 
      )
    const defaultLine = Array.from({ length: 2023 - 1997 + 1 }, (_, i) => i + 1997)
      .map(year => ({x: year, y: 0}))
    const withDefault = [{id: 0, data: defaultLine}, ...onArray]

    console.log(withDefault)
    setData(withDefault)
  });
}

export default function Bump(){

  const [data, setData] = useState([]);
  const [labels, setLabels] = useState({});
  const [lastSearch, setLastSearch] = useState([]);

  let startedFetching = false;
  useEffect(() => {
    if (startedFetching) return
    startedFetching = true;

    console.log("stated fetching data!!!")
    const params = {labels, setData, filterNCM: ""};
    fetchData(params);
    setLastSearch([params]);

    /*
    getData({
      tableName: "ncm",
      columns: ["code", "description"],
    }).then(data => {
      const labels = data.reduce(
        (acc, {code, description}) => ({...acc, 
          [code.replaceAll(".", "")]: description})
        , {}
      );

      console.log({labels})
      setLabels(labels);
      fetchData({labels, setData, filterNCM: ""});
    })
    */

  }, [])

  return (
    <div className=" h-full w-full flex flex-col items-center justify-start">
      <div>
        {
          lastSearch.length > 1 &&
          <button 
            onClick={() => {
              console.log(lastSearch)
              fetchData(lastSearch.slice(-2)[0])
              setLastSearch(lastSearch.slice(0, -1))
            }}
            className="bg-red-400"
          >Go back</button>
        }
      </div>
      <div className="h-[600px] w-[1200px] mb-20">
        <ResponsiveAreaBump
          data={data} 
          onClick={({data}) => {
            if(data.id === 0) return
            setLastSearch([...lastSearch, {labels, setData, filterNCM: data.id}])
            fetchData({labels, setData, filterNCM: data.id})
          }}
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
