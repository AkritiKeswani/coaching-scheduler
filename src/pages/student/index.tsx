// pages/student/index.tsx

import { NextPage } from "next";
import { useState, useEffect } from "react";
import { useUser } from "../../contexts/UserContext";

interface Slot {
  id: number;
  startTime: string;
  endTime: string;
  coach: {
    id: number;
    name: string;
    phone: string;
  };
}

interface Booking {
  id: number;
  slot: Slot;
  student: {
    id: number;
    name: string;
    phone: string;
  };
  call?: {
    id: number;
    satisfaction: number;
    notes: string;
  };
}

const StudentDashboard: NextPage = () => {
  const { user, setUser } = useUser();

  // Function to switch roles
  const switchToCoach = () => {
    setUser({
      id: 1,
      name: "Test Coach",
      email: "coach@example.com",
      phone: "123-456-7890",
      isCoach: true,
    });
  };

  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [isFetchingBookings, setIsFetchingBookings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !user.isCoach) {
      fetchAvailableSlots();
      fetchBookings();
    }
  }, [user]);

  const fetchAvailableSlots = async () => {
    setIsFetchingSlots(true);
    setError(null);
    try {
      const response = await fetch("/api/slots?isBooked=false");
      if (!response.ok) throw new Error("Failed to fetch available slots");
      const data = await response.json();
      setAvailableSlots(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch available slots. Please try again.");
    } finally {
      setIsFetchingSlots(false);
    }
  };

  const fetchBookings = async () => {
    setIsFetchingBookings(true);
    setError(null);
    try {
      const response = await fetch(`/api/bookings?studentId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch bookings");
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch bookings. Please try again.");
    } finally {
      setIsFetchingBookings(false);
    }
  };

  const bookSlot = async (slotId: number) => {
    if (!slotId || !user?.id) return;

    setError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, studentId: user.id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to book slot");
      }
      await fetchAvailableSlots();
      await fetchBookings();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to book slot. Please try again.");
    }
  };

  if (!user || user.isCoach) {
    return <div>Access denied. This page is for students only.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>

      <button
        onClick={switchToCoach}
        className="bg-gray-500 text-white px-4 py-2 rounded mb-4"
      >
        Switch to Coach
      </button>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <h2 className="text-xl font-semibold mb-2">Available Slots</h2>
      {isFetchingSlots ? (
        <div>Loading available slots...</div>
      ) : (
        <ul>
          {availableSlots.map((slot) => (
            <li key={slot.id} className="mb-2 p-2 border rounded">
              <p>
                {new Date(slot.startTime).toLocaleString()} -{" "}
                {new Date(slot.endTime).toLocaleString()} with {slot.coach.name}
              </p>
              <button
                onClick={() => bookSlot(slot.id)}
                className="ml-2 bg-blue-500 text-white px-2 py-1 rounded"
              >
                Book
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-xl font-semibold mt-4 mb-2">Your Bookings</h2>
      {isFetchingBookings ? (
        <div>Loading your bookings...</div>
      ) : (
        <ul>
          {bookings.map((booking) => (
            <li key={booking.id} className="mb-2 p-2 border rounded">
              <p>
                {new Date(booking.slot.startTime).toLocaleString()} -{" "}
                {new Date(booking.slot.endTime).toLocaleString()} with{" "}
                {booking.slot.coach.name} (Phone: {booking.slot.coach.phone})
              </p>
              {booking.call ? (
                <div>
                  <p>Satisfaction: {booking.call.satisfaction}</p>
                  <p>Notes: {booking.call.notes}</p>
                </div>
              ) : (
                <p>No feedback recorded yet.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudentDashboard;
