import NavbarComp from "@/src/components/navbar";
import Footer from "@/src/components/footer";
import { Button, Card } from "@mantine/core";

export default function AboutPage() {
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
        <section className="pt-28 pb-20">
          <div className="max-w-screen-xl mx-auto px-4 md:text-center md:px-8">
            <div className="max-w-xl space-y-3 md:mx-auto">
              <h3 className="text-primary font-semibold"></h3>
              <p className="text-secondary text-5xl font-semibold">
                This is a SaaS Application Developed By Bhavik
              </p>
              <p className="text-secondary">
                This project aims to provide a comprehensive health management
                platform for patients and healthcare providers. It includes
                features such as appointment scheduling, medical records
                management, and patient communication tools.
              </p>
            </div>
          </div>
        </section>
      </div>
      <section className="py-28">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8">
          <div className="max-w-xl space-y-3 md:mx-auto text-center">
            <h2 className="text-primary text-4xl font-bold">About HealthHub</h2>
            <p className="text-secondary text-lg">
              HealthHub is a comprehensive health management platform designed
              to improve the healthcare experience for both patients and
              providers. Inspired by the need to replace a poorly designed
              health application, HealthHub offers a user-friendly interface and
              a suite of powerful features.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <h3 className="text-primary text-2xl font-semibold">React</h3>
              <p className="text-secondary mt-2">
                React is used for building the dynamic and responsive user
                interface of HealthHub.
              </p>
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <h3 className="text-primary text-2xl font-semibold">Next.js</h3>
              <p className="text-secondary mt-2">
                Next.js powers the server-side rendering and static site
                generation, ensuring fast load times and SEO optimization.
              </p>
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <h3 className="text-primary text-2xl font-semibold">MySQL</h3>
              <p className="text-secondary mt-2">
                MySQL is the database management system used to store and manage
                all health records and user data securely.
              </p>
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <h3 className="text-primary text-2xl font-semibold">Django</h3>
              <p className="text-secondary mt-2">
                Django is the backend framework that handles the business logic
                and API endpoints for HealthHub.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-28">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="text-center">
              <h2 className="text-primary text-4xl font-bold">
                Connect with Me
              </h2>
              <p className="text-secondary text-lg mt-4">
                Follow me on social media and check out my other projects on
                GitHub.
              </p>
              <div className="mt-8 flex justify-center space-x-4">
                <Button
                  component="a"
                  href="https://github.com/yourusername"
                  variant="outline"
                  color="primary"
                >
                  GitHub
                </Button>
                <Button
                  component="a"
                  href="https://twitter.com/yourusername"
                  variant="outline"
                  color="primary"
                >
                  Twitter
                </Button>
                <Button
                  component="a"
                  href="https://linkedin.com/in/yourusername"
                  variant="outline"
                  color="primary"
                >
                  LinkedIn
                </Button>
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-primary text-4xl font-bold">
                Contribute to HealthHub
              </h2>
              <p className="text-secondary text-lg mt-4">
                HealthHub is an open-source project. Feel free to contribute and
                help improve the platform.
              </p>
              <Button
                component="a"
                href="https://github.com/yourusername/healthhub-project"
                className="mt-8"
                color="primary"
              >
                View on GitHub
              </Button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
