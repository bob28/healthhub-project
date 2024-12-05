"use client";
import React, { useState } from "react";
import {
  Tabs,
  Tab,
  Input,
  Link,
  Button,
  Card,
  CardBody,
} from "@nextui-org/react";
import logoBG from "../../../public/logoBG.png";
import Image from "next/image";

export default function LoginPage() {
  const [selected, setSelected] = useState("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [createdAccount, setCreatedAccount] = useState(false);
  const validateEmail = (value) =>
    value.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$/i);
  const [signUpData, setSignUpData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    reEmail: "",
    password: "",
    rePassword: "",
  });
  const [errors, setErrors] = useState({});

  const isInvalidLoginEmail = React.useMemo(() => {
    if (loginData.email === "") return false;

    return validateEmail(loginData.email) ? false : true;
  }, [loginData.email]);

  const isInvalidSignUpEmail = React.useMemo(() => {
    if (signUpData.email === "") return false;

    return validateEmail(signUpData.email) ? false : true;
  }, [signUpData.email]);

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.id]: e.target.value });
  };

  const handleSignUpChange = (e) => {
    setSignUpData({ ...signUpData, [e.target.id]: e.target.value });
  };

  const validateSignUp = () => {
    // make sure that all the fields are not empty
    if (
      !signUpData.firstName ||
      !signUpData.lastName ||
      !signUpData.email ||
      !signUpData.reEmail ||
      !signUpData.password ||
      !signUpData.rePassword
    ) {
      return false;
    }
    // make sure that the email is valid
    if (!validateEmail(signUpData.email)) {
      setErrors({ ...errors, email: "Please enter a valid email" });
      return false;
    }
    // make sure that the re-entered email is the same as the email
    if (signUpData.reEmail !== signUpData.email) {
      setErrors({ ...errors, reEmail: "Emails do not match" });
      return false;
    }
    // make sure that the re-entered password is the same as the password
    if (signUpData.rePassword !== signUpData.password) {
      setErrors({ ...errors, rePassword: "Passwords do not match" });
      return false;
    }
    return true;
  };

  const handleLoginSubmit = async (e) => {
    // make sure that loginData.email and loginData.password are not empty
    if (!loginData.email || !loginData.password) {
      return;
    }
    if (!isInvalidLoginEmail) return;
    e.preventDefault();
    // Call the login API
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });
      const result = await response.json();
      console.log(result);
      // Handle successful login
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (!validateSignUp()) return;
    // Call the sign-up API
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signUpData),
      });
      const result = await response.json();
      setCreatedAccount(true);
      console.log(result);
      // Handle successful sign-up
    } catch (error) {
      console.error("Error signing up:", error);
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen px-5">
        <Image src={logoBG} width={175} alt="Logo" className="mb-7" />
        <Card className="max-w-full w-[450px] px-5 pt-3 text-secondary">
          <CardBody className="overflow-hidden">
            <p className="text-sm mb-5 text-center">
              Login in as a patient or healthcare provider
            </p>
            <Tabs
              fullWidth
              size="md"
              aria-label="Tabs form"
              selectedKey={selected}
              onSelectionChange={setSelected}
              variant="light"
            >
              <Tab key="login" title="Login">
                <form
                  className="flex flex-col gap-5"
                  onSubmit={handleLoginSubmit}
                >
                  <Input
                    isRequired
                    id="email"
                    placeholder="Email*"
                    type="email"
                    value={loginData.email}
                    isInvalid={isInvalidLoginEmail}
                    color={isInvalidLoginEmail ? "danger" : "default"}
                    errorMessage="Please enter a valid email"
                    onChange={handleLoginChange}
                  />
                  <Input
                    isRequired
                    id="password"
                    placeholder="Password*"
                    type="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                  />
                  <div className="flex gap-2">
                    <Button fullWidth color="primary" type="submit">
                      Login
                    </Button>
                  </div>
                  <p className="text-center text-xs justify-end">
                    Need to create an account?{" "}
                    <Link
                      className="cursor-pointer font-bold text-xs"
                      size="sm"
                      onPress={() => setSelected("sign-up")}
                    >
                      Sign up
                    </Link>
                  </p>
                </form>
              </Tab>
              <Tab key="sign-up" title="Sign up">
                <form
                  className="flex flex-col gap-4"
                  onSubmit={handleSignUpSubmit}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input
                      isRequired
                      id="firstName"
                      placeholder="First Name*"
                      type="text"
                      value={signUpData.firstName}
                      onChange={handleSignUpChange}
                    />
                    <Input
                      isRequired
                      id="lastName"
                      placeholder="Last Name*"
                      type="text"
                      value={signUpData.lastName}
                      onChange={handleSignUpChange}
                    />
                  </div>
                  <Input
                    isRequired
                    id="email"
                    placeholder="Email*"
                    type="email"
                    value={signUpData.email}
                    isInvalid={isInvalidSignUpEmail}
                    color={isInvalidSignUpEmail ? "danger" : "default"}
                    errorMessage="Please enter a valid email"
                    onChange={handleSignUpChange}
                  />
                  <Input
                    isRequired
                    id="reEmail"
                    placeholder="Re-enter Email*"
                    type="email"
                    value={signUpData.reEmail}
                    isInvalid={signUpData.reEmail !== signUpData.email}
                    color={
                      signUpData.reEmail !== signUpData.email
                        ? "danger"
                        : "default"
                    }
                    errorMessage="Emails do not match"
                    onChange={handleSignUpChange}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      isRequired
                      id="password"
                      placeholder="Password*"
                      type="password"
                      value={signUpData.password}
                      onChange={handleSignUpChange}
                    />
                    <Input
                      isRequired
                      id="rePassword"
                      placeholder="Re-enter Password*"
                      type="password"
                      value={signUpData.rePassword}
                      onChange={handleSignUpChange}
                      isInvalid={signUpData.rePassword !== signUpData.password}
                      color={
                        signUpData.rePassword !== signUpData.password
                          ? "danger"
                          : "default"
                      }
                      errorMessage="Passwords do not match"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button fullWidth color="primary" type="submit">
                      Sign up
                    </Button>
                  </div>
                  <p className="text-center text-xs justify-end">
                    Already have an account?{" "}
                    <Link
                      size="sm"
                      className="cursor-pointer font-bold text-xs"
                      onPress={() => setSelected("login")}
                    >
                      Login
                    </Link>
                  </p>
                </form>
                {createdAccount && (
                  <p className="text-left text-secondary mt-5">
                    Account created successfully! Please login into your
                    account.
                  </p>
                )}
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
