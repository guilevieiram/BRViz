import { useState, useEffect } from 'react'
import YearSlider from './YearSlider'
import { ResponsiveSunburst } from '@nivo/sunburst'
import "./Styles.css"
import { getData } from "../api"

export default function sunBurst() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dataSun, setDataSun] = useState({ "id": 'nivo', "children": [] });

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const tooltip = (node) => {
    // small square with ronded corners and the color of the node
    // with the name of the category and the net quantity
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
        <small>{node.id}</small>
        <br />
        <small>{node.value} Kg</small>
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

const preprocessData = (data) => {
  // get the first 1500 rows
  data = data.slice(0, 1500);
  // Get the unique data
  data = getUniqueData(data);
  // Calculate the total weight
  let totalWeight = calculateTotalWeight(data);
  // totalweight by NCM category
  let totalWeightNcm = {};
  data.forEach((node) => {
    if (!totalWeightNcm[node.CO_NCM.slice(0, 2)]) {
      totalWeightNcm[node.CO_NCM.slice(0, 2)] = parseFloat(node.KG_LIQUIDO);
    } else {
      totalWeightNcm[node.CO_NCM.slice(0, 2)] += parseFloat(node.KG_LIQUIDO);
    }
  });
  // suppress the category NCM_1 data below 0.1% of the total weight
  let threshold = 0.001 * totalWeight
  data = data.filter((node) => totalWeightNcm[node.CO_NCM.slice(0, 2)] >= threshold);
  // Preprocess the data to create the hierarchy
  let hierarchyData = getHierarchySunburstN(data);
  const finalData = hierarchyData
  return {id: 'nivo', children: finalData};
};

const calculateTotalWeight = (data) => {
  let totalWeight = 0;
  data.forEach((node) => {
    totalWeight += node.KG_LIQUIDO;
  });
  return totalWeight;
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

