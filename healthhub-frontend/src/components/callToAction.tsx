import { Button } from "@mantine/core";
import { FaLongArrowAltRight } from "react-icons/fa";

export default function CallToActionSection() {
  return (
    <section className="relative max-w-screen-xl mx-auto py-4 px-4 md:px-8">
      <div className="relative z-10 gap-5 items-center lg:flex">
        <div className="flex-1 max-w-lg py-5 sm:mx-auto sm:text-center lg:max-w-max lg:text-left text-secondary">
          <h3 className="text-3xl font-semibold md:text-4xl">
            Take the Next Step in Your Health Journey
          </h3>
          <p className=" leading-relaxed mt-3">
            Join HealthHub today and gain access to comprehensive healthcare
            tests and personalized patient care. Whether you’re looking to book
            an appointment, view your test results, or track your health
            progress, we’re here to support you every step of the way. Sign up
            now to start your journey towards better health.
          </p>
          <a href="/login">
            <Button
              variant=""
              color="primary"
              className="mt-5"
              rightSection={<FaLongArrowAltRight />}
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
  );
}
