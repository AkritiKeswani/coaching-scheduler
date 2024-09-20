// pages/coach/add-slot.tsx

import { NextPage } from "next";
import { useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useRouter } from "next/router";

const AddSlotsPage: NextPage = () => {
  const { user } = useUser();
  const [startTime, setStartTime] = useState("");
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!user?.isCoach) {
    return <div>Access denied. This page is for coaches only.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime) {
      setError("Please select a start time.");
      return;
    }

    setIsAddingSlot(true);
    setError(null);
    try {
      const response = await fetch("/api/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime, coachId: user.id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create slot");
      }
      router.push("/coach");
    } catch (err) {
      setError(err.message || "Failed to create slot. Please try again.");
    } finally {
      setIsAddingSlot(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Slot</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
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
            disabled={isAddingSlot}
          />
        </div>
        <p className="text-sm text-gray-600">
          Slots are automatically set to 2 hours duration.
        </p>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={isAddingSlot}
        >
          {isAddingSlot ? "Adding..." : "Add Slot"}
        </button>
      </form>
    </div>
  );
};

export default AddSlotsPage;
