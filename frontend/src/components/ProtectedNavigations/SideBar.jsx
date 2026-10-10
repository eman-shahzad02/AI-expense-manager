import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  FaTachometerAlt,
  FaMoneyBillWave,
  FaWallet,
  FaCog,
  FaSignOutAlt,
  FaRobot,
  FaBars,
} from "react-icons/fa";

import { openModal } from "../../features/logoutModal/logoutModalSlice";
import logo from "/logo.webp";

const SideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [collapsed, setCollapsed] = useState(false);

  const isRouteActive = (path) => location.pathname === path;

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaTachometerAlt />,
    },
    {
      name: "Incomes",
      path: "/dashboard/incomes",
      icon: <FaMoneyBillWave />,
    },
    {
      name: "Expenses",
      path: "/dashboard/expenses",
      icon: <FaWallet />,
    },
    {
      name: "Chatbot",
      path: "/dashboard/chatbot",
      icon: <FaRobot />,
    },
  ];

  return (
    <nav
      className={`hidden xl:flex flex-col h-full border-r border-secondary py-4 bg-white transition-all duration-300
      ${collapsed ? "w-[80px]" : "w-[260px]"}`}
    >
      {/* 🔝 Top Section */}
      <div className="flex items-center px-4 mb-10">
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={logo}
              alt="logo"
              className="w-10 h-10 object-contain"
            />

            <h5 className="text-[20px] font-semibold whitespace-nowrap">
              Expense
              <span className="text-primary">Manager.</span>
            </h5>
          </div>
        )}

        <button
          className={`text-xl cursor-pointer hover:text-primary transition-all duration-200
          ${collapsed ? "mx-auto" : "ml-auto"}`}
          onClick={() => setCollapsed(!collapsed)}
        >
          <FaBars />
        </button>
      </div>

      {/* 🔗 Menu */}
      <div className="flex flex-col h-full px-3">
        <div className="flex flex-col gap-3">
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${
                isRouteActive(item.path)
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <span className="text-lg min-w-[20px] flex justify-center">
                {item.icon}
              </span>

              {!collapsed && (
                <span className="text-sm font-medium">
                  {item.name}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ⚙️ Bottom Buttons */}
        <div className="mt-auto flex flex-col gap-3">
          <button
            onClick={() => navigate("/dashboard/settings")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
            ${
              isRouteActive("/dashboard/settings")
                ? "bg-primary text-white"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <FaCog className="text-lg min-w-[20px]" />

            {!collapsed && (
              <span className="text-sm font-medium">
                Settings
              </span>
            )}
          </button>

          <button
            onClick={() => dispatch(openModal())}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-red-500 hover:text-white transition-all duration-200"
          >
            <FaSignOutAlt className="text-lg min-w-[20px]" />

            {!collapsed && (
              <span className="text-sm font-medium">
                Logout
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default SideBar;