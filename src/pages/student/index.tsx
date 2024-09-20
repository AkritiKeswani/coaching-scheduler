import { NextPage } from "next";
import { useState, useEffect } from "react";
import { useUser } from "../../contexts/UserContext";
import { useRouter } from "next/router";

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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (user.isCoach) {
    return (
      <div className="min-h-screen bg-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p>This page is for students only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 text-white p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">Student Dashboard</h1>

      <button
        onClick={switchToCoach}
        className="bg-sky-400 hover:bg-sky-500 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300 mb-6"
      >
        Switch to Coach
      </button>

      {error && (
        <div className="text-red-400 mb-4 p-2 bg-red-900 rounded">{error}</div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Available Slots</h2>
          {isFetchingSlots ? (
            <div className="text-gray-400">Loading available slots...</div>
          ) : (
            <ul className="space-y-4">
              {availableSlots.map((slot) => (
                <li key={slot.id} className="bg-gray-700 p-4 rounded-lg">
                  <p className="font-semibold">
                    {new Date(slot.startTime).toLocaleString()} -{" "}
                    {new Date(slot.endTime).toLocaleString()}
                  </p>
                  <p className="mb-2">Coach: {slot.coach.name}</p>
                  <button
                    onClick={() => bookSlot(slot.id)}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                  >
                    Book
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Bookings</h2>
          {isFetchingBookings ? (
            <div className="text-gray-400">Loading your bookings...</div>
          ) : (
            <ul className="space-y-4">
              {bookings.map((booking) => (
                <li key={booking.id} className="bg-gray-700 p-4 rounded-lg">
                  <p className="font-semibold">
                    {new Date(booking.slot.startTime).toLocaleString()} -{" "}
                    {new Date(booking.slot.endTime).toLocaleString()}
                  </p>
                  <p>Coach: {booking.slot.coach.name}</p>
                  <p className="mb-2">Phone: {booking.slot.coach.phone}</p>
                  {booking.call ? (
                    <div className="mt-2 bg-gray-600 p-2 rounded">
                      <p>Satisfaction: {booking.call.satisfaction}</p>
                      <p>Notes: {booking.call.notes}</p>
                    </div>
                  ) : (
                    <p className="text-yellow-400">No feedback recorded yet.</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
