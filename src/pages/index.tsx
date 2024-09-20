// pages/index.tsx

import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useUser } from "../contexts/UserContext";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const { setUser } = useUser();
  const router = useRouter();

  const handleSelectCoach = () => {
    setUser({
      id: 1,
      name: "Coach",
      email: "coach@example.com",
      isCoach: true,
    });
    router.push("/coach");
  };

  const handleSelectStudent = () => {
    setUser({
      id: 2,
      name: "Student",
      email: "student@example.com",
      isCoach: false,
    });
    router.push("/student");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Coaching Scheduler</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-bold mb-6">Coaching Scheduler</h1>

        <div className="space-y-4">
          <button
            onClick={handleSelectCoach}
            className="bg-blue-500 text-white px-6 py-2 rounded"
          >
            Coach View
          </button>

          <button
            onClick={handleSelectStudent}
            className="bg-green-500 text-white px-6 py-2 rounded"
          >
            Student View
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
