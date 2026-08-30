"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MdDashboard,
  MdCalendarMonth,
  MdLocationOn,
  MdOutlineClose,
} from "react-icons/md";
import { FaUser, FaUsers } from "react-icons/fa";
import { IoMdDocument } from "react-icons/io";
import logoWhite from "../../public/logowhite.png";
import { FiLogOut, FiMenu } from "react-icons/fi";
import { Image, Button } from "@mantine/core";

import { useAuth } from "@/src/context/auth-context";

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
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Patients and clinical staff see different navigation; the active pill is
  // green for patients and blue for staff to keep the role distinction.
  const isPatient = user?.role === "patient";
  const activeAccent = isPatient ? "bg-primary" : "bg-accent";

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  /** Return the classes for a nav link, highlighting the active route. */
  const navLinkClass = (href: string) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    const base =
      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors";
    return active
      ? `${base} ${activeAccent} text-secondary shadow-sm`
      : `${base} text-white/60 hover:bg-white/10 hover:text-white`;
  };

  return (
    <div>
      {/* Mobile top bar */}
      <div className="sm:hidden flex w-full items-center justify-between bg-secondary p-3">
        <Button
          variant="subtle"
          size="sm"
          radius="md"
          onClick={() => setIsOpen(true)}
          classNames={{ root: "!text-white hover:!bg-white/10" }}
        >
          <FiMenu className="h-6 w-6" />
        </Button>
        <div className="w-28">
          <Image src={logoWhite.src} alt="HealthHub" />
        </div>
      </div>

      <nav>
        <aside
          id="default-sidebar"
          className={`fixed top-0 left-0 z-40 h-screen w-72 border-r border-white/10 transition-transform ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } sm:translate-x-0`}
          aria-label="Sidebar"
        >
          <div className="flex h-full flex-col bg-secondary px-4 py-6">
            {/* Close button (mobile only) */}
            <Button
              variant="subtle"
              size="sm"
              radius="md"
              onClick={() => setIsOpen(false)}
              className="self-start sm:!hidden"
              classNames={{ root: "!text-white hover:!bg-white/10" }}
            >
              <MdOutlineClose className="h-6 w-6" />
            </Button>

            {/* Logo */}
            <div className="mx-auto mt-2 mb-8 hidden w-40 sm:block">
              <Image src={logoWhite.src} alt="HealthHub" />
            </div>

            {/* Primary navigation */}
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-white/40">
              Menu
            </p>
            <div className="flex flex-1 flex-col gap-1">
              {(isPatient ? patientLinks : providerLinks).map((item) => (
                <Link
                  href={item.link}
                  key={item.label}
                  onClick={() => setIsOpen(false)}
                  className={navLinkClass(item.link)}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Account section */}
            <div className="mt-6 border-t border-white/10 pt-4">
              <Link
                href="#"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <FaUser className="h-5 w-5 flex-shrink-0" />
                <span>Account Settings</span>
              </Link>
              <Button
                variant="subtle"
                fullWidth
                justify="flex-start"
                radius="xl"
                onClick={handleLogout}
                leftSection={<FiLogOut className="h-5 w-5" />}
                classNames={{
                  root: "!text-white/60 hover:!bg-white/10 hover:!text-white",
                  label: "font-medium",
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </aside>
      </nav>
    </div>
  );
}
