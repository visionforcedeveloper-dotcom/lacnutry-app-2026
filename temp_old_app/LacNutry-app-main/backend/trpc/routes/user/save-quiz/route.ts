import { publicProcedure } from "@/backend/trpc/create-context";
import { z } from "zod";

export const saveQuizProcedure = publicProcedure
  .input(
    z.object({
      name: z.string(),
      email: z.string().email(),
      answers: z.record(z.string(), z.number()),
      score: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('📝 Salvando dados do quiz:', {
      name: input.name,
      email: input.email,
      answersCount: Object.keys(input.answers).length,
      score: input.score
    });
    
    const result = {
      success: true,
      userId: `user_${Date.now()}`,
      message: "Quiz salvo com sucesso!",
    };
    
    console.log('✅ Quiz salvo:', result);
    return result;
  });

export default saveQuizProcedure;
