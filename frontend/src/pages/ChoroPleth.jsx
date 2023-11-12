import { useState, useEffect } from 'react'
import YearSlider from './YearSlider'
import { ResponsiveChoropleth } from '@nivo/geo'
import * as d3 from 'd3'
import "./Styles.css"
import * as worldCountries from '../../world_countries.json'
import ncm from '../ncm_ing.json'
import { getData } from "../api"


export default function ChoroPleth() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dataChoro, setDataChoro] = useState([]);
  // load the json file to dictionary dont use require
  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };
  const tooltip = (node) => {
    // small square with ronded corners and the color of the node
    // with the name of the category and the net quantity
    // if node undefined
    console.log(node);
    if (node.feature.data) {
      const listData = node.feature.data.list;
      const getNcm = (id) => {
        return ncm[id];
      }
      return (
        <div
  style={{
    background: 'white',
    color: 'dark',
    borderRadius: '6px',
    padding: '2px 7px',
    // content center
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end', // Corrected property name
  }}
>
  <small>{node.feature.data.name}: {formatValue(node.feature.data.raw_data)} Kg</small>
  <ul style={{ listStyconstype: 'none', padding: 0 }}>
    {listData.map((product) => (
      <li key={product.id} style={{ textAlign: 'left' }}>
        <small title={`Tooltip: ${getNcm(product.id)}`} style={{ cursor: 'pointer' }}>
          {getNcm(product.id)} : {formatValue(product.value)} Kg
        </small>
      </li>
    ))}
  </ul>
</div>

      );
    }
  }


  useEffect(() => {
    getData({
      tableName: 'exports',
      columns: ['CO_NCM', 'KG_LIQUIDO', 'CO_PAIS'],
      format: "json",
      filterColumn: 'CO_ANO',
      filterValue: selectedYear
    })
      .then((data) => {
        getData({
          tableName: 'countries',
          columns: ['CO_PAIS', 'CO_PAIS_ISOA3', 'NO_PAIS_ING'],
          format: "json"
        }).then((countries) => {
        // Preprocessing the data
        const preprocessedData = preprocessData(data, countries);
        setDataChoro(preprocessedData);
      })
      })
      .catch((error) => {
        console.error(error);
      });
  }, [selectedYear]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-start">
      <div className="h-[400px] w-[800px]">
      <ResponsiveChoropleth
          data={dataChoro}
          features={worldCountries.features}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          colors='blues'
          domain={[1, 12]}
          unknownColor="#666666"
          width={800}
          height={400}
          label="properties.name"
          valueFormat=".2s"
          projectionType="naturalEarth1"
          projectionScale={115}
          projectionTranslation={[ 0.5, 0.5 ]}
          projectionRotation={[ 0, 0, 0 ]}
          enableGraticule={true}
          graticuleLineColor="#dddddd"
          borderWidth={0.5}
          borderColor="#152538"
          tooltip={tooltip}
          legends={[
              {
                  anchor: 'bottom-left',
                  direction: 'column',
                  justify: true,
                  translateX: 20,
                  translateY: -100,
                  itemsSpacing: 0,
                  itemWidth: 94,
                  itemHeight: 18,
                  itemDirection: 'left-to-right',
                  itemTextColor: '#444444',
                  itemOpacity: 0.85,
                  symbolSize: 18,
                  effects: [
                      {
                          on: 'hover',
                          style: {
                              itemTextColor: '#000000',
                              itemOpacity: 1
                          }
                      }
                  ]
              }
          ]}
      />
      </div>
      <YearSlider 
        selectedYear={selectedYear} 
        handleYearChange={handleYearChange} 
      />
    </div>
  );
}

const groupByCountry = (data, countries) => {
  // group by country
  const groupedData = {};
  data.forEach((node) => {
    if (!groupedData[parseInt(node.CO_PAIS)]) {
      groupedData[parseInt(node.CO_PAIS)] = {}
      groupedData[parseInt(node.CO_PAIS)].data = [node];
      groupedData[parseInt(node.CO_PAIS)].value = parseFloat(node.KG_LIQUIDO);
    }
    else {
      groupedData[parseInt(node.CO_PAIS)].value += parseFloat(node.KG_LIQUIDO);
      groupedData[parseInt(node.CO_PAIS)].data.push(node);
    }
  });
  // keep the 10 biggest node for each country
  for (const country in groupedData) {
    groupedData[parseInt(country)].data = getTenBiggestCategory(groupedData[country].data);
  }
  // get the country name
  for (const country of countries) {
    if (groupedData[parseInt(country.CO_PAIS)]) {
      groupedData[parseInt(country.CO_PAIS)].name = country.NO_PAIS_ING;
      groupedData[parseInt(country.CO_PAIS)].code = country.CO_PAIS_ISOA3;
    }
  }
  // convert the object to an array
  const groupedDataArray = [];
  for (const country in groupedData) {
    if (groupedData[country].code === 'BRA') 
      continue;
    
    groupedDataArray.push({
      id: groupedData[country].code,
      value: groupedData[country].value, 
      list: groupedData[country].data, 
      name: groupedData[country].name});
  }
  return groupedDataArray;
};

const getTenBiggestCategory = (data) => {
  // group by category
  const groupedData = {};
  data.forEach((node) => {
    if (!groupedData[node.CO_NCM.slice(0, 2)]) {
      groupedData[node.CO_NCM.slice(0, 2)] = parseFloat(node.KG_LIQUIDO);
    } else {
      groupedData[node.CO_NCM.slice(0, 2)] += parseFloat(node.KG_LIQUIDO);
    }
  });
  // sort the categories by weight
  const sortedData = Object.keys(groupedData).sort((a, b) => groupedData[b] - groupedData[a]);
  // get the 10 biggest category
  const tenBiggest = sortedData.slice(0, 5);
  // turn to list of dictionaries, id: category, value: weight
  const filteredData = [];
  for (const category of tenBiggest) {
    filteredData.push({id: category, value: groupedData[category]});
  }
  return filteredData;
};

const preprocessData = (data, countries) => {
  // Get the 10 biggest category
  const filteredData = groupByCountry(data, countries);
  // take log of the value
  console.log(filteredData);
  return filteredData.map(({value, ...rest}) => {
    return {value: Math.log10(value), raw_data: value, ...rest};
  });
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
