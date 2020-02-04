import React, { useEffect, useState } from "react";
import styled from "styled-components";
import * as d3 from "d3";

import Barchart from "./Barchart";

const Svg = styled.svg`
  width: 100vw;
  height: 100vh;
  background: #0b0c10;
`;

const Year = styled.text`
fill: white;
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
    "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans",
    "Helvetica Neue", sans-serif;
font-size: 120px;
font-weight: bold;
text-anchor: end;
`;

const Title = styled.text`
fill: white;
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
    "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans",
    "Helvetica Neue", sans-serif;
font-size: 36px;
font-weight: bold;
text-anchor: middle;
`;

const getYear = row =>
  Number(row['Date of introduction']
    .replace(/\[.*\]/g, ''));

const getName = (row,type) => `${row['Processor']
  .replace(/\(.*\)/,'')} - ${type}`;

const getTransistors= row => Number(
  row['MOS transistor count']
  .replace(/\[.*\]/g,'')
  .replace(/[^0-9]/g, "")
)  
const useData = () => {
  const [data, setData] = useState(null);


  useEffect(function(){
  (async () => {
    const datas = await Promise.all([
      d3.csv('data/microprocessors.csv', row => ({
          name: getName(row, 'CPU'),
          designer: row['Designer'],
          year: getYear(row),
          transistors: getTransistors(row),
          type: 'CPU',
    })),
    d3.csv('data/gpus.csv', row => ({    
        name: getName(row, 'GPU'),
        designer: row['Designer'],
        year: getYear(row),
        transistors: getTransistors(row),
        type: 'GPU'

      }))
  ]);

    //group by year and accumulate everything from previous years
    const grouped = datas
      .flat()
      .sort((a, b) => a.year - b.year)
      .reduce((groups, el) => {
      if(!groups[el.year]){
        const previous = groups[el.year - 1];
        groups[el.year] = previous || [];
      }
      groups[el.year] = [...groups[el.year], el];

      return groups;
    }, {})

    setData(grouped);

  })();
}, []);

  return data;
};
function App() {
  const data = useData();
  const [currentYear, setCurrentYear] = useState(1970);
  
  //main animation a simple counter
  useEffect(() => {
    const interval = d3.interval(() => {
      setCurrentYear(year => {
        if(!data[year +1]){
          interval.stop();
          return year;
        }
        return year + 1;
      });
    }, 2000);

    return () => interval.stop();
  }, [data]);

  return (
    <Svg>
      <Title x={"50%"} y={35}> COUNT IN REACT</Title>
      {data && data[currentYear] ? (
        <Barchart 
          data={data[currentYear]} 
          x={150} 
          y={50} 
          barThickness={20} 
          width={500} />
      ) : null}
      <Year x={"95%"} y={"95%"} >{currentYear}</Year>
    </Svg>
  );
}

export default App;
