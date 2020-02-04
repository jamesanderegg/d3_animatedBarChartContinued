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
    //groups = year
    //el = names, designers, transistors
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

    // SIMPLE moore's Law:
  const mooresLaw = d3
    .range(1971, 2025)
    .reduce(
      (law,year) => {
      if(year % 2 === 0){
        const count =  law[year-2]*2;
        const delta = count -law[year-2];
        law[year-1] = law[year-2] + delta/2;
        law[year] = count;
      }
      return law;   
    }, 
    {1970: 1000}
  );
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
      <Title x={"50%"} y={35}> Moore's law vs. actual transistor count in React & D3</Title>
       (
        <Barchart 
          data={[
            ...((data && data[currentYear]) || []),{       
            name: "Moores's law",
            designer: 'Moore',
            year: currentYear,
            type: '',
            transistors: mooresLaw[currentYear]  
          }]} 
          x={150} 
          y={50} 
          barThickness={20} 
          width={500} />
      
      <Year x={"95%"} y={"95%"} >{currentYear}</Year>
    </Svg>
  );
}

export default App;
