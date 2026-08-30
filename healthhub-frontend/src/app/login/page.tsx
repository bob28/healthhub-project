"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Paper,
  Image,
  TextInput,
  PasswordInput,
  Checkbox,
  Anchor,
  Button,
  Alert,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { upperFirst, useToggle } from "@mantine/hooks";
import dayjs from "dayjs";

import logoBG from "../../../public/logoBG.png";
import loginPicture from "../../../public/loginPicture.jpg";
import { useAuth } from "@/src/context/auth-context";
import { ApiError } from "@/src/services/apiClient";
import type { User } from "@/src/types/auth";

/** Where a user lands after auth: staff get the provider area, patients their own. */
const landingPath = (user: User) =>
  user.role === "patient" ? "/app/dashboard" : "/app/provider/dashboard";

/** Maps backend (DRF) field names to this form's field names for error display. */
const FIELD_MAP: Record<string, string> = {
  email: "email",
  password: "password",
  first_name: "firstName",
  last_name: "lastName",
  date_of_birth: "dob",
};

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login, register } = useAuth();
  const [type, toggle] = useToggle(["login", "register"]);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      dob: null as Date | null,
      terms: false,
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
      password: (val) =>
        val.length < 8 ? "Password must be at least 8 characters" : null,
    },
  });

  // If already authenticated, skip the login screen.
  useEffect(() => {
    if (!loading && user) {
      router.replace(landingPath(user));
    }
  }, [loading, user, router]);

  /** Validate register-only fields that depend on the current mode. */
  const validateRegisterFields = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.values.firstName.trim()) errors.firstName = "First name is required";
    if (!form.values.lastName.trim()) errors.lastName = "Last name is required";
    if (!form.values.dob) errors.dob = "Date of birth is required";
    if (!form.values.terms) errors.terms = "You must accept the terms";
    if (Object.keys(errors).length) {
      form.setErrors(errors);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setServerError(null);
    if (type === "register" && !validateRegisterFields()) return;

    setSubmitting(true);
    try {
      const authed =
        type === "register"
          ? await register({
              email: form.values.email,
              password: form.values.password,
              first_name: form.values.firstName,
              last_name: form.values.lastName,
              date_of_birth: dayjs(form.values.dob).format("YYYY-MM-DD"),
            })
          : await login(form.values.email, form.values.password);
      router.push(landingPath(authed));
    } catch (err) {
      if (err instanceof ApiError) {
        const fields = err.fieldErrors();
        const mapped: Record<string, string> = {};
        for (const [key, message] of Object.entries(fields)) {
          if (FIELD_MAP[key]) mapped[FIELD_MAP[key]] = message;
        }
        if (Object.keys(mapped).length) {
          form.setErrors(mapped);
        } else if (err.status === 401) {
          setServerError("Incorrect email or password.");
        } else {
          setServerError(err.message);
        }
      } else {
        setServerError("Unable to reach the server. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex h-screen overflow-hidden">
        <div className="w-full lg:w-1/2 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center p-5">
            <Image src={logoBG.src} alt="Logo" className="!w-44 mb-5" />
            <Paper radius="md" p="xl" shadow="xl" className="w-full">
              <p className="text-center text-secondary text-sm mb-5">
                {type === "register"
                  ? "Welcome to HealthHub! Fill out the form to create an account"
                  : "Welcome back to HealthHub! Please log in to your account."}
              </p>

              {serverError && (
                <Alert color="red" radius="md" mb="md" title="Sign-in error">
                  {serverError}
                </Alert>
              )}

              <form onSubmit={form.onSubmit(handleSubmit)}>
                <div className="flex flex-col gap-4">
                  <div className="flex w-full flex-col lg:flex-row gap-4">
                    {type === "register" && (
                      <TextInput
                        label="First Name"
                        withAsterisk
                        placeholder="Your first name"
                        radius="md"
                        className="w-full lg:w-1/2"
                        {...form.getInputProps("firstName")}
                      />
                    )}
                    {type === "register" && (
                      <TextInput
                        label="Last Name"
                        withAsterisk
                        placeholder="Your last name"
                        radius="md"
                        className="w-full lg:w-1/2"
                        {...form.getInputProps("lastName")}
                      />
                    )}
                  </div>

                  {type === "register" && (
                    <DateInput
                      label="Date of Birth"
                      withAsterisk
                      placeholder="Select your date of birth"
                      valueFormat="YYYY-MM-DD"
                      maxDate={new Date()}
                      radius="md"
                      className="w-full"
                      {...form.getInputProps("dob")}
                    />
                  )}

                  <TextInput
                    required
                    label="Email"
                    placeholder="hello@email.com"
                    radius="md"
                    className="w-full"
                    {...form.getInputProps("email")}
                  />

                  <PasswordInput
                    required
                    label="Password"
                    placeholder="Your password"
                    radius="md"
                    className="w-full"
                    {...form.getInputProps("password")}
                  />

                  {type === "register" && (
                    <Checkbox
                      label="I accept terms and conditions"
                      color="primary"
                      radius="xs"
                      className="w-full"
                      {...form.getInputProps("terms", { type: "checkbox" })}
                    />
                  )}
                </div>

                <div className="flex items-center justify-between mt-8">
                  <Anchor
                    component="button"
                    type="button"
                    c="dimmed"
                    onClick={() => {
                      setServerError(null);
                      form.clearErrors();
                      toggle();
                    }}
                    size="sm"
                  >
                    {type === "register"
                      ? "Already have an account? Login"
                      : "Don't have an account? Register"}
                  </Anchor>
                  <Button
                    type="submit"
                    radius="xl"
                    color="primary"
                    loading={submitting}
                  >
                    {upperFirst(type)}
                  </Button>
                </div>
              </form>
            </Paper>
          </div>
        </div>
        <div className="hidden lg:flex w-1/2 h-full">
          <div className="w-full h-full">
            <Image
              className="w-full h-full object-cover"
              radius="md"
              alt="Login Picture"
              src={loginPicture.src}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
