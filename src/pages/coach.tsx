import { NextPage } from "next";
import Head from "next/head";
import { useUser } from "../contexts/UserContext";

const CoachPage: NextPage = () => {
  const { userType } = useUser();

  if (userType !== "coach") {
    return <div>Access denied. Please switch to coach view.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Coach Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-bold mb-6">Coach Dashboard</h1>

        {/* TODO: Implement coach functionality */}
        <p>Here you can manage your availability and view upcoming sessions.</p>
      </main>
    </div>
  );
};

export default CoachPage;
