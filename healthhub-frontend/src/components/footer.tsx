"use client";

import logowhite from "../../public/logowhite.png";
import { FaTwitter, FaLinkedin, FaGithub, FaInstagram } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

export default function Footer() {
  const footerNavs = [
    {
      href: "/login",
      name: "Login",
    },
    {
      href: "/patients",
      name: "Patients",
    },
    {
      href: "/providers",
      name: "Healthcare Providers",
    },
    {
      href: "/tests",
      name: "Our Tests",
    },
    {
      href: "/about",
      name: "About",
    },
  ];

  return (
    <footer className="text-slate-300 bg-secondary px-4 py-5 max-w-screen mx-auto md:px-8">
      <div className="max-w-lg sm:mx-auto sm:text-center">
        <img
          src={logowhite.src}
          className="w-36 mb-5 sm:mx-auto"
          alt="white logo"
        />
        <p className="leading-relaxed mt-2 text-[15px]">
          HealthHub is a full stack application built with a frontend of
          Next.js, React, and Tailwind CSS, and a backend of Java Spring Boot
          and MySQL. It was created by Bhavik Naik. Social media links lead to
          my personal accounts.
        </p>
      </div>
      <ul className="items-center justify-center mt-8 space-y-5 sm:flex sm:space-x-4 sm:space-y-0">
        {footerNavs.map((item, idx) => (
          <li key={idx} className=" hover:text-primary">
            <a href={item.href}>{item.name}</a>
          </li>
        ))}
      </ul>
      <div className="mt-8 items-center justify-between sm:flex">
        <div className="mt-4 sm:mt-0 text-sm">
          &copy; {new Date().getFullYear()} Bhavik Naik All rights reserved.
        </div>
        <div className="mt-6 sm:mt-0">
          <div className="text-right flex flex-row text-xl  ">
            <a
              href="mailto:bhavik.naik28@gmail.com"
              className="mx-2 hover:opacity-75"
              target="_blank"
            >
              <MdEmail />
            </a>
            <a
              href="https://linkedin.com/in/bhavik-naik"
              className="mx-2 hover:opacity-75 "
              target="_blank"
            >
              <FaLinkedin />
            </a>
            <a
              href="https://twitter.com/bhavikn28"
              target="_blank"
              className="mx-2 hover:opacity-75"
            >
              <FaTwitter />
            </a>
            <a
              href="https://instagram.com/bhavikn28"
              target="_blank"
              className="mx-2 hover:opacity-75"
            >
              <FaInstagram />
            </a>
            <a
              href="https://github.com/bob28"
              target="_blank"
              className="mx-2 hover:opacity-75"
            >
              <FaGithub />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
