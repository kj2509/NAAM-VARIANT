import React from "react";
import Center from "./center";
import DataTable from "./dataTable";
import Navbar from "../components/Navbar";

export default function StudentDetails() {
  return (
    <>
      <Navbar title="Profile" />
      <Center>
        <DataTable />
      </Center>
    </>
  );
}
