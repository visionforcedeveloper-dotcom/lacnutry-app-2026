import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

const app = new Hono();

app.use("*", cors());

app.use("*", async (c, next) => {
  console.log(`📥 ${c.req.method} ${c.req.url}`);
  const start = Date.now();
  await next();
  console.log(`📤 Status: ${c.res.status} - ${Date.now() - start}ms`);
});

app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
    onError({ error, path }) {
      console.error(`❌ tRPC Error on ${path}:`, error);
      console.error(`❌ Error details:`, JSON.stringify(error, null, 2));
    },
  })
);

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

app.get("/test", (c) => {
  return c.json({ 
    status: "ok", 
    message: "Test endpoint",
    timestamp: new Date().toISOString() 
  });
});

app.onError((err, c) => {
  console.error("❌ Server Error:", err);
  return c.json({ error: err.message }, 500);
});

export default app;
