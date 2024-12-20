"use client";
import NavbarComp from "@/src/components/navbar";
import Footer from "@/src/components/footer";
import {
  FaCalendarAlt,
  FaFileAlt,
  FaLock,
  FaChartLine,
  FaBell,
  FaLongArrowAltRight,
  FaClipboardList,
} from "react-icons/fa";

import { Button } from "@nextui-org/button";

export default function Patients() {
  const features = [
    {
      icon: <FaCalendarAlt />,
      title: "Schedule Your Appointments with Ease",
      desc: "Easily book your healthcare appointments online. Choose the date and time that works best for you and get reminders to ensure you never miss a visit.",
    },
    {
      icon: <FaFileAlt />,
      title: "Access Your Test Results Anytime",
      desc: "Get quick and secure access to your test results as soon as they are available. Stay informed about your health status with detailed reports and insights.",
    },
    {
      icon: <FaLock />,
      title: "Your Data, Secure and Confidential",
      desc: "We prioritize your privacy and security. Your personal and health information is protected with advanced encryption and  confidentiality protocols.",
    },
    {
      icon: <FaChartLine />,
      title: "Monitor Your Health Over Time",
      desc: "Easily view your  test results and track your health progress. Our platform helps you understand trends and make informed decisions about your health.",
    },
    {
      icon: <FaBell />,
      title: "Stay Updated with Notifications",
      desc: "Receive notifications about your appointments, test results, and health updates. Never miss important information with our reliable alert system.",
    },
    {
      icon: <FaClipboardList />,
      title: "Get Ready for Your Tests",
      desc: "Access detailed instructions and tips on how to prepare for your tests. Ensure accurate results and a smooth testing experience with our  guidelines.",
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
              "linear-gradient(143.6deg, rgba(151, 192, 92, 0) 20.79%, rgba(151, 192, 92, 0.26) 40.92%, rgba(151, 192, 92, 0) 70.35%)",
          }}
        ></div>
      </div>
      <section className="py-28">
        <div className="max-w-screen-xl mx-auto px-4 md:text-center md:px-8">
          <div className="max-w-xl space-y-3 md:mx-auto">
            <h3 className="text-primary font-semibold">Patient Services</h3>
            <p className="text-secondary text-3xl font-semibold sm:text-4xl">
              Your Health, Our Commitment
            </p>
            <p className="text-secondary">
              Explore the comprehensive services and resources available to you
              as a HealthHub patient. From easy test scheduling and quick access
              to results, to personalized health insights and dedicated support,
              we’re here to help you take charge of your health journey.
            </p>
          </div>
          <div className="mt-4">
            <Button
              color="primary"
              size="md"
              className=""
              onClick={() => window.location.replace("/login")}
            >
              Login as a Patient
            </Button>
          </div>
        </div>
      </section>
      <div className="container mx-auto ">
        <section className="py-14">
          <div className="max-w-screen-xl mx-auto px-4 text-center text-secondary md:px-8">
            <div className="max-w-2xl mx-auto">
              <h3 className=" text-3xl font-semibold sm:text-3xl">
                Discover Our Key Features
              </h3>
              <p className="mt-3">
                Explore the essential tools and services designed to enhance
                your healthcare experience. From booking appointments to
                tracking your health progress, HealthHub provides everything you
                need to stay informed and in control.
              </p>
            </div>
            <div className="mt-12">
              <ul className="grid gap-y-8 gap-x-12 sm:grid-cols-2 lg:grid-cols-3 text-secondary">
                {features.map((item, idx) => (
                  <li key={idx} className="space-y-3">
                    <div className="w-12 h-12 mx-auto bg-[#CFE2B6] rounded-full flex items-center justify-center text-lg">
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
                Take the Next Step in Your Health Journey
              </h3>
              <p className=" leading-relaxed mt-3">
                Join HealthHub today and gain access to comprehensive healthcare
                tests and personalized patient care. Whether you’re looking to
                book an appointment, view your test results, or track your
                health progress, we’re here to support you every step of the
                way. Sign up now to start your journey towards better health.
              </p>
              <a href="/login">
                <Button
                  variant="flat"
                  className="bg-[#CFE2B6] text-secondary mt-5"
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
