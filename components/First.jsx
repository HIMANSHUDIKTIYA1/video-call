"use client";

import React, { useState } from 'react';

const First = ({ setUserInfo }) => {
  const [room, setRoom] = useState('');
  const [name, setName] = useState('');

  const handleCreateRoom = () => {
    if (room && name) {
      setUserInfo({ room, name });
      alert("Welcome to HD WORLD 🌎 ")
    } else {
      alert("Please fill both fields!");
    }
  
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-b from-orange-500 to-orange-300 text-white">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-bounce">
          Welcome to <span className=" text-red-500">HD</span>
        </h1>
      </div>

      {/* Input Section */}
      <div className="mt-10 w-11/12 md:w-1/2 lg:w-1/3">
        <input
          type="text"
          placeholder="Enter Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
        />
        <input
          type="text"
          placeholder="Enter Room Key"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          className="w-full px-4 py-2 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
        />
        <button
          onClick={handleCreateRoom}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-lg transition duration-300"
        >
          Create Room
        </button>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-sm text-white/80">
        Made with ❤️ for WebRTC Project
      </footer>
    </div>
  );
};

export default First;
