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
    { name: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt /> },
    { name: "Incomes", path: "/dashboard/incomes", icon: <FaMoneyBillWave /> },
    { name: "Expenses", path: "/dashboard/expenses", icon: <FaWallet /> },
    { name: "Chatbot", path: "/dashboard/chatbot", icon: <FaRobot /> },
  ];

  return (
    <nav
      className={`hidden xl:flex flex-col h-full border-r-1 border-secondary py-3 transition-all duration-300
      ${collapsed ? "w-[70px]" : "w-[15%]"}`}
    >
      {/* 🔝 Top */}
      <div className="px-4 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-x-2">
            <img src={logo} alt="logo" className="w-[2.5rem]" />
            <h5 className="text-xl font-outfit">
              Spend<span className="text-primary">Smart.</span>
            </h5>
          </div>
        )}

        <FaBars
          className="cursor-pointer"
          onClick={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* 🔗 Menu */}
      <menu className="w-full h-full flex flex-col px-3 mt-12">
        <div className="space-y-6 flex flex-col">
          {menuItems.map((item, i) => (
            <li
              key={i}
              className={`link relative ${
                isRouteActive(item.path) ? "activeLink" : ""
              }`}
              onClick={() => navigate(item.path)}
            >
              <span className="text-[18px] min-w-[20px]">
                {item.icon}
              </span>

              {!collapsed && item.name}

              {/* Tooltip */}
              {collapsed && (
                <span className="absolute left-14 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100">
                  {item.name}
                </span>
              )}
            </li>
          ))}
        </div>

        {/* ⚙️ Bottom */}
        <li
          className={`link mt-auto ${
            isRouteActive("/dashboard/settings") ? "activeLink" : ""
          }`}
          onClick={() => navigate("/dashboard/settings")}
        >
          <FaCog className="text-[18px] min-w-[20px]" />
          {!collapsed && "Settings"}
        </li>

        <li
          className="link mt-6 hover:bg-error hover:text-white"
          onClick={() => dispatch(openModal())}
        >
          <FaSignOutAlt className="text-[18px] min-w-[20px]" />
          {!collapsed && "Logout"}
        </li>
      </menu>
    </nav>
  );
};

export default SideBar;