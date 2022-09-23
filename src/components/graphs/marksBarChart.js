import React, { PureComponent } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  {
    name: 'Jon',
    total: 90,
    predicted: 90
  },
  {
    name: 'Sam',
    total: 80,
    predicted: 90
  },
  {
    name: 'Michelle',
    total: 76,
    predicted: 90
  },
];

export default function MarksBarChart(data) {
  const marksData = [];
  const students = data.students;
  if (students) {
    students.forEach(student => {
      let markObj = {
        name: student.first_name,
        total: 0,
        predicted: 0
      }
      if (student.marks.total != null) {
        markObj.total = student.marks.total;
      }
      if (student.marks.predicted_total != null) {
        markObj.predicted = student.marks.predicted_total;
      }
      marksData.push(markObj);
    });
  }
  return (
    <>
      <BarChart width={1000} height={300} maxBarSize={100} data={marksData}>
        <Bar dataKey="total" fill="#1184d8" />
        <Bar dataKey="predicted" fill="#425481" />
        <XAxis dataKey="name" />
        <YAxis dataKey="predicted" />
        <Tooltip />
        <Legend />
      </BarChart>
    </>
  );

}
