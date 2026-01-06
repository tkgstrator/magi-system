"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { COLORS } from "./utils";

// MAGI質問入力フォーム
export const MagiQueryInput = () => {
  const router = useRouter();
  const [question, setQuestion] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    router.push(`/result?q=${encodeURIComponent(question)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="border p-1" style={{ borderColor: COLORS.primary }}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter a Yes/No question for resolution"
          className="w-full bg-black px-4 py-3 outline-none"
          style={{ color: COLORS.primary }}
        />
      </div>

      <button
        type="submit"
        disabled={!question.trim()}
        className="mt-6 w-full border py-3 hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ borderColor: COLORS.primary, color: COLORS.primary }}
        onMouseEnter={(e) => {
          if (!e.currentTarget.disabled) {
            e.currentTarget.style.backgroundColor = COLORS.primary;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        EXECUTE
      </button>
    </form>
  );
};
