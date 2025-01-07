import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { v2 as cloudinary } from "cloudinary";
import { promises as fs } from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const postRouter = createTRPCRouter({
  createPost: protectedProcedure
    .input(
      z.object({
        content: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { content } = input;
      const fileUrl = await cloudinary.uploader.upload(content!, {
        resource_type: "raw",
      });
      const post = await ctx.db.post.create({
        data: {
          content: fileUrl.url,
          user: {
            connect: {
              id: ctx.user.id,
            },
          },
        },
      });
      console.log(post);
      return post;
    }),

  getPosts: protectedProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    console.log(posts);
    return posts;
  }),

  getPost: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const post = await ctx.db.post.findUnique({
        where: {
          id: id,
        },
      });
      console.log(post);
      return post;
    }),
});
