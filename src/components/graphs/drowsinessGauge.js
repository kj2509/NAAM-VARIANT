import React from 'react';
import { PieChart, Pie, Cell, Sector, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Group A', value: 400 },
  { name: 'Group B', value: 300 },
  { name: 'Group C', value: 300 },
  { name: 'Group D', value: 200 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const emojiData = {
  "drowsy": "😴",
  "awake": "🙂"
}
const CustomLegend = ({ payload }) => {
  return (
    <div className="graph-legend-container">
      {payload.map(({ value, color }) => {
        return (
          <span className="graph-legend-element-container">
            <span className="graph-legend-indicator" style={{ backgroundColor: color }} />
            <p className="graph-legend-text">{value} {emojiData[value]} </p>
          </span>
        );
      })}
    </div>
  );
}
export default function DrowsinessGauge(stats) {
  const drowsinessData = [];
  let drowsinessObj = {}
  if (stats.drowsiness) {
    Object.keys(stats.drowsiness).forEach(x => {
      drowsinessObj[x] = stats.drowsiness[x];
    });
    drowsinessData.push(drowsinessObj);
  }
  return (
    <>
      {/* <BarChart
        width={150}
        height={300}
        data={drowsinessData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <Tooltip />
        <Legend content={CustomLegend} />
        <Bar dataKey="drowsy" stackId="drowsiness" fill="#F47B89" />
        <Bar dataKey="awake" stackId="drowsiness" fill="#004CA3" />
      </BarChart> */}
      <PieChart width={800} height={400} onMouseEnter={this.onPieEnter}>
        <Pie
          data={data}
          cx={420}
          cy={200}
          startAngle={180}
          endAngle={0}
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </>
  );

}
