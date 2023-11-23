import { useState, useEffect } from 'react'
import {  ResponsiveAreaBump } from '@nivo/bump'

import { getData } from "../api"
import ncm from "../ncm_ing.json"

const sum = arr => arr.reduce((acc, cur) => acc + cur, 0)
const years = Array.from({ length: 2023 - 1997 + 1 }, (_, i) => i + 1997)

const fetchData = ({
  filterNCM,
  setData,
}) => {
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
      );

    data.forEach(
      d => {
        byKey[d[column]] = [{
          x: d.CO_ANO,
          y: parseInt(d.KG_LIQUIDO)
        }, ...byKey[d[column]]]
      }
    );

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
        id: ncm[id] || ncm[id+"00"] || ncm[id+"0000"]|| id,
        idx: id,
        data: data.sort((a, b) => 
          parseInt(a.x) - parseInt(b.x)
        )
      }))

    setData(onArray)
  });
}

export default function CategoryOverTime(){

  const [data, setData] = useState([]);
  const [lastSearch, setLastSearch] = useState([]);

  let startedFetching = false;
  useEffect(() => {
    if (startedFetching) return
    startedFetching = true;

    const params = {setData, filterNCM: ""};
    fetchData(params);
    setLastSearch([params]);

  }, [])

  return (
    <div className=" h-full w-full flex flex-col items-center justify-start">
      <div>
        {
          lastSearch.length > 1 &&
          <button 
            onClick={() => {
              fetchData(lastSearch.slice(-2)[0])
              setLastSearch(lastSearch.slice(0, -1))
            }}
            className="bg-indigo-700 text-white py-2 px-6 rounded-lg text-xl"
          >⬅</button>
        }
      </div>
      <div className="h-[500px] w-[1000px] mb-20">
        <ResponsiveAreaBump
          data={data} 
          onClick={({data}) => {
            if(data.idx === 0) return
            const params = {setData, filterNCM: data.idx}
            setLastSearch([...lastSearch, params])
            fetchData(params)
          }}
          margin={{ top: 40, right: 200, bottom: 40, left: 10}}
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
