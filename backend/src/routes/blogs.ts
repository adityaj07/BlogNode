import { Hono } from "hono";
import { getCookie, getSignedCookie } from "hono/cookie";
import { decode, verify } from "hono/jwt";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    COOKIE_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

app.use("/*", async (c, next) => {
  const cookie = getCookie(c, "Bearer ");
  console.log(cookie);
  if (!cookie || !cookie.startsWith("Bearer")) {
    return c.json({
      status: 401,
      msg: "Invalid token",
    });
  }

  // const token = cookie;

  try {
    const decodedToken = await verify(cookie, c.env.COOKIE_SECRET);
    // const tokenToDecode =
    //   "eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJzdWIiOiAidXNlcjEyMyIsICJyb2xlIjogImFkbWluIn0.JxUwx6Ua1B0D1B0FtCrj72ok5cm1Pkmr_hL82sd7ELA";

    const { header, payload } = decode(decodedToken);

    console.log("Decoded Header:", header);
    console.log("Decoded Payload:", payload);

    c.set("userId", payload.id);
    await next();
  } catch (error) {}
});

app.get("/:id", (c) => {
  const id = c.req.param("id");
  console.log(id);
  return c.text("get blog route");
});

app.post("/", (c) => {
  return c.text("signin route");
});

app.put("/", (c) => {
  return c.text("signin route");
});

export default app;
