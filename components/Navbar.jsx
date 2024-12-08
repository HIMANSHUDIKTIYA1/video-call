"use client";

import React, { useState } from "react";
import { IoReorderThree } from "react-icons/io5";

const Navbar = () => {
  const [navVisible, setNavVisible] = useState(false);


  const handleLogin = () => {
    router.push("/main");
  };

  return (
    <div className="container mx-auto flex justify-between items-center p-4 bg-gradient-to-r from-orange-500 to-orange-300 text-white">
      {/* Logo */}
      <div className="text-2xl font-bold">
        <img src="./m1.png" className=" w-[70px] h-auto" alt="" />
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setNavVisible(!navVisible)}
        className="lg:hidden text-3xl focus:outline-none"
      >
        <IoReorderThree/>
      </button>

      {/* Navigation Links */}
      <nav
        className={`lg:flex lg:items-center lg:justify-end lg:gap-8 lg:transition-transform duration-300 ${
          navVisible ? "block" : "hidden"
        }`}
      >

        <button
          onClick={handleLogin}
          className="mt-4 lg:mt-0 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition duration-300"
        >
          Login
        </button>
      </nav>

      {/* Mobile Navigation Background */}
      {navVisible && (
        <div className="fixed inset-0 bg-black/50 lg:hidden" onClick={() => setNavVisible(false)}></div>
      )}
    </div>
  );
};

export default Navbar;
