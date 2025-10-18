import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Paperclip, Send, PencilLine } from "lucide-react";
import logo from "../../public/logo.png";
import CodeWithCopy from "./Markdown";

function Promt({
  promt = {},
  setPromt = () => console.log("promt")
}) {
  const [inputValue, setInputValue] = useState("");
  const [typeMessage, setTypeMessage] = useState("");
  const [responseJson, setResponseJson] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const promtEndRef = useRef();
  const mdRef = useRef();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      const storedPromt = localStorage.getItem(`promtHistory_${user._id}`);
      if (storedPromt) {
        setPromt(JSON.parse(storedPromt));
      }
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      localStorage.setItem(`promtHistory_${user._id}`, JSON.stringify(promt));
    }
  }, [promt]);

  useEffect(() => {
    promtEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [promt, loading]);

  const handleSend = async (payload) => {
    const trimmed = (inputValue?.trim() ?? "") + '\n' + (payload != 'null' ? payload : "");

    if (!trimmed || trimmed.length < 2) return;

    setInputValue("");
    setTypeMessage(trimmed);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.post(
        "http://localhost:4002/api/v1/geminiai/promt",
        { content: trimmed },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      setPromt((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        { role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      console.error("API Error:", error);
      if (error.status == 401) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");

        alert(data.message);

        setAuthUser(null);
        navigate("/login");
      };
      setPromt((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        {
          role: "assistant",
          content: "❌ Something went wrong with the AI response.",
        },
      ]);
    } finally {
      setLoading(false);
      setTypeMessage(null);
      setResponseJson(null);
      setFile(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend(`${JSON.stringify(responseJson)}`);
  };

  const onCopy = async () => {
    const text = mdRef.current.innerText;

    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard");
    } catch (e) {
      alert("Copy failed: " + e.message);
    }
  }

  const onExport = (str) => {
    const receivedPrompt = str.replace(/```json|```/g, '').trim();
    const payload = (() => {
      try { return JSON.parse(receivedPrompt); } catch { return { raw: receivedPrompt }; }
    })();


    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gemini-response.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const onImport = (e) => {
    const file = e.target.files?.[0];
    setFile(file)
    if (!file) return;


    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);

        setResponseJson(parsed);
      } catch (err) {
        alert("Invalid JSON file: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="flex flex-col items-center justify-between flex-1 w-full px-4 pb-4 md:pb-8">
      {/* ➤ Greeting Section */}
      <div className="mt-8 md:mt-16 text-center">
        <div className="flex items-center justify-center gap-2">
          <img src={logo} alt="Gemini Logo" className="h-6 md:h-8" />
          <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2">
            Hi, I'm Gemini.
          </h1>
        </div>
        <p className="text-gray-400 text-base md:text-sm mt-2">
          💬 How can I help you today?
        </p>
      </div>

      {/* ➤ Scrollable Chat Box */}
      <div className="w-full max-w-4xl flex-1 overflow-y-auto mt-6 mb-4 space-y-4 max-h-[60vh] px-1">
        {promt.map((msg, index) => (
          <div
            key={index}
            className={`w-full flex ${msg.role === "user" ? "justify-end" : "justify-start"
              }`}
          >
            {msg.role === "assistant" ? (
              <div className="w-full whitespace-pre-wrap">
                <div ref={mdRef} className=" bg-[#232323] text-white rounded-xl px-4 py-3 text-sm whitespace-pre-wrap">
                  <CodeWithCopy response={msg.content} />
                </div>
                <button
                  onClick={() => onCopy(msg.content)}
                  title="Copy"
                >
                  <img src="./copyIcon.png" alt="Gemini Logo" className="h-5" />
                </button>
                <button
                  onClick={() => onExport(msg.content)}
                  className="ms-2"
                  title="Download"
                >
                  <img src="./downloadIcon.png" alt="Gemini Logo" className="h-5" />
                </button>
              </div>
            ) : (
              <div className="w-[30%] ">
                <div style={{ overflowWrap: "anywhere" }} className="bg-blue-600 text-white rounded-xl px-4 py-3 text-sm whitespace-pre-wrap self-start">
                  {msg.content}
                </div>
                <div
                  className="float-right m-2 me-3"
                  onClick={() => setInputValue(msg.content)}
                  role="button"
                  tabIndex={0}
                  title="Edit Message"
                >
                  <PencilLine size={16} />
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && typeMessage && (
          <div
            className="whitespace-pre-wrap px-4 py-3 rounded-2xl text-sm break-words
           bg-blue-600 text-white self-end ml-auto max-w-[40%]"
          >
            {typeMessage}
          </div>
        )}

        {loading && (
          <div className="flex justify-start w-full">
            <div className="bg-[#2f2f2f] text-white px-4 py-3 rounded-xl text-sm animate-pulse">
              🤖Loading...
            </div>
          </div>
        )}

        <div ref={promtEndRef} />
      </div>

      <div className="w-full max-w-4xl relative mt-auto">
        <div className="flex items-center gap-3 w-full bg-[#2f2f2f] rounded-[2rem] px-4 md:px-6 py-6 md:py-8 shadow-md flex">
          <label
            htmlFor="fileInput"
            className="cursor-pointer text-gray-500 hover:text-blue-600"
          >
            <Paperclip size={22} />
            <input
              id="fileInput"
              type="file"
              accept="application/json"
              onChange={onImport}
              className="hidden"
            />
          </label>

          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="💬 Message Gemini"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent w-full text-white placeholder-gray-400 text-base md:text-lg outline-none"
            />

            {file && (
              <span className="absolute -top-6 left-2 text-xs text-white">
                📎 {file.name}
              </span>
            )}
          </div>

          <button
            type="submit"
            onClick={() => handleSend(`${JSON.stringify(responseJson)}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Promt;
