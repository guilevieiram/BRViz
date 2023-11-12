import { useState, useEffect } from 'react'
import YearSlider from './YearSlider'
import { ResponsiveSwarmPlot } from '@nivo/swarmplot'
import "./Styles.css"
import ncm from '../ncm.json'
import { getData } from "../api"
//import transport from '../transport.json'



export default function Swarm() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dataSwarm, setDataSwarm] = useState([]);
  const [groups, setGroups] = useState(['10']);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(10000);
  const [categories, Setcategories] = useState([]);

  const tooltip = (node) => {
    // small square with ronded corners and the color of the node
    // with the name of the category and the net quantity
    return (
        <div
            style={{
                background: 'white',
                color: 'dark',
                borderRadius: '6px',
                padding: '0px 5px',
                // content center
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <small>{ncm[node.data.CO_NCM_0]}</small>
            <br />
            <small>{formatValue(node.data.KG_LIQUIDO)} Kg</small>
        </div>
    );
    }

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  useEffect(() => {
    getData({
      tableName: 'exports',
      columns: ['CO_NCM_0', 'KG_LIQUIDO', 'CO_VIA'],
      format: "json",
      filterColumn: 'CO_ANO',
      aggregate: 'KG_LIQUIDO',
      filterValue: selectedYear
    })
      .then((data) => {
        // Preprocessing the data
        let preprocessedData = preprocessData(data);
        setMinValue(preprocessedData.minValue);
        setMaxValue(preprocessedData.maxValue);
        setGroups(preprocessedData.groups);
        setDataSwarm(preprocessedData.result);
        Setcategories([...new Set(preprocessedData.result.map((item) => item.name))]);

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
        value="CO_NCM_0"
        width={800}
        height={500}
        size={{
            key: 'KG_LIQUIDO',
            values: [
                minValue,
                maxValue
            ],
            sizes: [
                6,
                50
            ]
        }}
        spacing={3}
        gap={4}
        forceStrength={4}
        simulationIterations={100}
        colors={{ scheme: 'category10' }}
        colorBy="group"
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
        // grid Y values are the categories
        // grid X values are the transportation means
        axisTop={null}
        axisRight={null}
        axisBottom={{
            orient: 'bottom',
            tickSize: 10,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Transportation means',
            legendPosition: 'middle',
            legendOffset: 46,
        }}
        axisLeft={null}
        tooltip={tooltip}
    />
      </div>
      <YearSlider selectedYear={selectedYear} handleYearChange={handleYearChange} />
    </div>
  );
}

const getTenBiggestCat = (data) => {
  // group by category
  let groupedData = {};
  data.forEach((node) => {
    if (!groupedData[node.CO_NCM_0]) {
      groupedData[node.CO_NCM_0] = parseFloat(node.KG_LIQUIDO);
    } else {
      groupedData[node.CO_NCM_0] += parseFloat(node.KG_LIQUIDO);
    }
  });
  // sort the categories by weight
  let sortedData = Object.keys(groupedData).sort((a, b) => groupedData[b] - groupedData[a]);
  // get the 10 biggest category
  let tenBiggest = sortedData.slice(0, 10);
  // filter the data to get only the 10 biggest category
  let filteredData = data.filter((node) => tenBiggest.includes(node.CO_NCM_0));
  return filteredData;
};

const preprocessData = (data) => {
    // Get the 10 biggest category
    const filteredData = getTenBiggestCat(data);
    // max and min values
    const maxValue = Math.max(...filteredData.map((item) => item.KG_LIQUIDO));
    const minValue = Math.min(...filteredData.map((item) => item.KG_LIQUIDO));
    // list of dictionaries with the format {id: "name", value: "value", group: "group", volume: "value"}
    const groups = [...new Set(filteredData.map((item) => item.CO_VIA))];	
    const result = filteredData.map((item, d) => ({
        id: d,
        group: item.CO_VIA,
        ...item,
    }));
    return {result:result, groups:groups, minValue:minValue, maxValue:maxValue};
};

const formatValue = (number) => {
  if(!number) return "0";
  console.log(number)
  number = parseFloat(number);

  const suffixes = ['', 'K', 'M', 'B', 'T'];

  let suffixIndex = 0;

  while (number >= 1000 && suffixIndex < suffixes.length - 1) {
      number /= 1000;
      suffixIndex++;
  }

  return number.toFixed(0) + suffixes[suffixIndex];
}