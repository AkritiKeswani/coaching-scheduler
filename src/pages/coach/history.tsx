// pages/coach/history.tsx

import { GetServerSideProps } from "next";
import { prisma } from "../../lib/prisma";
import { useSession, getSession } from "next-auth/client";

export default function FeedbackHistory({ callsWithFeedback }) {
  const [session, loading] = useSession();

  if (loading) return <p>Loading...</p>;
  if (!session || !session.user.isCoach) return <p>Access Denied</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Feedback History</h1>
      {callsWithFeedback.length === 0 ? (
        <p>You have not submitted any feedback yet.</p>
      ) : (
        callsWithFeedback.map((call) => (
          <div key={call.id} className="mb-6 p-4 border rounded-md">
            <p>
              <strong>Student:</strong> {call.booking.student.name}
            </p>
            <p>
              <strong>Date:</strong> {new Date(call.date).toLocaleString()}
            </p>
            <p>
              <strong>Satisfaction Score:</strong> {call.satisfaction}
            </p>
            <p>
              <strong>Notes:</strong> {call.notes}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  // Redirect if not authenticated or not a coach
  if (!session || !session.user.isCoach) {
    return {
      redirect: {
        destination: "/", // or a login page
        permanent: false,
      },
    };
  }

  const coachId = session.user.id;

  // Fetch calls with feedback
  const callsWithFeedback = await prisma.call.findMany({
    where: {
      coachId: coachId,
      satisfaction: {
        not: null,
      },
    },
    include: {
      booking: {
        include: {
          student: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  return {
    props: {
      callsWithFeedback,
    },
  };
};
