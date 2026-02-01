import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import getProfileProcedure from "./routes/user/get-profile/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  user: createTRPCRouter({
    getProfile: getProfileProcedure,
  }),
});

export type AppRouter = typeof appRouter;
