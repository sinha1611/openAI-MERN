import React, { useState } from "react";
import { Paperclip, Send } from "lucide-react";

export default function ChatInput({ setInputValue, handleSubmit, inputValue }) {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!message) return;

    const formData = new FormData();
    formData.append("message", message);
    if (file) formData.append("file", file);
    setMessage("");
    setFile(null);
  };

  return (
    <form
      onSubmit={handleSend}
      className="flex items-center gap-3 w-full"
    >
      <label
        htmlFor="fileInput"
        className="cursor-pointer text-gray-500 hover:text-blue-600"
      >
        <Paperclip size={22} />
        <input
          id="fileInput"
          type="file"
          accept="application/json"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      <div className="flex-1 relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="💬 Message Gemini"
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent border border-gray-300 rounded-2xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {file && (
          <span className="absolute -top-6 left-2 text-xs text-white">
            📎 {file.name}
          </span>
        )}
      </div>

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2"
      >
        <Send size={20} />
      </button>
    </form>
  );
}
