import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import bcrypt from "bcryptjs";
import { db } from "@/server/db";

export const UserRouter = createTRPCRouter({
  createUser: publicProcedure
    .input(
      z.object({
        username: z.string(),
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = await bcrypt.hash(input.password, 10);
      const user = await ctx.db.user.create({
        data: {
          username: input.username,
          email: input.email,
          hashedPassword,
        },
      });
      console.log(user);
      return user;
    }),

  getUsers: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    console.log(users);
    return users;
  }),

  getCurrentUser: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { email } = input;
      const user = await ctx.db.user.findUnique({
        where: {
          email: email,
        },
      });
      console.log(user);
      return user;
    }),
});
