"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/src/components/sidebar";

export default function DashboardPage() {
  const [patients, setPatients] = useState([]);

  const getData = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/getPatients/");
      const data = await response.json();
      setPatients(data.patients);
    } catch (error) {
      console.log(error);
    }
  };

  // when the page loads first
  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="flex flex-col sm:flex-row h-screen">
      <div className="w-full sm:w-96">
        <Sidebar />
      </div>
      <div className="w-full">
        <h1>{patients}</h1>
      </div>
    </div>
  );
}
