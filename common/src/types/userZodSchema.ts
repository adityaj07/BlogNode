import z from "zod";

export const signupBody = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
  password: z
    .string()
    .min(4, "Password must have a minimum length of 4.")
    .max(6, "Password cannot be of greater than 6 characters."),
});

export const loginBody = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(4, "Password must have a minimum length of 4.")
    .max(6, "Password cannot be of greater than 6 characters."),
});

export type signupBody = z.infer<typeof signupBody>;
export type loginBody = z.infer<typeof loginBody>;
