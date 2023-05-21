import { useCallback } from "react";
import { Toaster } from "react-hot-toast";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

import AppSection from "./components/AppSection";
import AppStateProvider from "./components/AppStateProvider";
import Home from "./components/Home/Home";
import NavStateProvider from "./components/NavStateProvider";
import Nav from "./components/Nav";
import CashDrawerList from "./components/CashDrawerList";
import Footer from "./components/Footer";

export default function App() {
  return (
    <AppStateProvider>
      <NavStateProvider>
        <Nav />
        <div className="main-container">
          <AppSection section="home">
            <Home />
          </AppSection>
          <AppSection section="drawers">
            <CashDrawerList />
          </AppSection>
        </div>
        <Footer />
      </NavStateProvider>
      <Toaster />
    </AppStateProvider>
  );
}