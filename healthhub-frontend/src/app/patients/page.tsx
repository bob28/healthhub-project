"use client";
import NavbarComp from "@/src/components/navbar";
import Footer from "@/src/components/footer";
import CallToActionSection from "@/src/components/callToAction";
import {
  FaCalendarAlt,
  FaFileAlt,
  FaLock,
  FaChartLine,
  FaBell,
  FaClipboardList,
} from "react-icons/fa";

import { Button, Card, Text, SimpleGrid } from "@mantine/core";

export default function Patients() {
  const featureData = [
    {
      icon: <FaCalendarAlt />,
      title: "Schedule Your Appointments ",
      description:
        "Easily book your healthcare appointments online. Choose the date and time that works best for you and get reminders to ensure you never miss a visit.",
    },
    {
      icon: <FaFileAlt />,
      title: "Access Your Test Results Anytime",
      description:
        "Get quick and secure access to your test results as soon as they are available. Stay informed about your health status with detailed reports and insights.",
    },
    {
      icon: <FaLock />,
      title: "Your Data, Secure and Confidential",
      description:
        "We prioritize your privacy and security. Your personal and health information is protected with advanced encryption and  confidentiality protocols.",
    },
    {
      icon: <FaChartLine />,
      title: "Monitor Your Health Over Time",
      description:
        "Easily view your  test results and track your health progress. Our platform helps you understand trends and make informed decisions about your health.",
    },
    {
      icon: <FaBell />,
      title: "Stay Updated with Notifications",
      description:
        "Receive notifications about your appointments, test results, and health updates. Never miss important information with our reliable alert system.",
    },
    {
      icon: <FaClipboardList />,
      title: "Get Ready for Your Tests",
      description:
        "Access detailed instructions and tips on how to prepare for your tests. Ensure accurate results and a smooth testing experience with our  guidelines.",
    },
  ];

  const features = featureData.map((feature) => (
    <Card
      key={feature.title}
      shadow="md"
      radius="md"
      padding="xl"
      className="text-left"
    >
      <div className="text-primary text-3xl">{feature.icon}</div>
      <Text fz="lg" fw={500} mt="md" c="secondary">
        {feature.title}
      </Text>
      <Text fz="sm" c="dimmed" mt="sm">
        {feature.description}
      </Text>
    </Card>
  ));

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
            <h3 className="text-primary font-semibold text-lg">
              Patient Services
            </h3>
            <p className="text-secondary text-5xl font-semibold ">
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
              component="a"
              href="/login"
              color="primary"
              size="sm"
              radius="md"
              className=""
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
              <h3 className=" text-4xl font-semibold sm:text-4xl">
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
              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt={50}>
                {features}
              </SimpleGrid>
            </div>
          </div>
        </section>
        <CallToActionSection />
      </div>

      <Footer />
    </div>
  );
}
