import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import bcrypt from "bcryptjs";
import { AuthOptions, User } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { getServerSession } from "next-auth/next";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "email",
          type: "text",
        },
        password: {
          label: "password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("No credentials");
          return null;
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials?.email,
          },
        });

        if (!user || !user?.hashedPassword) {
          console.log("User does not exist!");
          return null;
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.hashedPassword!,
        );

        if (!isPasswordCorrect) {
          console.log("Incorrect Password!");
          return null;
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async session({ session }: any) {
      if (session?.user?.email) {
        const user = await db?.user?.findUnique({
          where: {
            email: session.user.email,
          },
        });

        if (user) {
          session.user.id = user.id.toString();
        }
      }

      return session;
    },
    async signIn({ user }: { user: User | AdapterUser }) {
      try {
        const userExists = await db.user.findUnique({
          where: {
            email: user?.email!,
          },
        });

        if (!userExists) {
          await db.user.create({
            data: {
              username: user?.name!,
              email: user?.email!,
              profilePicture: user?.image,
            },
          });
        }

        console.log("Sign in successful");
        return true;
      } catch (error) {
        console.log("Sign in failed");
        return false;
      }
    },
  },
};

export default async function getSession() {
  return await getServerSession(authOptions);
}

export const getCurrentUser = async () => {
  try {
    const session = await getSession();
    console.log("Session:", session?.user?.email);

    if (!session?.user?.email) {
      console.log("No email found in session.");
      return null;
    }

    const user = await db.user.findUnique({
      where: {
        email: session?.user?.email!,
      },
    });
    console.log(user);
    return user;
  } catch (error) {
    console.log("User not found");
    return null;
  }
};
