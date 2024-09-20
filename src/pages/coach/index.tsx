import { NextPage } from "next";
import { useState, useEffect } from "react";
import { useUser } from "../../contexts/UserContext";
import { useRouter } from "next/router";

interface Booking {
  id: number;
  slot: {
    id: number;
    startTime: string;
    endTime: string;
    coach: {
      id: number;
      name: string;
      phone: string; // This is now `phone`
    };
  };
  student: {
    id: number;
    name: string;
    phone: string; // This is now `phone`
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
  const router = useRouter();

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

  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [newSlotStart, setNewSlotStart] = useState("");
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [isFetchingBookings, setIsFetchingBookings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<{
    [bookingId: number]: { satisfaction: number; notes: string };
  }>({});

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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
          <p className="text-gray-600">This page is for coaches only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Coach Dashboard
          </h1>
          <button
            onClick={switchToStudent}
            className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded transition duration-300"
          >
            Switch to Student
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Add New Slot
          </h2>
          <div className="flex space-x-2">
            <input
              type="datetime-local"
              value={newSlotStart}
              onChange={(e) => setNewSlotStart(e.target.value)}
              className="flex-grow border rounded px-3 py-2"
              disabled={isAddingSlot}
            />
            <button
              onClick={addSlot}
              className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded transition duration-300"
              disabled={isAddingSlot}
            >
              {isAddingSlot ? "Adding..." : "Add Slot"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Your Slots
            </h2>
            {isFetchingSlots ? (
              <div className="text-gray-600">Loading slots...</div>
            ) : (
              <ul className="space-y-4">
                {slots.map((slot) => (
                  <li key={slot.id} className="border-b pb-4">
                    <p className="font-medium text-gray-800">
                      {new Date(slot.startTime).toLocaleString()} -{" "}
                      {new Date(slot.endTime).toLocaleString()}
                    </p>
                    {slot.isBooked && slot.booking ? (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          Booked by: {slot.booking.student.name} (Phone:{" "}
                          {slot.booking.student.phone})
                        </p>
                        <div className="mt-2 space-y-2">
                          <input
                            type="number"
                            min="1"
                            max="5"
                            placeholder="Satisfaction (1-5)"
                            className="w-full border rounded px-3 py-2"
                            value={
                              feedback[slot.booking.id]?.satisfaction || ""
                            }
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
                          <textarea
                            placeholder="Notes"
                            className="w-full border rounded px-3 py-2"
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
                            className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded transition duration-300"
                          >
                            Record Feedback
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-green-600">Available</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Your Bookings
            </h2>
            {isFetchingBookings ? (
              <div className="text-gray-600">Loading bookings...</div>
            ) : (
              <ul className="space-y-4">
                {bookings.map((booking) => (
                  <li key={booking.id} className="border-b pb-4">
                    <p className="font-medium text-gray-800">
                      {new Date(booking.slot.startTime).toLocaleString()} -{" "}
                      {new Date(booking.slot.endTime).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Student: {booking.student.name} (Phone:{" "}
                      {booking.student.phone})
                    </p>
                    {booking.call ? (
                      <div className="mt-2 text-sm">
                        <p>Satisfaction: {booking.call.satisfaction}</p>
                        <p>Notes: {booking.call.notes}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-yellow-600">
                        No feedback recorded yet.
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;
