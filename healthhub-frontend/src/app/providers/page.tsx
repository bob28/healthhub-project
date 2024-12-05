"use client";
import NavbarComp from "@/src/components/navbar";
import Footer from "@/src/components/footer";
import {
  FaFileAlt,
  FaLock,
  FaChartLine,
  FaBell,
  FaLongArrowAltRight,
  FaClipboardList,
} from "react-icons/fa";
import { BsCollectionFill } from "react-icons/bs";

import { Button } from "@nextui-org/button";

export default function Providers() {
  const features = [
    {
      icon: <FaFileAlt />,
      title: "Access Detailed Reports",
      desc: "Quickly access comprehensive patient reports. Our platform provides detailed insights to help you make informed decisions and deliver the best care.",
    },
    {
      icon: <FaLock />,
      title: "Ensure Confidentiality",
      desc: "We prioritize  privacy with robust security measures. Protect sensitive information with advanced encryption and compliance with privacy regulations.",
    },
    {
      icon: <BsCollectionFill />,
      title: "Streamline Supply Collection",
      desc: "Manage and order necessary supplies through our platform. Ensure you have everything you need to provide top-notch care without any hassle.",
    },
    {
      icon: <FaBell />,
      title: "Stay Updated",
      desc: "Receive instant notifications when patient results are available. Stay informed and provide timely care with our reliable alert system.",
    },
    {
      icon: <FaClipboardList />,
      title: "Comprehensive Test Details",
      desc: "Access  information about all available tests. Ensure you have the knowledge you need to recommend the right tests and interpret results accurately.",
    },
    {
      icon: <FaChartLine />,
      title: "Monitor Patient Progress",
      desc: "Easily track and review patient progress over time. Our platform helps you stay updated on patient health trends and outcomes.",
    },
  ];

  return (
    <div>
      <NavbarComp />
      <div className="relative z-0">
        <div
          className="absolute inset-0 blur-xl h-[600px]"
          style={{
            background:
              "linear-gradient(143.6deg, rgba(83, 162, 190, 0) 20.79%, rgba(83, 162, 190, 0.26) 40.92%, rgba(83, 162, 190, 0) 70.35%)",
          }}
        ></div>
      </div>

      <section className="py-28">
        <div className="max-w-screen-xl mx-auto px-4 md:text-center md:px-8">
          <div className="max-w-xl space-y-3 md:mx-auto">
            <h3 className="text-accent font-semibold">
              Healthcare Provider Services
            </h3>
            <p className="text-secondary text-3xl font-semibold sm:text-4xl">
              Partner with HealthHub
            </p>
            <p className="text-secondary">
              Join our network of trusted healthcare providers. Collaborate with
              us to deliver exceptional care and innovative health solutions to
              patients everywhere.
            </p>
          </div>
          <div className="mt-4">
            <Button
              className="bg-accent text-white"
              size="md"
              onClick={() => window.location.replace("/login")}
            >
              Login as a Provider
            </Button>
          </div>
        </div>
      </section>
      <div className="container mx-auto ">
        <section className="py-14">
          <div className="max-w-screen-xl mx-auto px-4 text-center text-secondary md:px-8">
            <div className="max-w-2xl mx-auto">
              <h3 className=" text-3xl font-semibold sm:text-3xl">
                Key Features for Providers
              </h3>
              <p className="mt-3">
                Explore the essential tools and services designed to support
                healthcare providers. From ensuring patient privacy to accessing
                detailed reports, HealthHub equips you with everything you need
                to deliver exceptional care.
              </p>
            </div>
            <div className="mt-12">
              <ul className="grid gap-y-8 gap-x-12 sm:grid-cols-2 lg:grid-cols-3 text-secondary">
                {features.map((item, idx) => (
                  <li key={idx} className="space-y-3">
                    <div className="w-12 h-12 mx-auto bg-[#A6CFDD] rounded-full flex items-center justify-center text-lg">
                      {item.icon}
                    </div>
                    <h4 className="text-lg font-semibold">{item.title}</h4>
                    <p>{item.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        <section className="relative max-w-screen-xl mx-auto py-4 px-4 md:px-8">
          <div className="relative z-10 gap-5 items-center lg:flex">
            <div className="flex-1 max-w-lg py-5 sm:mx-auto sm:text-center lg:max-w-max lg:text-left text-secondary">
              <h3 className="text-3xl font-semibold md:text-4xl">
                Join Our Network of Healthcare Providers
              </h3>
              <p className=" leading-relaxed mt-3">
                Become a part of HealthHub and collaborate with us to deliver
                exceptional care. Access advanced tools, ensure patient privacy,
                and stay updated with real-time notifications. Sign up today to
                enhance your practice and make a difference in patient care.
              </p>
              <a href="/login">
                <Button
                  variant="flat"
                  className="bg-[#A6CFDD] text-secondary mt-5"
                  endContent={<FaLongArrowAltRight />}
                >
                  Try it now
                </Button>
              </a>
            </div>
            <div className="flex-1 mt-5 mx-auto sm:w-9/12 lg:mt-0 lg:w-auto">
              <img
                src="https://i.postimg.cc/kgd4WhyS/container.png"
                alt=""
                className="w-full"
              />
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
