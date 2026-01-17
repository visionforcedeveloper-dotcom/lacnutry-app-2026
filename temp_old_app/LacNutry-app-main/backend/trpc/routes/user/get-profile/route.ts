import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";

export const getProfileProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log("🔍 Buscando perfil do usuário:", input.userId);
    
    return {
      name: "Usuário",
      email: "usuario@email.com",
      hasCompletedQuiz: false,
      hasSubscription: false,
    };
  });

export default getProfileProcedure;
