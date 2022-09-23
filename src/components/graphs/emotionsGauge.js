import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function EmotionsGauge(stats) {
  const emotionData = [];
  let emotionObj = {}
  if (stats.emotion) {
    Object.keys(stats.emotion).forEach(x => {
      emotionObj[x] = stats.emotion[x];
    });
    emotionData.push(emotionObj);
  }
  return (
    <>
      <BarChart
        width={150}
        height={300}
        data={emotionData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <Tooltip />
        <Legend />
        <Bar dataKey="angry" stackId="emotion" fill="#F47B89" />
        <Bar dataKey="disgust" stackId="emotion" fill="#FFA47E" />
        <Bar dataKey="fear" stackId="emotion" fill="#FFD286" />
        <Bar dataKey="happy" stackId="emotion" fill="#FFFFA6" />
        <Bar dataKey="sad" stackId="emotion" fill="#CB5E99" />
        <Bar dataKey="surprise" stackId="emotion" fill="#8A51A5" />
        <Bar dataKey="neutral" stackId="emotion" fill="#004CA3" />
      </BarChart>
    </>
  );
}
