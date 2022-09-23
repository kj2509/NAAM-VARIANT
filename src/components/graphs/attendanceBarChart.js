import React, { PureComponent } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AttendanceBarChart(data) {
  const attendanceData = [];
  const students = data.students;
  if (students) {
    students.forEach(student => {
      let attendanceObj = {}
      attendanceObj.name = student.first_name;
      attendanceObj.attendance = student.stats.attendance;
      attendanceData.push(attendanceObj);
    });
  }
  return (
    <>
      <BarChart width={1000} maxBarSize={100} height={300} data={attendanceData}>
        <Bar dataKey="attendance" fill="#8884d8" />
        <XAxis dataKey="name" />
        <YAxis dataKey="attendance" />
        <Tooltip />
        <Legend />
      </BarChart>
    </>
  );
}
