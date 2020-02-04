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

const useData = () => {
  const [data, setData] = useState(null);

  useEffect(function(){
  (async () => {
    const datas = await Promise.all([
      d3.csv('data/microprocessors.csv', row => ({
        name: row['Processor'].replace(/\(.*\)/,''),
        designer: row['Designer'],
        year: Number(row['Date of introduction'].replace(/\[.*\]/, '')),
        transistors: Number(
          row['MOS transistor count']
          .replace(/\[.*\]/g,'')
          .replace(/,/g,'')
          )
      }))
    ]);
    
    // const grouped = d3.nest().key(d => d.year)
    //   .sortKeys(d3.ascending)
    //   .entries(datas.flat());

    const grouped = datas.flat()
      .sort((a, b) => a.year - b.year)
      .reduce((groups, el) => {
      if(!groups[el.year]){
        const previous = groups[el.year - 1];
        groups[el.year] = previous || [];
      }
      groups[el.year] = [...groups[el.year], el];

      return groups;
    }, {})

    console.log(grouped)
    // const processors = d3.range(10).map(i => `${i} CPU`),
    //   random = d3.randomUniform(1000, 50000);

    // let N = 1;

    // const data = d3.range(1970, 2025).map(year => {
    //   if(year % 5 ===0 && N < 10 ){
    //     N += 1;
    //   }
    //   return d3.range(N).map(i => ({
    //   year: year,
    //   name: processors[i],
    //   transistors: Math.round(random())
    // }))}
      
    // );

    // setData(data);
  })();
}, []);

  return data;
};
function App() {
  const data = useData();
  const [currentYear, setCurrentYear] = useState(1970);

  const yearIndex = d3
    .scaleOrdinal()
    .domain(d3.range(1970, 2025))
    .range(d3.range(0, 2025-1970));
  //main animation a simple counter
  useEffect(() => {
    const interval = d3.interval(() => {
      setCurrentYear(year => {
        if(year +1 > 2025){
          interval.stop();
        }
        return year + 1;
      });
    }, 2000);

    return () => interval.stop();
  }, []);

  return (
    <Svg>
      <Title x={"50%"} y={35}> COUNT IN REACT</Title>
      {data ? (
        <Barchart 
          data={data[yearIndex(currentYear)].values} 
          x={100} 
          y={50} 
          barThickness={20} 
          width={500} />
      ) : null}
      <Year x={"95%"} y={"95%"} >{currentYear}</Year>
    </Svg>
  );
}

export default App;
