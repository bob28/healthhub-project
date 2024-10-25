"use client";

import { useState } from "react";
import { FaBars } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import logoBG from "../../public/logoBG.png";
import React from "react";
import { Button } from "@nextui-org/button";

export default function NavbarComp() {
  const [state, setState] = useState(false);

  // Replace # paths with your paths
  const navigation = [
    { title: "Patients", path: "/patients" },
    { title: "Healthcare Providers", path: "#" },
    { title: "Tests and Services", path: "#" },
    { title: "About", path: "#" },
  ];

  return (
    <nav className=" border-b w-full lg:static lg:text-sm lg:border-none ">
      <div className="items-center px-4 max-w-screen-xl mx-auto lg:flex lg:px-8">
        <div className="flex items-center my-auto justify-between py-3 lg:py-5 lg:block">
          <a href="/">
            <img src={logoBG.src} width={120} alt="Logo" />
          </a>
          <div className="lg:hidden ">
            <button
              className="text-secondary hover:text-cyan-950"
              onClick={() => setState(!state)}
            >
              {state ? (
                <FaXmark className="text-2xl" />
              ) : (
                <FaBars className="text-xl" />
              )}
            </button>
          </div>
        </div>
        <div
          className={`flex-1 pb-3 mt-8 lg:block lg:pb-0 lg:mt-0 ${
            state ? "block" : "hidden"
          }`}
        >
          <ul className="justify-end items-center space-y-6 lg:flex lg:space-x-6 lg:space-y-0">
            {navigation.map((item, idx) => {
              return (
                <li key={idx} className="text-gray-700 hover:text-primary">
                  <a href={item.path} className="block">
                    {item.title}
                  </a>
                </li>
              );
            })}
            <span className="hidden w-px h-6 bg-gray-300 lg:block"></span>
            <div className="flex ">
              <a href="/login">
                <Button size="md" color="primary" className="">
                  Login
                </Button>
              </a>
            </div>
          </ul>
        </div>
      </div>
    </nav>
  );
}
