"use client";
import NavbarComp from "../components/navbar";
import { Button } from "@nextui-org/button";
import Footer from "../components/footer";

export default function Home() {
  const patientFeatures = [
    {
      title: "Book Appointments",
      desc: "Book appointments with ease and convenience.",
    },
    {
      title: "View Your Results",
      desc: "View your test results and health records online.",
    },
    {
      title: "Prepare For A Test",
      desc: "Prepare for your test by following our guidelines.",
    },
    {
      title: "Our Tests",
      desc: "Learn more about the tests and services we offer.",
    },
  ];
  const healthFeatures = [
    {
      title: "Collect Supplies",
      desc: "Order supplies and collect them from our locations.",
    },
    {
      title: "See Reports",
      desc: "View reports and patient data online.",
    },
    {
      title: "Test Information",
      desc: "Learn more about the tests and services we offer.",
    },
    {
      title: " Provider Resources",
      desc: "Access resources and information.",
    },
  ];

  return (
    <div className="bg-white">
      <div className="relative z-50">
        <NavbarComp />
      </div>
      <section>
        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 -top-40 transform-gpu overflow-hidden blur-3xl sm:-top-80 -z-40"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#97c05c] to-[#C5E8B7] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            />
          </div>
          <div className="mx-auto max-w-2xl py-32 lg:py-32">
            <div className="hidden sm:mb-8 sm:flex sm:justify-center">
              <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-secondary ring-1 ring-slate-900/10 hover:ring-slate-900/20">
                Learn more about this SaaS application.{" "}
                <a href="#" className="font-semibold text-secondary">
                  <span aria-hidden="true" className="absolute inset-0" />
                  Read more <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-balance text-5xl font-semibold tracking-tight text-secondary sm:text-7xl">
                Empowering Your Health Journey
              </h1>
              <p className="mt-8 text-pretty text-lg font-medium text-slate-500 sm:text-xl/8">
                At HealthHub, we provide comprehensive healthcare tests and
                personalized patient care to ensure you stay informed and in
                control of your health. Discover a seamless experience tailored
                to your needs.
              </p>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#97c05c] to-[#C5E8B7] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            />
          </div>
        </div>
      </section>
      <div className="container mx-auto w-5/6">
        <div className="flex flex-col lg:flex-row justify-center items-center mb-8 gap-x-32 ">
          <div className="flex-1 text-center  ">
            <h2 className="text-3xl text-secondary">
              For <span className="text-primary font-bold">Patients</span>
            </h2>
            <p className="mt-4  text-secondary">
              Your health is our top priority. We are dedicated to offering
              compassionate, efficient, and reliable testing services of the
              highest quality to help you manage your health effectively.
            </p>
            <div className="relative mt-12">
              <ul className="grid gap-5 grid-cols-2 text-secondary ">
                {patientFeatures.map((item, idx) => (
                  <li key={idx} className="space-y-3 p-4   text-center">
                    <h4 className="text-lg font-semibold">{item.title}</h4>
                    <p>{item.desc}</p>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-center mt-10 gap-x-5">
                <a href="/login">
                  <Button size="md" color="primary" className="">
                    Login as a Patient
                  </Button>
                </a>
                <a href="/patients">
                  <Button
                    size="md"
                    color="secondary"
                    className=""
                    variant="bordered"
                  >
                    Patient Services
                  </Button>
                </a>
              </div>
            </div>
          </div>
          <div className="w-1 bg-slate-200 h-96 hidden lg:block"></div>
          <div className="flex-1 text-center  mt-10 lg:mt-0">
            <h2 className="text-3xl text-secondary ">
              For{" "}
              <span className="text-accent font-bold ">
                Healthcare Providers
              </span>
            </h2>
            <p className="mt-4  text-secondary">
              Your health is our top priority. We are dedicated to offering
              compassionate, efficient, and reliable testing services of the
              highest quality to help you manage your health effectively.
            </p>
            <div className="relative mt-12">
              <ul className="grid gap-5 grid-cols-2 text-secondary ">
                {healthFeatures.map((item, idx) => (
                  <li key={idx} className="space-y-3 p-4  text-center">
                    <h4 className="text-lg font-semibold">{item.title}</h4>
                    <p>{item.desc}</p>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-center mt-10 gap-x-5">
                <a href="/login">
                  <Button size="md" className="bg-accent text-white">
                    Login as a Healthcare Provider
                  </Button>
                </a>
                <Button
                  size="md"
                  color="secondary"
                  className=""
                  variant="bordered"
                >
                  Provider Services
                </Button>
              </div>
            </div>
          </div>
        </div>
        <section className="py-14">
          <div className="max-w-screen-xl mx-auto px-4 md:text-center md:px-8">
            <div className="max-w-xl md:mx-auto">
              <h3 className="text-secondary text-3xl font-semibold sm:text-4xl">
                Join HealthHub Today
              </h3>
              <p className="mt-3 text-gray-600">
                Take control of your health with HealthHub. Sign up to access
                comprehensive healthcare tests and personalized patient care.
                Whether you’re looking to manage your health proactively or need
                reliable testing services, we’re here to support you every step
                of the way.
              </p>
            </div>
            <div className="flex gap-3 items-center mt-4 md:justify-center">
              <a href="/login">
                <Button size="lg" color="primary" className="">
                  Login or Sign Up
                </Button>
              </a>
              <a href="/tests">
                <Button
                  variant="bordered"
                  size="lg"
                  color="secondary"
                  className=""
                >
                  View Tests
                </Button>
              </a>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
