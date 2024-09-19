import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useUser } from "../contexts/UserContext";

const Home: NextPage = () => {
  const { userType, setUserType } = useUser();

  if (!userType || !setUserType) {
    return <div>Loading...</div>; // Or some error state
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Coaching Scheduler</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to <span className="text-blue-600">Coaching Scheduler</span>
        </h1>

        <p className="mt-3 text-2xl text-gray-500">
          Current user type:{" "}
          <code className="p-3 font-mono text-lg bg-gray-200 rounded-md text-gray-900">
            {userType}
          </code>
        </p>

        <button
          onClick={() =>
            setUserType(userType === "coach" ? "student" : "coach")
          }
          className="mt-6 px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Switch to {userType === "coach" ? "Student" : "Coach"}
        </button>

        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          <Link
            href="/coach"
            className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600"
          >
            <h3 className="text-2xl font-bold">Coach Dashboard &rarr;</h3>
            <p className="mt-4 text-xl">
              Manage coaching slots and view upcoming sessions.
            </p>
          </Link>

          <Link
            href="/student"
            className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600"
          >
            <h3 className="text-2xl font-bold">Student Booking &rarr;</h3>
            <p className="mt-4 text-xl">
              Book coaching sessions and manage appointments.
            </p>
          </Link>
        </div>
      </main>

      <footer className="flex items-center justify-center w-full h-24 border-t">
        <a
          className="flex items-center justify-center"
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* Powered by{" "}
          <img src="/vercel.svg" alt="Vercel Logo" className="h-4 ml-2" /> */}
        </a>
      </footer>
    </div>
  );
};

export default Home;
