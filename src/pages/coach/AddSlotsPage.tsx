import React, { useState, useEffect } from "react";
import { useUser } from "../../contexts/UserContext";
import { useRouter } from "next/router";

const AddSlotsPage: React.FC = () => {
  const { userType, userId } = useUser();
  const router = useRouter();
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (userType !== "coach") {
      router.push("/");
    }
  }, [userType, router]);

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const start = e.target.value;
    setStartTime(start);

    // Calculate end time (2 hours later)
    const [hours, minutes] = start.split(":");
    const endDate = new Date(
      2000,
      0,
      1,
      parseInt(hours) + 2,
      parseInt(minutes)
    );
    setEndTime(endDate.toTimeString().slice(0, 5));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/coach/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, startTime, endTime, coachId: userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to add slot");
      }

      alert("Slot added successfully!");
      setDate("");
      setStartTime("");
      setEndTime("");
    } catch (err) {
      setError(err.message);
    }
  };

  if (userType !== "coach") {
    return null; // or a loading state
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add Availability Slot</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="date" className="block mb-1">
            Date:
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="startTime" className="block mb-1">
            Start Time:
          </label>
          <input
            type="time"
            id="startTime"
            value={startTime}
            onChange={handleStartTimeChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="endTime" className="block mb-1">
            End Time (2 hours later):
          </label>
          <input
            type="time"
            id="endTime"
            value={endTime}
            readOnly
            className="w-full p-2 border rounded bg-gray-100"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Slot
        </button>
      </form>
    </div>
  );
};

export default AddSlotsPage;
