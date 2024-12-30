"use client";

import { useState } from "react";
import {
  MdDashboard,
  MdLogout,
  MdCalendarMonth,
  MdLocationOn,
  MdOutlineClose,
} from "react-icons/md";
import { FaUser, FaUsers } from "react-icons/fa";
import { IoMdDocument } from "react-icons/io";
import logo from "../../public/healthhub-secondary.png";
import { FiLogOut, FiMenu } from "react-icons/fi";
import { Image, Divider, Button } from "@mantine/core";

const patientLinks = [
  { link: "/app/dashboard", label: "Dashboard", icon: MdDashboard },
  { link: "/app/reports", label: "Reports", icon: IoMdDocument },
  { link: "/app/appointments", label: "Appointments", icon: MdCalendarMonth },
  { link: "/app/locations", label: "Locations", icon: MdLocationOn },
];

const providerLinks = [
  { link: "/app/provider/dashboard", label: "Dashboard", icon: MdDashboard },
  {
    link: "/app/provider/reports",
    label: "Complete a Report",
    icon: IoMdDocument,
  },
  {
    link: "/app/provider/appointments",
    label: "Appointments",
    icon: MdCalendarMonth,
  },
  { link: "/app/provider/patients", label: "Patients", icon: FaUsers },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPatient, setIsPatient] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <div
        className={`sm:hidden w-full flex justify-between p-3 z-50 ${
          isPatient ? "bg-primary" : "bg-accent"
        }`}
      >
        <Button
          color="secondary"
          variant="subtle"
          size="sm"
          radius="md"
          onClick={toggleSidebar}
        >
          <FiMenu className="w-6 h-6" />
        </Button>

        <div className="w-24">
          <Image
            src={logo.src}
            alt="Logo"
            className="justify-center items-center mx-auto"
          />
        </div>
      </div>
      <nav>
        <aside
          id="default-sidebar"
          className={`fixed top-0 left-0 z-40 w-72 h-screen transition-transform ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } sm:translate-x-0`}
          aria-label="Sidebar"
        >
          <div
            className={`h-full px-3 py-4 overflow-y-auto ${
              isPatient ? "bg-primary" : "bg-accent"
            }`}
          >
            <div className="h-full flex flex-col justify-between">
              <div>
                <Button
                  color="secondary"
                  variant="subtle"
                  size="sm"
                  radius="md"
                  onClick={toggleSidebar}
                  className="flex justify-start items-center sm:!hidden"
                >
                  <MdOutlineClose className="w-7 h-7" />
                </Button>
              </div>
              <Image
                src={logo.src}
                alt="Logo"
                className="!w-40 justify-center items-center mx-auto !mt-5 !hidden sm:!block"
              />
              <div className="space-y-4 font-medium flex-1 mt-10">
                {(isPatient ? patientLinks : providerLinks).map((item) => (
                  <a
                    href={item.link}
                    key={item.label}
                    className={`flex items-center p-2 text-secondary font-semibold rounded-lg hover:bg-secondary group ${
                      isPatient ? "hover:text-primary" : "hover:text-accent"
                    }`}
                  >
                    <item.icon className="flex-shrink-0 w-7 h-7 transition duration-75" />
                    <span className="flex-1 ms-3 whitespace-nowrap">
                      {item.label}
                    </span>
                  </a>
                ))}
              </div>
              <div className="space-y-2 font-medium">
                <Divider my="xl" color="secondary" />
                <a
                  href="#"
                  className={`flex items-center p-2 text-secondary font-semibold rounded-lg hover:bg-secondary group ${
                    isPatient ? "hover:text-primary" : "hover:text-accent"
                  }`}
                >
                  <FaUser className="flex-shrink-0 w-7 h-6 transition duration-75" />
                  <span className="flex-1 ms-3 whitespace-nowrap">
                    Account Settings
                  </span>
                </a>

                <a
                  href="#"
                  className={`flex items-center p-2 text-secondary font-semibold rounded-lg hover:bg-secondary group ${
                    isPatient ? "hover:text-primary" : "hover:text-accent"
                  }`}
                >
                  <FiLogOut className="flex-shrink-0 w-7 h-7 transition duration-75" />
                  <span className="flex-1 ms-3 whitespace-nowrap">Logout</span>
                </a>
              </div>
            </div>
          </div>
        </aside>
      </nav>
    </div>
  );
}
