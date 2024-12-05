"use client";
import { useState } from "react";
import NavbarComp from "@/src/components/navbar";
import Footer from "@/src/components/footer";
import medicalTests from "@/src/tests.json";
import {
  FaCalendarAlt,
  FaFileAlt,
  FaLock,
  FaChartLine,
  FaBell,
  FaLongArrowAltRight,
  FaClipboardList,
} from "react-icons/fa";
import {
  Button,
  Autocomplete,
  AutocompleteItem,
  Card,
  CardBody,
  Accordion,
  AccordionItem,
  CardFooter,
  CardHeader,
} from "@nextui-org/react";

export default function Tests() {
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  //    group the tests by category
  const groupedTests = medicalTests.reduce(
    (acc: { [key: string]: typeof medicalTests }, test) => {
      const { category } = test;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(test);
      return acc;
    },
    {}
  );

  //    Create a new group called "Other" for categories with less than 2 tests
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

  const medicalCategories = {
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
            <h3 className="text-primary font-semibold ">Testing</h3>
            <p className="text-secondary text-3xl font-semibold sm:text-4xl">
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
          <div className="mt-10">
            <Autocomplete
              defaultItems={medicalTests}
              aria-label="Search for a test"
              variant="bordered"
              size="lg"
              placeholder="Start typing to search for a test..."
              className="max-w-md shadow-md border-none rounded-b-none"
              onSelectionChange={(item) => {
                setSelectedTest(item);
              }}
            >
              {(test) => (
                <AutocompleteItem
                  key={test.id}
                  textValue={test.name}
                  className="border-none"
                >
                  <div className="flex gap-2 items-center ">
                    <div className="flex flex-col text-secondary">
                      <span className="text-small">{test.name}</span>
                      <span className="text-tiny ">{test.category}</span>
                    </div>
                  </div>
                </AutocompleteItem>
              )}
            </Autocomplete>
            <div
              className="max-w-md mx-auto flex items-center justify-center "
              classNames={{}}
            >
              {selectedTest &&
                medicalTests
                  .filter((test) =>
                    test.id.toLowerCase().includes(selectedTest.toLowerCase())
                  )
                  .map((test) => (
                    <Card
                      isBlurred
                      key={test.id}
                      className="bg-transparent rounded-t-none w-full"
                    >
                      <CardHeader className="justify-between align-middle px-5 pt-5">
                        <div className="flex flex-col items-start justify-center">
                          <h4 className="text-lg font-semibold leading-none text-secondary">
                            {test.name}
                          </h4>
                        </div>
                        <div>
                          <p className="text-secondary text-xs">{test.id}</p>
                        </div>
                      </CardHeader>
                      <CardBody className="px-5 pb-5 text-small text-secondary -mt-2">
                        <p>{test.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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
                        <div className="mt-3">
                          <h5 className="text-md font-bold">Preparation:</h5>
                          <p>{test.preparation}</p>
                        </div>
                      </CardBody>
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
            </p>
          </div>

          <Accordion variant="light">
            {Object.keys(groupedTests).map((category) => (
              <AccordionItem
                key={category}
                title={category}
                subtitle={medicalCategories[category]}
              >
                <ul>
                  {groupedTests[category].map((test) => (
                    <li key={test.id} className="text-secondary">
                      <b>{test.name}</b> - {test.description}
                    </li>
                  ))}
                </ul>
              </AccordionItem>
            ))}
          </Accordion>
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
                src="https:i.postimg.cc/kgd4WhyS/container.png"
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
