"use client";
import { useState } from "react";
import NavbarComp from "@/src/components/navbar";
import Footer from "@/src/components/footer";
import CallToActionSection from "@/src/components/callToAction";
import medicalTests from "@/src/tests.json";

import {
  Autocomplete,
  AutocompleteProps,
  Group,
  Text,
  Card,
  Accordion,
} from "@mantine/core";

import { FaSearch } from "react-icons/fa";

const renderAutocompleteOption: AutocompleteProps["renderOption"] = ({
  option,
}) => (
  <Group gap="sm">
    <div className="text-secondary">
      <Text size="md">{option.value}</Text>
      <Text size="sm" opacity={0.5}>
        {medicalTests.filter((test) => test.value === option.value)[0].category}
      </Text>
    </div>
  </Group>
);

export default function Tests() {
  const [selectedTest, setSelectedTest] = useState<string>("");

  // group the tests by category
  const groupedTests = medicalTests.reduce(
    (
      acc: { [key in keyof typeof medicalCategories]?: typeof medicalTests },
      test
    ) => {
      const { category } = test;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(test);
      return acc;
    },
    {}
  );

  // Create a new group called "Other" for categories with less than 2 tests
  const otherTests = [];
  Object.keys(groupedTests).forEach((category) => {
    if (groupedTests[category].length < 2) {
      otherTests.push(...groupedTests[category]);
      delete groupedTests[category];
    }
  });

  if (otherTests.length > 0) {
    groupedTests["Other"] = otherTests;
  }

  const medicalCategories: { [key: string]: string } = {
    Hematology:
      "Tests that examine your blood cells and blood-related conditions. These help detect conditions like anemia, blood clotting problems, and blood cell disorders.",
    "Infectious Disease":
      "Tests that check for infections caused by viruses, bacteria, or other organisms. These help identify if you have an infection and what's causing it.",
    "Clinical Chemistry":
      "Basic tests that check different chemicals in your blood and other body fluids to see how well your organs are working and assess your overall health.",
    Cardiology:
      "Tests focused on your heart health, including how well your heart is functioning and identifying any potential heart-related conditions.",
    Endocrinology:
      "Tests that check your hormone levels and how well your hormone-producing glands are working. These help identify conditions like thyroid problems or diabetes.",
    Immunology:
      "Tests that examine how well your immune system is working and can help identify allergies or conditions where your immune system isn't functioning properly.",
    Microbiology:
      "Tests that look for specific germs like bacteria or fungi that might be causing an infection in your body.",
    Oncology:
      "Tests related to cancer screening, diagnosis, and monitoring cancer treatment progress.",
    Radiology:
      "Imaging tests like X-rays, CT scans, and MRIs that create pictures of the inside of your body to check for various conditions.",
    Pulmonology:
      "Tests that check how well your lungs are working and help diagnose breathing problems or lung conditions.",
    Neurology:
      "Tests that examine your brain and nervous system function to help identify neurological conditions or disorders.",
    "Cardiac Markers":
      "Specific blood tests that can show if your heart is stressed or damaged, often used to check for heart attacks or heart disease.",
    "Reproductive Health":
      "Tests related to fertility, pregnancy, hormones, and reproductive system health for both men and women.",
    Genetics:
      "Tests that look at your genes to identify inherited conditions or your risk for certain diseases.",
    Nutrition:
      "Tests that check for vitamin levels, minerals, and other nutrients in your body to ensure you're getting proper nutrition.",
    "Allergy/Immunology":
      "Tests that help identify specific substances you might be allergic to and examine how your immune system responds to them.",
    Other:
      "Additional specialized tests that don't fall into the above categories but may be important for your specific health needs.",
  };

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
      <section className="py-28 z-20">
        <div className="max-w-screen-xl mx-auto px-4 md:text-center md:px-8 relative">
          <div className="max-w-xl space-y-3 md:mx-auto">
            <h3 className="text-primary font-semibold text-lg">Testing</h3>
            <p className="text-secondary text-5xl font-semibold">
              Comprehensive Lab Tests
            </p>
            <p className="text-secondary">
              Explore our extensive range of medical lab tests designed to meet
              all your healthcare needs. From routine screenings to specialized
              diagnostics, find the tests you need to stay informed about your
              health. Search for tests by name to get started or expand out the
              categories below to see what we offer.
            </p>
          </div>
          <div className="mt-10 ">
            <Autocomplete
              data={medicalTests}
              aria-label="Search for a test"
              variant=""
              size="md"
              placeholder="Start typing to search for a test..."
              className="mx-auto max-w-md shadow-md rounded-t-md  rounded-b-none bg-primary"
              onChange={setSelectedTest}
              comboboxProps={{ shadow: "md" }}
              value={selectedTest}
              renderOption={renderAutocompleteOption}
              classNames={{
                input: "!text-secondary placeholder:!text-secondary",
              }}
              leftSection={<FaSearch className="text-secondary" />}
            ></Autocomplete>

            <div className="max-w-md mx-auto flex items-center justify-center ">
              {selectedTest &&
                medicalTests
                  .filter(
                    (test) =>
                      test.value.toLowerCase() === selectedTest.toLowerCase()
                  )
                  .map((test) => (
                    <Card
                      shadow="md"
                      padding="lg"
                      key={test.id}
                      className="w-full"
                    >
                      <Card.Section className="justify-between align-middle text-left pt-5 px-5">
                        <h4 className="text-lg font-semibold text-secondary ">
                          {test.value}
                        </h4>
                        <p className="text-secondary text-xs my-2">{test.id}</p>
                      </Card.Section>
                      <Card.Section className="pb-5 px-5 text-sm text-secondary  text-left">
                        <p>{test.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 mb-4 gap-4 mt-4">
                          {[
                            { label: "Type", value: test.type },
                            { label: "Category", value: test.category },
                            {
                              label: "Turnaround Time",
                              value: test.turnaroundTime,
                            },
                            { label: "Sample", value: test.sampleRequired },
                          ].map((item, index) => (
                            <div key={index}>
                              <p>
                                <b>{item.label}:</b> <br /> {item.value}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className=" text-left">
                          <h5 className="text-md font-bold">Preparation:</h5>
                          <p className="text-sm">{test.preparation}</p>
                        </div>
                      </Card.Section>
                    </Card>
                  ))}
            </div>
          </div>
        </div>
      </section>
      <div className="container mx-auto relative">
        <section className="relative max-w-screen-xl mx-auto py-4 px-4 md:px-8">
          <div className="max-w-2xl text-secondary mb-10">
            <h3 className=" text-3xl font-semibold sm:text-3xl">
              Our Comprehensive Test Offerings
            </h3>
            <p className="mt-3">
              Browse through our extensive list of medical lab tests. From
              routine check-ups to specialized diagnostics, find the tests you
              need to stay proactive about your health.
              <br />
              Click on the categories below to expand and view the tests
              available.
            </p>
          </div>

          <Accordion
            variant="contained"
            className="mb-10"
            chevronPosition="left"
          >
            {Object.entries(groupedTests).map(([category, tests]) => {
              const categoryDescription =
                medicalCategories[category] || "No description available.";
              return (
                <Accordion.Item key={category} value={category}>
                  <Accordion.Control>
                    {category}
                    <p className="text-secondary text-sm mb-4">
                      {categoryDescription}
                    </p>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <ul>
                      {tests.map((test) => (
                        <li key={test.id} className="text-secondary">
                          <b>{test.value}</b> - {test.description}
                        </li>
                      ))}
                    </ul>
                  </Accordion.Panel>
                </Accordion.Item>
              );
            })}
          </Accordion>
        </section>
      </div>
      <CallToActionSection />
      <Footer />
    </div>
  );
}
