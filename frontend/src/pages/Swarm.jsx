import { useState, useEffect } from 'react'
import YearSlider from './YearSlider'
import { ResponsiveSwarmPlot } from '@nivo/swarmplot'
import "./Styles.css"
import { getData } from "../api"

export default function Swarm() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dataSwarm, setDataSwarm] = useState([]);
  const [groups, setGroups] = useState(['10']);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(10000);

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };
  useEffect(() => {
    getData({
      tableName: 'exports',
      columns: ['CO_NCM', 'KG_LIQUIDO', 'CO_VIA'],
      format: "json",
      filterColumn: 'CO_ANO',
      filterValue: selectedYear
    })
      .then((data) => {
        // Preprocessing the data
        let preprocessedData = preprocessData(data);
        setMinValue(preprocessedData.minValue);
        setMaxValue(preprocessedData.maxValue);
        setGroups(preprocessedData.groups);
        setDataSwarm(preprocessedData.result);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [selectedYear]) // Re-run this effect when selectedYear changes
  return (
    <div className="h-full w-full flex flex-col items-center justify-start">
      <div className="h-[500px] w-[800px]">
      <ResponsiveSwarmPlot
        data={dataSwarm}
        groups={groups}
        identity="id"
        value="value"
        width={800}
        height={500}
        valueScale={{ type: 'linear', min: minValue, max: maxValue, reverse: false }}
        size={{
            key: 'volume',
            values: [
                minValue,
                maxValue
            ],
            sizes: [
                4,
                35
            ]
        }}
        spacing={3}
        gap={4}
        forceStrength={4}
        simulationIterations={100}
        colors={{ scheme: 'paired' }}
        colorBy="id"
        borderColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    '0.5'
                ],
                [
                    'opacity',
                    0.5
                ]
            ]
        }}
        margin={{ top: 80, right: 100, bottom: 80, left: 100 }}
        axisTop={null}
        axisRight={{
            orient: 'right',
            tickSize: 10,
            tickPadding: 5,
            tickRotation: 0,
            legend: '',
            legendPosition: 'middle',
            legendOffset: 76
        }}
        axisBottom={{
            orient: 'bottom',
            tickSize: 10,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'group if vertical, price if horizontal',
            legendPosition: 'middle',
            legendOffset: 46
        }}
        axisLeft={{
            orient: 'left',
            tickSize: 10,
            tickPadding: 5,
            tickRotation: 0,
            legend: '',
            legendPosition: 'middle',
            legendOffset: -76
        }}
    />
      </div>
      <YearSlider selectedYear={selectedYear} handleYearChange={handleYearChange} />
    </div>
  );
}


const preprocessData = (data) => {
    // Get the unique values of the data
    let uniqueData = getCategoryData(data);
    // totalweight
    let totalWeight = uniqueData.reduce((acc, item) => acc + item.KG_LIQUIDO, 0);
    // suppress elements with value below 0.1% of the total weight
    let threshold = 0.001 * totalWeight;
    uniqueData = uniqueData.filter((item) => item.KG_LIQUIDO >= threshold);
    // max and min values
    const maxValue = Math.max(...uniqueData.map((item) => item.KG_LIQUIDO));
    const minValue = Math.min(...uniqueData.map((item) => item.KG_LIQUIDO));
    // list of categories
    const groups = [...new Set(uniqueData.map((item) => item.CO_VIA))];
    // list of dictionaries with the format {id: "name", value: "value", group: "group", volume: "value"}
    const result = uniqueData.map((item) => ({
        id: item.CO_NCM_1,
        group: item.CO_VIA,
        value: item.KG_LIQUIDO,
        volume: item.KG_LIQUIDO,
    }));
    return {result:result, groups:groups, minValue:minValue, maxValue:maxValue};
};

const getCategoryData = (data) => {
  const result = {};

  // Iterate through the list of dictionaries
  for (const item of data) {
    // If the name is not in the result object, add it with the value
    let key = item.CO_NCM.slice(0, 2);
    if (!result[key]) {
      result[key] = [parseFloat(item.KG_LIQUIDO), item.CO_VIA];
    } else {
      // If the name is already in the result object, add the value to the existing value
      result[key][0] += parseFloat(item.KG_LIQUIDO);
    }
  }

  // Convert the result object back to an array of dictionaries
  const finalResult = Object.keys(result).map((CO_NCM_1) => ({
        CO_NCM_1,
        KG_LIQUIDO: result[CO_NCM_1][0],
        CO_VIA: result[CO_NCM_1][1] 
    }));
  return finalResult;
};

    