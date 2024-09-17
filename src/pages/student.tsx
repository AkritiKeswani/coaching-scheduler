import { NextPage } from "next";
import Head from "next/head";
import { useUser } from "../contexts/UserContext";

const StudentPage: NextPage = () => {
  const { userType } = useUser();

  if (userType !== "student") {
    return <div>Access denied. Please switch to student view.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Student Booking</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-bold mb-6">Student Booking</h1>

        {/* TODO: Implement student booking functionality */}
        <p>Here you can book coaching sessions and manage your appointments.</p>
      </main>
    </div>
  );
};

export default StudentPage;
