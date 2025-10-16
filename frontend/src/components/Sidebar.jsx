import React, { useEffect, useState } from "react";
import { LogOut, X } from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Sidebar({ onClose, setPromt = () => console.log("promt") }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const [, setAuthUser] = useAuth();
  const [userPromt, setUserPromt] = useState([]);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getPromt()
  }, [])

  const handleLogout = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4002/api/v1/user/logout",
        {
          withCredentials: true,
        }
      );

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      alert(data.message);

      setAuthUser(null);
      navigate("/login");
    } catch (error) {
      alert(error?.response?.data?.errors || "Logout Failed");
    }
  };

  const getPromt = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:4002/api/v1/geminiai/getpromt",
        {
          userId: user._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
        {
          withCredentials: true,
        }
      );
      setUserPromt(data.promts ?? []);

    } catch (error) {
      console.log("error::", error);
    }
  };

  const deletePromt = async (promtId) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:4002/api/v1/geminiai/deletepromt",
        {
          userId: user._id,
          promt_id: promtId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
        {
          withCredentials: true,
        }
      );
      setUserPromt(data.promts ?? []);

    } catch (error) {
      console.log("error::", error);
    }
  };

  const createdPromt = async (uniqueId) => {
    try {
      localStorage.removeItem(`promtHistory_${user._id}`)
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "http://localhost:4002/api/v1/geminiai/createdPromt",
        {
          uniqueId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
        {
          withCredentials: true,
        }
      );
      setPromt(data.promts)
      localStorage.setItem(`promtHistory_${user._id}`, JSON.stringify(data.promts));

    } catch (error) {
      console.log("error::", error);
    }
  };
  
  useEffect(() => {
    setData(userPromt.filter(item =>
      item.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  },[searchQuery])

  return (
    <div className="h-full flex flex-col justify-between p-4">
      {/* Header */}
      <div>
        <div className="flex border-b border-gray-600 p-2 justify-between items-center mb-4">
          <div className="text-2xl font-bold text-gray-200">Gemini</div>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-400 md:hidden" />
          </button>
        </div>

        {/* History */}
        <div className=" flex-1 overflow-y-auto px-4 py-3 space-y-2">
          <button
            className=" w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl mb-4"
            onClick={() => (localStorage.removeItem(`promtHistory_${user._id}`, setPromt([]), getPromt()))}
          >
            + New Chat
          </button>
          <input
            type="text"
            placeholder="Search for Prompt"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            // value={inputValue}
            // onChange={(e) => setInputValue(e.target.value)}
            // onKeyDown={handleKeyDown}
            className="bg-transparent border border-gray-300 rounded-full p-2 w-full text-white placeholder-gray-400 text-base md:text-lg outline-none"
          />
          {searchQuery.trim().length == 0 ? 
            <>
            {userPromt.length > 0 ? <>
              {userPromt.map(item =>
                <div className="border-b border-gray-300 flex items-center justify-between">
                  <div
                    onClick={() => createdPromt(item.uniqueId)}
                    role="button"
                    tabIndex={0}
                    className="capitalize pb-2 text-nowrap"
                    style={{
                      maxWidth: "10.5rem",
                      overflow: "hidden"
                    }}>
                    {item.content}
                  </div>
                  <div onClick={() => deletePromt(item._id)} role="button" tabIndex={0}>
                    <img src="/delete.png" alt="Gemini Logo" className="h-4" />
                  </div>
                </div>
              )}
            </> :
            <div className=" text-gray-500 text-sm mt-20 text-center">
              No chat history yet
            </div>}
          </>
          : <>
          {data.length > 0 ? <>

              {data.map(item =>
                <div className="border-b border-gray-300 flex items-center justify-between">
                  <div
                    onClick={() => createdPromt(item.uniqueId)}
                    role="button"
                    tabIndex={0}
                    className="capitalize pb-2 text-nowrap"
                    style={{
                      maxWidth: "10.5rem",
                      overflow: "hidden"
                    }}>
                    {item.content}
                  </div>
                  <div onClick={() => deletePromt(item._id)} role="button" tabIndex={0}>
                    <img src="/delete.png" alt="Gemini Logo" className="h-4" />
                  </div>
                </div>
              )}
            </> :
            <div className=" text-gray-500 text-sm mt-20 text-center">
              No prompt found
            </div>}
          </>}
          
          
        </div>
      </div>

      {/* Footer */}
      <div className="p-1 border-t border-gray-600">
        <div className="flex  items-center gap-2 cursor-pointer my-3">
          <img
            src="https://i.pravatar.cc/32"
            alt="profile"
            className="rounded-full w-8 h-8"
          />
          <span className="text-gray-300 font-bold">
            {user ? user?.firstName : "My Profile"}
          </span>
        </div>

        {user && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 duration-300 transition"
          >
            <LogOut className="" />
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
