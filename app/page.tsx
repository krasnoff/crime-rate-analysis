"use client";

import { useState } from "react";
import { generateQuery, runGeneratedSQLQuery } from "./actions";
import { Result } from "@/types/result";
import PleaseWaitComponent from "@/components/please-wait";

export default function Home() {
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [data, setData] = useState<Result[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [pleaseWait, setPleaseWait] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setPleaseWait(true);
    try {
      const query = await generateQuery(input);
      const datares = await runGeneratedSQLQuery(query);
      setData(datares);
      setAnswer(query || "No query generated. Please try again.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred.");  
    } finally {
      setPleaseWait(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-8 gap-6 font-[family-name:var(--font-geist-sans)]" dir="rtl">
      <form onSubmit={handleSubmit} className="w-full max-w-xl flex flex-col items-center gap-4">
        <textarea
          className="w-full min-h-[100px] p-3 border rounded resize-y text-base"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your text here..."
        />
        <button
          type="submit"
          className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 active:bg-blue-800 active:scale-95 transition transform"
        >
          Submit
        </button>
        {pleaseWait && (
          <PleaseWaitComponent />
        )}
      </form>
      <div className="w-full max-w-xl mt-4 p-4 border rounded bg-gray-50 min-h-[60px]" dir="ltr">
        {answer}
      </div>
      {errorMessage && (
        <div className="w-full max-w-xl mt-4 p-4 border rounded bg-red-50 text-red-600">
          {errorMessage || "An error occurred while processing your request."}
        </div>
      )}
      {data.length > 0 && (
        <div className="w-full max-w-xl mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key} className="border px-4 py-2 bg-gray-100 text-left">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((value, i) => (
                    <td key={i} className="border px-4 py-2">
                      {String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}