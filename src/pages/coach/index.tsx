// pages/coach/index.tsx

import { NextPage } from "next";
import { useState, useEffect } from "react";
import { useUser } from "../../contexts/UserContext";

interface Booking {
  id: number;
  slot: {
    id: number;
    startTime: string;
    endTime: string;
    endTime: string;
    coach: {
      id: number;
      name: string;
      phone: string;
    };
  };
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

interface Slot {
  id: number;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  booking?: Booking;
}

const CoachDashboard: NextPage = () => {
  const { user, setUser } = useUser();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [newSlotStart, setNewSlotStart] = useState("");
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [isFetchingBookings, setIsFetchingBookings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State to manage satisfaction and notes for each booking
  const [feedback, setFeedback] = useState<{
    [bookingId: number]: { satisfaction: number; notes: string };
  }>({});

  // Function to switch roles
  const switchToStudent = () => {
    setUser({
      id: 2,
      name: "Test Student",
      email: "student@example.com",
      phone: "098-765-4321",
      isCoach: false,
    });
  };

  useEffect(() => {
    if (user?.isCoach) {
      fetchSlots();
      fetchBookings();
    }
  }, [user]);

  const fetchSlots = async () => {
    setIsFetchingSlots(true);
    setError(null);
    try {
      const response = await fetch(`/api/slots?coachId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch slots");
      const data = await response.json();
      setSlots(data);
    } catch (err) {
      setError("Failed to fetch slots. Please try again.");
    } finally {
      setIsFetchingSlots(false);
    }
  };

  const fetchBookings = async () => {
    setIsFetchingBookings(true);
    setError(null);
    try {
      const response = await fetch(`/api/bookings?coachId=${user?.id}`);
      if (!response.ok) throw new Error("Failed to fetch bookings");
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError("Failed to fetch bookings. Please try again.");
    } finally {
      setIsFetchingBookings(false);
    }
  };

  const addSlot = async () => {
    if (!newSlotStart) {
      setError("Please select a start time for the new slot.");
      return;
    }

    setIsAddingSlot(true);
    setError(null);
    try {
      const response = await fetch("/api/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime: newSlotStart, coachId: user?.id }),
      });
      if (!response.ok) throw new Error("Failed to add slot");
      await fetchSlots();
      setNewSlotStart("");
    } catch (err) {
      setError("Failed to add slot. Please try again.");
    } finally {
      setIsAddingSlot(false);
    }
  };

  const recordSatisfaction = async (bookingId: number) => {
    const satisfaction = feedback[bookingId]?.satisfaction;
    const notes = feedback[bookingId]?.notes;

    if (!satisfaction || satisfaction < 1 || satisfaction > 5) {
      setError("Satisfaction must be between 1 and 5.");
      return;
    }
    if (!notes) {
      setError("Notes are required.");
      return;
    }

    setError(null);
    try {
      const response = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          coachId: user?.id,
          satisfaction,
          notes,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to record satisfaction");
      }
      await fetchBookings();
      // Clear feedback for the booking after recording
      setFeedback((prev) => {
        const updated = { ...prev };
        delete updated[bookingId];
        return updated;
      });
    } catch (err) {
      setError(
        err.message || "Failed to record satisfaction. Please try again."
      );
    }
  };

  if (!user?.isCoach) {
    return <div>Access denied. This page is for coaches only.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Coach Dashboard</h1>

      <button
        onClick={switchToStudent}
        className="bg-gray-500 text-white px-4 py-2 rounded mb-4"
      >
        Switch to Student
      </button>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="mb-4">
        <input
          type="datetime-local"
          value={newSlotStart}
          onChange={(e) => setNewSlotStart(e.target.value)}
          className="mr-2 p-2 border rounded"
          disabled={isAddingSlot}
        />
        <button
          onClick={addSlot}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={isAddingSlot}
        >
          {isAddingSlot ? "Adding..." : "Add Slot"}
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Your Slots</h2>

      {isFetchingSlots ? (
        <div>Loading slots...</div>
      ) : (
        <ul>
          {slots.map((slot) => (
            <li key={slot.id} className="mb-2 p-2 border rounded">
              <p>
                {new Date(slot.startTime).toLocaleString()} -{" "}
                {new Date(slot.endTime).toLocaleString()}
              </p>
              {slot.isBooked && slot.booking ? (
                <div>
                  <p>
                    Booked by: {slot.booking.student.name} (Phone:{" "}
                    {slot.booking.student.phone})
                  </p>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    placeholder="Satisfaction (1-5)"
                    className="mr-2 p-1 border rounded"
                    value={feedback[slot.booking.id]?.satisfaction || ""}
                    onChange={(e) => {
                      const satisfaction = parseInt(e.target.value);
                      setFeedback({
                        ...feedback,
                        [slot.booking!.id]: {
                          ...feedback[slot.booking!.id],
                          satisfaction,
                        },
                      });
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Notes"
                    className="mr-2 p-1 border rounded"
                    value={feedback[slot.booking.id]?.notes || ""}
                    onChange={(e) => {
                      const notes = e.target.value;
                      setFeedback({
                        ...feedback,
                        [slot.booking!.id]: {
                          ...feedback[slot.booking!.id],
                          notes,
                        },
                      });
                    }}
                  />
                  <button
                    onClick={() => recordSatisfaction(slot.booking!.id)}
                    className="bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Record
                  </button>
                </div>
              ) : (
                <span className="ml-2 text-green-500">Available</span>
              )}
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-xl font-semibold mt-4 mb-2">Your Bookings</h2>
      {isFetchingBookings ? (
        <div>Loading bookings...</div>
      ) : (
        <ul>
          {bookings.map((booking) => (
            <li key={booking.id} className="mb-2 p-2 border rounded">
              <p>
                {new Date(booking.slot.startTime).toLocaleString()} -{" "}
                {new Date(booking.slot.endTime).toLocaleString()}
              </p>
              <p>
                Student: {booking.student.name} (Phone: {booking.student.phone})
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

export default CoachDashboard;
