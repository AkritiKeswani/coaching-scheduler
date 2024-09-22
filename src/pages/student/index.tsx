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
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);

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
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }
      const data = await response.json();
      setAvailableSlots(data);
    } catch (err) {
      console.error("Error fetching available slots:", err);
      setError(`Failed to fetch available slots. ${err.message}`);
    } finally {
      setIsFetchingSlots(false);
    }
  };

  const fetchBookings = async () => {
    setIsFetchingBookings(true);
    setError(null);
    try {
      const response = await fetch(`/api/bookings?studentId=${user?.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(`Failed to fetch bookings. ${err.message}`);
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
      console.error("Error booking slot:", err);
      setError(`Failed to book slot. ${err.message}`);
    }
  };

  const updatePhoneNumber = async () => {
    if (!user || !newPhoneNumber) return;

    setIsUpdatingPhone(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: newPhoneNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update phone number");
      }

      const data = await response.json();
      setUser({ ...user, phone: data.phone });
      setNewPhoneNumber("");
    } catch (err) {
      console.error("Error updating phone number:", err);
      setError(`Failed to update phone number. ${err.message}`);
    } finally {
      setIsUpdatingPhone(false);
    }
  };

  if (!user?.isCoach && user) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">
              Student Dashboard
            </h1>
            <button
              onClick={switchToCoach}
              className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded transition duration-300"
            >
              Switch to Coach
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-700">
              Your Information
            </h2>
            <p className="text-sm text-gray-600 mb-2">
              Current Phone: {user.phone}
            </p>
            <div className="flex space-x-2">
              <input
                type="tel"
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
                placeholder="New phone number"
                className="flex-grow border rounded px-3 py-2"
              />
              <button
                onClick={updatePhoneNumber}
                disabled={isUpdatingPhone}
                className="bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded transition duration-300"
              >
                {isUpdatingPhone ? "Updating..." : "Update Phone"}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Note: Your phone number will be shared with coaches for
              communication purposes when you book a slot.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Available Slots
              </h2>
              {isFetchingSlots ? (
                <div className="text-gray-600">Loading available slots...</div>
              ) : (
                <ul className="space-y-4">
                  {availableSlots.map((slot) => (
                    <li key={slot.id} className="border-b pb-4">
                      <p className="font-medium text-gray-800">
                        {new Date(slot.startTime).toLocaleString()} -{" "}
                        {new Date(slot.endTime).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Coach: {slot.coach.name}
                      </p>
                      <button
                        onClick={() => bookSlot(slot.id)}
                        className="mt-2 bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded transition duration-300"
                      >
                        Book Slot
                      </button>
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
                <div className="text-gray-600">Loading your bookings...</div>
              ) : (
                <ul className="space-y-4">
                  {bookings.map((booking) => (
                    <li key={booking.id} className="border-b pb-4">
                      <p className="font-medium text-gray-800">
                        {new Date(booking.slot.startTime).toLocaleString()} -{" "}
                        {new Date(booking.slot.endTime).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Coach: {booking.slot.coach.name} (Phone:{" "}
                        {booking.slot.coach.phone})
                      </p>
                      <p className="text-sm text-gray-600">
                        Your phone: {booking.student.phone}
                      </p>
                      {booking.call ? (
                        <div className="mt-2 text-sm text-gray-800">
                          <p className="font-medium">Coach's Feedback:</p>
                          <p>Satisfaction: {booking.call.satisfaction}/5</p>
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
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Loading...</h1>
        </div>
      </div>
    );
  }

  if (user.isCoach) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Access Denied</h1>
          <p className="text-gray-600">This page is for students only.</p>
        </div>
      </div>
    );
  }

  return null;
};

export default StudentDashboard;
