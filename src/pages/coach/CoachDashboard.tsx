import React, { useEffect, useState } from "react";
import { Slot, Booking, Call } from "@prisma/client";
import Link from "next/link";

const CoachDashboard: React.FC<{ userId: number }> = ({ userId }) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [slotsRes, bookingsRes, callsRes] = await Promise.all([
        fetch(`/api/slots?coachId=${userId}`),
        fetch(`/api/bookings?userId=${userId}&isCoach=true`),
        fetch(`/api/calls?coachId=${userId}`),
      ]);

      if (slotsRes.ok) setSlots(await slotsRes.json());
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
      if (callsRes.ok) setCalls(await callsRes.json());
    };

    fetchData();
  }, [userId]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Coach Dashboard</h1>
      <Link
        href="/coach/AddSlotsPage"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Add New Slot
      </Link>

      <h2 className="text-xl font-semibold mt-6 mb-2">Your Slots</h2>
      <ul>
        {slots.map((slot) => (
          <li key={slot.id} className="mb-2">
            {new Date(slot.startTime).toLocaleString()} -{" "}
            {new Date(slot.endTime).toLocaleString()}
            {slot.isBooked
              ? ` (Booked by ${slot.booking?.student.name}, Phone: ${slot.booking?.student.phone})`
              : " (Available)"}
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Upcoming Bookings</h2>
      <ul>
        {bookings.map((booking) => (
          <li key={booking.id} className="mb-2">
            {new Date(booking.slot.startTime).toLocaleString()} - Student:{" "}
            {booking.student.name}, Phone: {booking.student.phone}
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Past Calls</h2>
      <ul>
        {calls.map((call) => (
          <li key={call.id} className="mb-2">
            {new Date(call.booking.slot.startTime).toLocaleString()} - Student:{" "}
            {call.booking.student.name}, Satisfaction: {call.satisfaction},
            Notes: {call.notes}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CoachDashboard;
