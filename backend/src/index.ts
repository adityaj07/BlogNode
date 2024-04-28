import { Hono } from "hono";
import blogs from "./routes/blogs";
import users from "./routes/users";
// import { PrismaClient } from '@prisma/client/edge'
// import { withAccelerate } from '@prisma/extension-accelerate'

//You should avoid creating global variables in serverless apps like this one, as many times only these functions on the routes are brought up as required and hence they might loose the global context


const app = new Hono().basePath("/api/v1");

app.route("/blogs", blogs);
app.route("/users", users);

export default app; 
