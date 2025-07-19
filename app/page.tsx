"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Replace this with your logic to generate the answer
    setAnswer(`You submitted: ${input}`);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-8 gap-6 font-[family-name:var(--font-geist-sans)]">
      <form onSubmit={handleSubmit} className="w-full max-w-xl flex flex-col items-center gap-4">
        <textarea
          className="w-full min-h-[100px] p-3 border rounded resize-y text-base"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your text here..."
        />
        <button
          type="submit"
          className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </form>
      <div className="w-full max-w-xl mt-4 p-4 border rounded bg-gray-50 min-h-[60px]">
        {answer}
      </div>
    </div>
  );
}