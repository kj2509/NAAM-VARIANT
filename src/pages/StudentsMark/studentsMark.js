import React from "react";
import { useSelector } from "react-redux";
import Center from "../../components/center";
import DataTable from "../../components/dataTable";
import TeacherNavbar from "../../components/teacherNavbar";

export default function StudentsMark() {
  return (
    <>
      <TeacherNavbar title="Reports" />
      <Center>
        <DataTable />
      </Center>
    </>
  );
}
