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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Coaching Scheduler
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Please select your role:
        </p>
        <div className="space-y-4">
          <button
            onClick={switchToCoach}
            className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded transition duration-300"
          >
            Continue as Coach
          </button>
          <button
            onClick={switchToStudent}
            className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded transition duration-300"
          >
            Continue as Student
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
