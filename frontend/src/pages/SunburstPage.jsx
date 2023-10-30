import { useState, useEffect } from 'react'
import YearSlider from './YearSlider'
import { ResponsiveSunburst } from '@nivo/sunburst'
import "./Styles.css"
import { getData } from "../api"

export default function Example() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dataSun, setDataSun] = useState({ "id": 'nivo', "children": [] });
  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  useEffect(() => {
    getData({
      tableName: 'exports',
      columns: ['CO_ANO', 'CO_NCM', 'KG_LIQUIDO'],
    })
      .then((data) => {
        data = data.filter((row) => parseFloat(row.CO_ANO) === parseFloat(selectedYear));
        // get unique data
        data = getUniqueData(data);
        // Format for sunburst
        const hierarchyData = getHierarchySunburst(data);
        setDataSun({ "id": "nivo", "children": hierarchyData });
      })
      .catch((error) => {
        console.error(error);
      });
  }, [selectedYear]); // Re-run this effect when selectedYear changes
  return (
    <div className="h-full w-full flex flex-col items-center justify-start">
      <div className="h-[500px] w-[800px]">
      <ResponsiveSunburst
        data={dataSun}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        id="id"
        value="value"
        width={800}
        height={500}
        cornerRadius={2}
        borderWidth={5}
        borderColor={{ theme: 'background' }}
        colors={{ scheme: 'accent' }}
        childColor={{
            from: 'color',
            modifiers: [
                [
                    'brighter',
                    0.1
                ]
            ]
        }}
        enableArcLabels={true}
        arcLabelsRadiusOffset={0.1}
        arcLabelsSkipAngle={18}
        arcLabelsTextColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    '2.5'
                ]
            ]
        }}
        transitionMode="startAngle"
    />
      </div>
      <YearSlider selectedYear={selectedYear} handleYearChange={handleYearChange} />
    </div>
  );
}

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


const groupBy = (arr, keyFunc) => {
    return arr.reduce((result, item) => {
      const key = keyFunc(item);
      if (!result[key]) {
        result[key] = [0]; // Total weight
      }
      result[key][0] += parseFloat(item.KG_LIQUIDO);
      result[key].push(item);
      return result;
    }, {});
  }

const getHierarchySunburst = (data) => {
    let dataSunburst = [];
    const keyFuncOne = (line) => line.CO_NCM.slice(0, 2);
    const keyFuncTwo = (line) => line.CO_NCM.slice(0, 4);
    const keyFuncThree = (line) => line.CO_NCM.slice(0, 5);
    const groupedData = groupBy(data, keyFuncOne);

    Object.keys(groupedData).forEach(keyOne => {
        dataSunburst.push({
            "id": keyOne, 
            "value": groupedData[keyOne][0], 
            "children": []
        });
        groupedData[keyOne].shift();
        groupedData[keyOne].push(groupBy(groupedData[keyOne], keyFuncTwo));

        Object.keys(groupedData[keyOne].at(-1)).forEach(keyTwo => {
            dataSunburst.at(-1).children.push({
                "id": keyTwo,  
                "value": groupedData[keyOne].at(-1)[keyTwo][0],
                "children": []
            });
            groupedData[keyOne].at(-1)[keyTwo].shift();
            groupedData[keyOne].at(-1)[keyTwo].push(groupBy( groupedData[keyOne].at(-1)[keyTwo], keyFuncThree));

            Object.keys(groupedData[keyOne].at(-1)[keyTwo].at(-1)).forEach(keyThree => {
                dataSunburst.at(-1).children.at(-1).children.push({
                    "id": keyThree,
                    "value": groupedData[keyOne].at(-1)[keyTwo].at(-1)[keyThree][0],
                    "children": []
                });
                groupedData[keyOne].at(-1)[keyTwo].at(-1)[keyThree].shift();
                groupedData[keyOne].at(-1)[keyTwo].at(-1)[keyThree].forEach(element => {
                    dataSunburst.at(-1).children.at(-1).children.at(-1).children.push({
                        "id": element.CO_NCM, 
                        "value": parseFloat(element.KG_LIQUIDO),
                    });
                });
            });
        });
    });
    return dataSunburst;
}
