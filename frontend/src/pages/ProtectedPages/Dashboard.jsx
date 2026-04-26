import React from "react";
import { Outlet } from "react-router-dom";
import LogoutModal from "../../components/Modals/LogoutModal";
import { SideBar, TopBar } from "../../components/ProtectedNavigations";
import {
  TransactionViewAndUpdateModal,
  TransactionDeleteModal,
} from "../../components/Modals";

const Dashboard = () => {
  return (
    <main className="w-full h-screen flex overflow-hidden">
      {/* Sidebar stays fixed */}
      <SideBar />

      {/* Main content scrolls */}
      <section className="flex-1 h-full flex flex-col overflow-y-auto">
        <TopBar />
        <Outlet />
      </section>

      {/* Modals */}
      <LogoutModal />
      <TransactionViewAndUpdateModal />
      <TransactionDeleteModal />
    </main>
  );
};

export default Dashboard;
