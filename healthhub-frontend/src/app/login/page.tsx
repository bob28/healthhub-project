"use client";

import {
  Paper,
  Image,
  TextInput,
  PasswordInput,
  Checkbox,
  Stack,
  Group,
  Anchor,
  Button,
  Radio,
  Flex,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { upperFirst, useToggle } from "@mantine/hooks";
import logoBG from "../../../public/logoBG.png";
import loginPicture from "../../../public/loginPicture.jpg";

export default function LoginPage() {
  const [type, toggle] = useToggle(["login", "register"]);

  const form = useForm({
    initialValues: {
      email: "",
      firstName: "",
      lastName: "",
      userType: "patient",
      password: "",
      terms: false,
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
      password: (val) =>
        val.length <= 6
          ? "Password should include at least 6 characters"
          : null,
    },
  });

  const submitForm = (values: any) => {
    if (type === "register") {
      console.log("Registering", values);
    } else {
      console.log("Logging in", values);
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
              <form
                onSubmit={form.onSubmit(() => {
                  submitForm(form.values);
                })}
              >
                <Stack>
                  {type === "register" && (
                    <Radio.Group
                      name="userType"
                      label="Are you a:"
                      withAsterisk
                      description="Please select whether you are registering as a patient or a provider."
                      value={form.values.userType}
                      onChange={(event) =>
                        form.setFieldValue("userType", event)
                      }
                    >
                      <Group mt="xs">
                        <Radio
                          value="patient"
                          label="A Patient"
                          color="primary"
                        />
                        <Radio
                          value="provider"
                          label="A Healthcare Provider"
                          color="accent"
                        />
                      </Group>
                    </Radio.Group>
                  )}
                  <Flex className="w-full flex-col lg:flex-row gap-4">
                    {type === "register" && (
                      <TextInput
                        label="First Name"
                        withAsterisk
                        required
                        placeholder="Your first name"
                        value={form.values.firstName}
                        onChange={(event) =>
                          form.setFieldValue(
                            "firstName",
                            event.currentTarget.value
                          )
                        }
                        radius="md"
                        className="w-full lg:w-1/2"
                      />
                    )}
                    {type === "register" && (
                      <TextInput
                        label="Last Name"
                        placeholder="Your last name"
                        withAsterisk
                        required
                        value={form.values.lastName}
                        onChange={(event) =>
                          form.setFieldValue(
                            "lastName",
                            event.currentTarget.value
                          )
                        }
                        radius="md"
                        className="w-full lg:w-1/2"
                      />
                    )}
                  </Flex>

                  <TextInput
                    required
                    label="Email"
                    placeholder="hello@email.com"
                    value={form.values.email}
                    onChange={(event) =>
                      form.setFieldValue("email", event.currentTarget.value)
                    }
                    error={form.errors.email && "Invalid email"}
                    radius="md"
                    className="w-full"
                  />

                  <PasswordInput
                    required
                    label="Password"
                    placeholder="Your password"
                    value={form.values.password}
                    onChange={(event) =>
                      form.setFieldValue("password", event.currentTarget.value)
                    }
                    error={
                      form.errors.password &&
                      "Password should include at least 6 characters"
                    }
                    radius="md"
                    className="w-full"
                  />

                  {type === "register" && (
                    <Checkbox
                      label="I accept terms and conditions"
                      checked={form.values.terms}
                      color={
                        form.values.userType === "patient"
                          ? "primary"
                          : "accent"
                      }
                      onChange={(event) =>
                        form.setFieldValue("terms", event.currentTarget.checked)
                      }
                      radius="xs"
                      className="w-full"
                    />
                  )}
                </Stack>

                <Group justify="space-between" mt="xl">
                  <Anchor
                    component="button"
                    type="button"
                    c="dimmed"
                    onClick={() => toggle()}
                    size="sm"
                  >
                    {type === "register"
                      ? "Already have an account? Login"
                      : "Don't have an account? Register"}
                  </Anchor>
                  <Button
                    type="submit"
                    radius="xl"
                    color={
                      form.values.userType === "patient" ? "primary" : "accent"
                    }
                  >
                    {upperFirst(type)}
                  </Button>
                </Group>
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
