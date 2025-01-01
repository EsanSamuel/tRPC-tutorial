"use client";
import { api } from "@/trpc/react";
import React, { useState } from "react";
import { signIn, useSession } from "next-auth/react";

type Variant = "LOGIN" | "SIGNUP";

const page = () => {
  const [authVarant, setAuthVariant] = useState<Variant>("LOGIN");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const createUser = api.user.createUser.useMutation();
  const { data: session } = useSession();

  const toggleVariant = () => {
    if (authVarant === "LOGIN") {
      setAuthVariant("SIGNUP");
    } else {
      setAuthVariant("LOGIN");
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      createUser.mutate({
        username,
        email,
        password,
      });
      await signIn("credentials", {
        email,
        password,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn("credentials", {
        email,
        password,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const { data: users } = api.user.getUsers.useQuery();
  const { data: user } = api.user.getCurrentUser.useQuery(
    {
      email: session?.user?.email ?? "",
    },
    {
      enabled: !!session?.user?.email,
    },
  );

  return (
    <div className="flex flex-col items-center justify-center">
      {session?.user?.id}
      <h1>User:{user?.username}</h1>
      <form className="flex flex-col border p-5">
        {authVarant === "SIGNUP" && (
          <input
            onChange={(e) => setUsername(e.target.value)}
            className="border-[1px] border-black"
            placeholder="Username"
          />
        )}
        <input
          onChange={(e) => setEmail(e.target.value)}
          className="border-[1px] border-black"
          placeholder="Email"
        />
        <input
          onChange={(e) => setPassword(e.target.value)}
          className="border-[1px] border-black"
          placeholder="Password"
        />
        {authVarant === "SIGNUP" ? (
          <button onClick={handleSignIn}>Sign in</button>
        ) : (
          <button onClick={handleLogin}>Login</button>
        )}
      </form>
      <button onClick={toggleVariant}>
        {authVarant === "LOGIN" ? "Sign up" : "Log in"}
      </button>

      {users?.map((user) => <div key={user.id}>{user.email}</div>)}
    </div>
  );
};

export default page;
