"use client";

import { useState, useEffect } from "react";
import { generateQuery, runGeneratedSQLQuery } from "./actions";
import { Result } from "@/types/result";
import PleaseWaitComponent from "@/components/please-wait";

export default function Home() {
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [data, setData] = useState<Result[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [pleaseWait, setPleaseWait] = useState<boolean>(false);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Sample queries for demonstration
  const sampleQueries = [
    "הראה לי שיעורי פשיעה לפי עיר בשנה האחרונה",
    "איזה אזורים הם בעלי שיעורי הפשיעה האלימה הגבוהים ביותר?",
    "השווה מגמות פשיעה ברכוש ב-5 השנים האחרונות",
    "מהם סוגי הפשיעה הנפוצים ביותר במרכז העיר?"
  ];

  useEffect(() => {
    // Load query history from localStorage
    const savedHistory = localStorage.getItem('queryHistory');
    if (savedHistory) {
      setQueryHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setPleaseWait(true);
    setErrorMessage("");
    try {
      const query = await generateQuery(input);
      const datares = await runGeneratedSQLQuery(query);
      setData(datares);
      setAnswer(query || "No query generated. Please try again.");
      
      // Add to history
      const newHistory = [input, ...queryHistory.filter(q => q !== input)].slice(0, 10);
      setQueryHistory(newHistory);
      localStorage.setItem('queryHistory', JSON.stringify(newHistory));
      
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred.");  
    } finally {
      setPleaseWait(false);
    }
  };

  const clearResults = () => {
    setAnswer("");
    setData([]);
    setErrorMessage("");
  };

  const loadSampleQuery = (query: string) => {
    setInput(query);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📊 מערכת ניתוח שיעורי פשיעה
            </h1>
            <p className="text-gray-600">
              שאל שאלות על נתוני פשיעה בשפה טבעית
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4">שאלות לדוגמה</h3>
              <div className="space-y-2">
                {sampleQueries.map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadSampleQuery(query)}
                    className="w-full text-right p-3 text-sm text-blue-600 hover:bg-blue-50 
                             rounded-md transition-colors border border-blue-200 hover:border-blue-300"
                  >
                    {query}
                  </button>
                ))}
              </div>

              {queryHistory.length > 0 && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="font-semibold text-gray-900 mb-2 flex items-center justify-between w-full"
                  >
                    היסטוריית שאילתות
                    <span className="text-gray-400">
                      {showHistory ? '▼' : '▶'}
                    </span>
                  </button>
                  {showHistory && (
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {queryHistory.map((query, idx) => (
                        <button
                          key={idx}
                          onClick={() => loadSampleQuery(query)}
                          className="w-full text-right p-2 text-xs text-gray-600 hover:bg-gray-50 
                                   rounded transition-colors truncate"
                        >
                          {query}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Query Area */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-lg shadow-md p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    הכנס את השאלה שלך על נתוני פשיעה:
                  </label>
                  <textarea
                    className="w-full min-h-[120px] p-4 border border-gray-300 rounded-lg 
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                             resize-y text-base placeholder-gray-400"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="לדוגמה: הראה לי מגמות פשיעה אלימה בערים הגדולות ב-3 השנים האחרונות"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold
                             hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                             active:bg-blue-800 active:scale-95
                             transition-all duration-200
                             disabled:bg-gray-400 disabled:text-gray-200 disabled:cursor-not-allowed
                             disabled:active:bg-gray-400 disabled:active:scale-100"
                    disabled={pleaseWait || !input.trim()}
                  >
                    {pleaseWait ? 'מעבד...' : 'נתח נתונים'}
                  </button>
                  
                  {(answer || data.length > 0) && (
                    <button
                      type="button"
                      onClick={clearResults}
                      className="px-4 py-3 rounded-lg border border-gray-300 text-gray-700 
                               hover:bg-gray-50 transition-colors"
                    >
                      נקה תוצאות
                    </button>
                  )}
                </div>
              </form>

              {pleaseWait && (
                <div className="mt-6">
                  <PleaseWaitComponent />
                </div>
              )}
            </div>

            {/* Generated Query Display */}
            {answer && (
              <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  שאילתת SQL שנוצרה
                </h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto" dir="ltr">
                  {answer}
                </div>
              </div>
            )}

            {/* Error Display */}
            {errorMessage && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                  <span>⚠️</span>
                  שגיאה
                </h3>
                <p className="text-red-700" dir="ltr">{errorMessage}</p>
              </div>
            )}

            {/* Results Table */}
            {data.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600">📈</span>
                  תוצאות השאילתה ({data.length} שורות)
                </h3>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(data[0]).map((key) => (
                          <th 
                            key={key} 
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {key.replace(/_/g, ' ')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.map((row, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          {Object.values(row).map((value, i) => (
                            <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}