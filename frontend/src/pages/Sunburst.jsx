import { useState, useEffect } from 'react'
import YearSlider from './YearSlider'
import { ResponsiveSunburst } from '@nivo/sunburst'
import "./Styles.css"
import ncm from '../ncm_ing.json'
import { getData } from "../api"

export default function sunBurst() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dataSun, setDataSun] = useState({ "id": 'nivo', "children": [] });
  // load the json file to dictionary dont use require
  
  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const tooltip = (node) => {
    // small square with ronded corners and the color of the node
    // with the name of the category and the net quantity
    const getNcm = (id) => {
      return ncm[id];
    }
    return (
      <div
        style={{
          background: node.color,
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
        <small>{getNcm(node.id)}</small>
        <br />
        <small>{formatValue(node.value)} Kg</small>
      </div>
    );
  }


  useEffect(() => {
    getData({
      tableName: 'exports',
      columns: ['CO_NCM', 'KG_LIQUIDO'],
      format: "json",
      filterColumn: 'CO_ANO',
      filterValue: selectedYear
    })
      .then((data) => {
        // Preprocessing the data
        const preprocessedData = preprocessData(data);
        setDataSun(preprocessedData);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [selectedYear]);

  const drillDown = (node, event) => {
    if (node.depth === 4) {
      return;
    }
    setDataSun(node.data);
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-start">
      <div className="h-[500px] w-[800px]">
        <ResponsiveSunburst
          data={dataSun}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          identity="id"
          value="value"
          width={800}
          height={500}
          cornerRadius={3}
          borderWidth={3}
          borderColor="rgb(229 231 235)"
          colors={{ scheme: "paired" }}
          childColor={{
            from: 'color',
            modifiers: [
                [
                    'opacity',
                    '0.5'
                ]
            ]
          }}
          enableArcLabels={true}
          arcLabelsSkipAngle={15}
          arcLabelsTextColor={{ from: "color", modifiers: [["darker", 1.8]] }}
          tooltip={tooltip}
          onClick={drillDown}

        />
      </div>
      <YearSlider 
        selectedYear={selectedYear} 
        handleYearChange={handleYearChange} 
      />
    </div>
  );
}

const getTenBiggestCat = (data) => {
  // group by category
  let groupedData = {};
  data.forEach((node) => {
    if (!groupedData[node.CO_NCM.slice(0, 2)]) {
      groupedData[node.CO_NCM.slice(0, 2)] = parseFloat(node.KG_LIQUIDO);
    } else {
      groupedData[node.CO_NCM.slice(0, 2)] += parseFloat(node.KG_LIQUIDO);
    }
  });
  // sort the categories by weight
  let sortedData = Object.keys(groupedData).sort((a, b) => groupedData[b] - groupedData[a]);
  // get the 10 biggest category
  let tenBiggest = sortedData.slice(0, 10);
  // filter the data to get only the 10 biggest category
  let filteredData = data.filter((node) => tenBiggest.includes(node.CO_NCM.slice(0, 2)));
  return filteredData;
};

const preprocessData = (data) => {
  // Get the 10 biggest category
  let filteredData = getTenBiggestCat(data);
  // Get the unique data
  filteredData = getUniqueData(filteredData);
  // Preprocess the data to create the hierarchy
  const hierarchyData = getHierarchySunburstN(filteredData);
  return {id: 'nivo', children: hierarchyData};
};

const getUniqueData = (data) => {
  const result = {};

  // Iterate through the list of dictionaries
  for (const item of data) {
    // If the name is not in the result object, add it with the value
    if (!result[item.CO_NCM]) {
      result[item.CO_NCM] = parseFloat(item.KG_LIQUIDO);
    } else {
      // If the name is already in the result object, add the value to the existing value
      result[item.CO_NCM] += parseFloat(item.KG_LIQUIDO);
    }
  }
  // Convert the result object back to an array of dictionaries
  const finalResult = Object.keys(result).map((CO_NCM) => ({ CO_NCM, KG_LIQUIDO: result[CO_NCM] }));
  return finalResult;
};

const getHierarchySunburstN = (data) => {
  const hierarchyMap = new Map();

  for (const line of data) {
    const keyOne = line.CO_NCM.slice(0, 2);
    const keyTwo = line.CO_NCM.slice(0, 4);
    const keyThree = line.CO_NCM.slice(0, 5);

    // Initialize hierarchy levels if they don't exist
    if (!hierarchyMap.has(keyOne)) {
      hierarchyMap.set(keyOne, { id: keyOne, children: new Map() });
    }
    if (!hierarchyMap.get(keyOne).children.has(keyTwo)) {
      hierarchyMap.get(keyOne).children.set(keyTwo, { id: keyTwo, children: new Map() });
    }
    if (!hierarchyMap.get(keyOne).children.get(keyTwo).children.has(keyThree)) {
      hierarchyMap.get(keyOne).children.get(keyTwo).children.set(keyThree, { id: keyThree, children: [] });
    }

    hierarchyMap.get(keyOne).children.get(keyTwo).children.get(keyThree).children.push({
      id: line.CO_NCM,
      value: parseFloat(line.KG_LIQUIDO),
    });
  }

  // Convert the map to an array structure with children as arrays
  const dataSunburst = Array.from(hierarchyMap.values(), levelOne => {
    const levelOneCopy = { ...levelOne };
    levelOneCopy.children = Array.from(levelOne.children.values(), levelTwo => {
      const levelTwoCopy = { ...levelTwo };
      levelTwoCopy.children = Array.from(levelTwo.children.values(), levelThree => {
        return { ...levelThree, children: Array.from(levelThree.children) };
      });
      return levelTwoCopy;
    });
    return levelOneCopy;
  });

  return dataSunburst;
};

const formatValue = (number) => {
  const suffixes = ['', 'K', 'M', 'B', 'T'];

  let suffixIndex = 0;

  while (number >= 1000 && suffixIndex < suffixes.length - 1) {
      number /= 1000;
      suffixIndex++;
  }

  return number.toFixed(0) + suffixes[suffixIndex];
}
