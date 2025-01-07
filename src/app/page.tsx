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
  const [file, setFile] = useState("");
  const createUser = api.user.createUser.useMutation();
  const { data: session } = useSession();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("application/pdf")) {
      alert("Please upload a PDF file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      setFile(base64String); // Store the Base64 string
    };

    reader.onerror = () => {
      console.error("Error reading file.");
    };

    reader.readAsDataURL(file); // Read the file as a Base64 string
  };

  const uploadFile = api.post.createPost.useMutation();

  const handleUploadFile = () => {
    if (!file) return;

    uploadFile.mutate({
      content: file,
    });
  };

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
      <button onClick={() => signIn("google")}>gOOGLE</button>

      {users?.map((user) => <div key={user.id}>{user.email}</div>)}
      <input
        onChange={handleFile}
        className="border-[1px] border-black"
        type="file"
      />
      <button onClick={handleUploadFile}>Upload</button>
    </div>
  );
};

export default page;
