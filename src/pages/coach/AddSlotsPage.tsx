import React, { useState } from "react";
import { useRouter } from "next/router";

const AddSlotsPage: React.FC<{ userId: number }> = ({ userId }) => {
  const [startTime, setStartTime] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startTime, coachId: userId }),
    });

    if (response.ok) {
      router.push("/coach/Dashboard");
    } else {
      // Handle error
      console.error("Failed to create slot");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Slot</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="startTime" className="block mb-1">
            Start Time
          </label>
          <input
            type="datetime-local"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <p className="text-sm text-gray-600">
          Slots are automatically set to 2 hours duration.
        </p>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Slot
        </button>
      </form>
    </div>
  );
};

export default AddSlotsPage;
