import { NextPage } from "next";
import { useRouter } from "next/router";
import { useUser } from "../contexts/UserContext";

const HomePage: NextPage = () => {
  const { setUser } = useUser();
  const router = useRouter();

  const switchToCoach = () => {
    setUser({
      id: 5,
      name: "Test Coach",
      email: "coach@example.com",
      phone: "123-456-7890",
      isCoach: true,
    });
    router.push("/coach");
  };

  const switchToStudent = () => {
    setUser({
      id: 6,
      name: "Test Student",
      email: "student@example.com",
      phone: "098-765-4321",
      isCoach: false,
    });
    router.push("/student");
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Welcome to the Coaching Scheduler
      </h1>
      <p className="mb-4">Please select your role:</p>
      <div className="space-x-4">
        <button
          onClick={switchToCoach}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Log in as Coach
        </button>
        <button
          onClick={switchToStudent}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Log in as Student
        </button>
      </div>
    </div>
  );
};

export default HomePage;
