// components/FeedbackForm.tsx

import { useState } from "react";

interface FeedbackFormProps {
  bookingId: number;
  onFeedbackSubmitted: () => void;
}

export default function FeedbackForm({
  bookingId,
  onFeedbackSubmitted,
}: FeedbackFormProps) {
  const [satisfaction, setSatisfaction] = useState<number | "">("");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const submitFeedback = async () => {
    if (!satisfaction || satisfaction < 1 || satisfaction > 5) {
      setError("Satisfaction must be between 1 and 5.");
      return;
    }
    if (!notes.trim()) {
      setError("Notes are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, satisfaction, notes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to record feedback");
      }

      setSatisfaction("");
      setNotes("");
      setError(null);
      onFeedbackSubmitted();
    } catch (err: any) {
      setError(err.message || "An error occurred while submitting feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-2 space-y-2">
      {error && <div className="text-red-600">{error}</div>}
      <input
        type="number"
        min="1"
        max="5"
        placeholder="Satisfaction (1-5)"
        className="w-full border rounded px-3 py-2"
        value={satisfaction}
        onChange={(e) => setSatisfaction(parseInt(e.target.value))}
        disabled={isSubmitting}
      />
      <textarea
        placeholder="Notes"
        className="w-full border rounded px-3 py-2"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        disabled={isSubmitting}
      />
      <button
        onClick={submitFeedback}
        className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded transition duration-300"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Record Feedback"}
      </button>
    </div>
  );
}
