"use client";
import NavbarComp from "@/src/components/navbar";
import Footer from "@/src/components/footer";
import CallToActionSection from "@/src/components/callToAction";
import {
  FaFileAlt,
  FaLock,
  FaChartLine,
  FaBell,
  FaClipboardList,
} from "react-icons/fa";
import { BsCollectionFill } from "react-icons/bs";

import { Button, Card, Text, SimpleGrid } from "@mantine/core";

export default function Providers() {
  const featureData = [
    {
      icon: <FaFileAlt />,
      title: "Access Detailed Reports",
      description:
        "Quickly access comprehensive patient reports. Our platform provides detailed insights to help you make informed decisions and deliver the best care.",
    },
    {
      icon: <FaLock />,
      title: "Ensure Confidentiality",
      description:
        "We prioritize  privacy with robust security measures. Protect sensitive information with advanced encryption and compliance with privacy regulations.",
    },
    {
      icon: <BsCollectionFill />,
      title: "Streamline Supply Collection",
      description:
        "Manage and order necessary supplies through our platform. Ensure you have everything you need to provide top-notch care without any hassle.",
    },
    {
      icon: <FaBell />,
      title: "Stay Updated",
      description:
        "Receive instant notifications when patient results are available. Stay informed and provide timely care with our reliable alert system.",
    },
    {
      icon: <FaClipboardList />,
      title: "Comprehensive Test Details",
      description:
        "Access information on all tests. Ensure you have the knowledge you need to recommend the right tests and interpret results accurately.",
    },
    {
      icon: <FaChartLine />,
      title: "Monitor Patient Progress",
      description:
        "Easily track and review patient progress over time. Our platform helps you stay updated on patient health trends and outcomes.",
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
      <div className="text-accent text-3xl">{feature.icon}</div>
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
              "linear-gradient(143.6deg, rgba(83, 162, 190, 0) 20.79%, rgba(83, 162, 190, 0.26) 40.92%, rgba(83, 162, 190, 0) 70.35%)",
          }}
        ></div>
      </div>

      <section className="py-28">
        <div className="max-w-screen-xl mx-auto px-4 md:text-center md:px-8">
          <div className="max-w-xl space-y-3 md:mx-auto">
            <h3 className="text-accent font-semibold text-lg">
              Healthcare Provider Services
            </h3>
            <p className="text-secondary text-5xl font-semibold ">
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
              color="accent"
              size="sm"
              href="/login"
              component="a"
              radius="md"
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
              <h3 className=" text-3xl font-semibold md:text-4xl">
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
