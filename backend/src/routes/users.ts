import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";
import { validator } from "hono/validator";
import { setCookie } from "hono/cookie";
import { sha256 } from "hono/utils/crypto";
import { statusCode } from "@adityaj07/blognode-common/dist/types/statusCode";
import {
  signupBody,
  loginBody,
} from "@adityaj07/blognode-common/dist/types/userZodSchema";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    COOKIE_SECRET: string;
  };
}>();

// const signupBody = z.object({
//   email: z.string().email("Invalid email address"),
//   name: z.string().optional(),
//   password: z
//     .string()
//     .min(4, "Password must have a minimum length of 4.")
//     .max(6, "Password cannot be of greater than 6 characters."),
// });

// export const loginBody = z.object({
//   email: z.string().email("Invalid email address"),
//   password: z
//     .string()
//     .min(4, "Password must have a minimum length of 4.")
//     .max(6, "Password cannot be of greater than 6 characters."),
// });

app.post(
  "/signup",
  validator("json", (value, c) => {
    const parsed = signupBody.safeParse(value);

    if (!parsed.success) {
      return c.json({
        status: statusCode.invalidCredentials,
        msg: "Invalid credentials.",
      });
    }

    return parsed.data;
  }),
  async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const { email, name = null, password } = c.req.valid("json");

    try {
      const existingUser = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (existingUser) {
        return c.json({
          status: statusCode.invalidCredentials,
          msg: `User with email "${existingUser.email}" already exists. `,
        });
      }

      // hashing the password
      const hashedPassword = await sha256(password);

      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword as string,
        },
      });

      const token = await sign({ id: user.id }, c.env.JWT_SECRET);

      setCookie(c, "Bearer", token, {
        httpOnly: true,
      });

      return c.json({
        status: statusCode.createdSucess,
        token: token,
        msg: "User created successfully",
      });
    } catch (error) {
      return c.json({
        status: statusCode.authError,
        msg: `Error: User registration failed. ${error}`,
      });
    }
  }
);

app.post(
  "/login",
  validator("json", (value, c) => {
    const parsed = loginBody.safeParse(value);

    if (!parsed.success) {
      return c.json({
        status: statusCode.invalidCredentials,
        msg: "Invalid credentials.",
      });
    }

    return parsed.data;
  }),
  async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const { email, password } = c.req.valid("json");

    try {
      const user = await prisma.user.findFirst({
        where: {
          email,
        },
      });

      const passwordFromClient = await sha256(password);

      if (passwordFromClient !== user?.password) {
        return c.json({
          status: statusCode.invalidCredentials,
          msg: "The password is incorrect.",
        });
      }

      const token = await sign({ id: user.id }, c.env.JWT_SECRET);

      setCookie(c, "Bearer", token, {
        httpOnly: true,
      });

      return c.json({
        status: statusCode.success,
        token: token,
        msg: "Logged in successfully",
      });
    } catch (error) {
      return c.json({
        status: statusCode.authError,
        msg: `Error: User login failed. ${error}`,
      });
    }
  }
);

export default app;
