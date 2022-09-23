import React from 'react';
import { PieChart, Pie, Sector, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#FA5F57', '#EFFA64', '#FA4BDD', '#32FA7D', '#A53EFA', '#4E54FA', '#32FAF6'];
const RADIAN = Math.PI / 180;
const emojiData = {
  "angry": "😡",
  "disgust": "🤢",
  "fear": "😨",
  "happy": "😁",
  "neutral": "😐",
  "sad": "😞",
  "surprise": "😲"
}
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomLegend = ({ payload }) => {
  return (
    <div className="graph-legend-container">
      {payload.map(({ value, color }) => {
        return (
          <span className="graph-legend-element-container" key={`legend-${value}`}>
            <span className="graph-legend-indicator" style={{ backgroundColor: color }} key={`indicator-${value}`} />
            <p className="graph-legend-text">{value} {emojiData[value]} </p>
          </span>
        );
      })}
    </div>
  );
}

export default function EmotionPieChart(stats) {
  const emotionData = [];
  Object.keys(stats.emotion).forEach(x => {
    const dataPoint = {
      name: x,
      value: stats.emotion[x]
    }
    emotionData.push(dataPoint);
  });

  return (
    <PieChart width={400} height={400}>
      <Pie
        data={emotionData}
        cx="50%"
        cy="50%"
        labelLine={false}
        outerRadius={100}
        fill="#8884d8"
        dataKey="value"
      >
        {emotionData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend content={CustomLegend} />
    </PieChart>
  );
}
