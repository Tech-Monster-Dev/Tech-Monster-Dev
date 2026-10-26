"use client";

import { Suspense, lazy } from "react";
import Navbar from "../Navbar";
import Hero from "../Hero";
import CyberBackground from "../../../components/common/CyberBackground";
import useNearViewport from "../../../shared/hooks/useNearViewport";

const Notice = lazy(() => import("../Notice"));
const About = lazy(() => import("../About"));
const Feedback = lazy(() => import("../Feedback"));
const Contact = lazy(() => import("../Contact"));
const Footer = lazy(() => import("../Footer"));

function LazyLandingSection({ section, Component }) {
  const { ref, isNearViewport } = useNearViewport({
    rootMargin: "500px 0px",
  });

  return (
    <div ref={ref}>
      {isNearViewport ? (
        <Suspense fallback={null}>
          <Component />
        </Suspense>
      ) : (
        <div
          aria-hidden="true"
          className="w-full px-4 py-8 sm:px-5 md:px-6 lg:px-8"
          style={{ minHeight: section === "contact" ? "100vh" : "12rem" }}
        >
          <div className="mx-auto w-full max-w-7xl animate-pulse rounded-2xl border border-slate-700/40 bg-slate-900/20 p-6">
            <div className="mb-5 h-4 w-24 rounded bg-slate-700/40" />
            <div className="mb-3 h-6 w-2/3 max-w-md rounded bg-slate-700/40" />
            <div className="h-4 w-full max-w-2xl rounded bg-slate-700/30" />
          </div>
        </div>
      )}
    </div>
  );
}

function Landing() {
  return (
    <div className="cyber-page">
      <CyberBackground />

      <div className="relative z-10">
        <Navbar />
        <Hero />
        <LazyLandingSection section="notice" Component={Notice} />
        <LazyLandingSection section="about" Component={About} />
        <LazyLandingSection section="feedback" Component={Feedback} />
        <LazyLandingSection section="contact" Component={Contact} />
        <LazyLandingSection section="footer" Component={Footer} />
      </div>
    </div>
  );
}

export default Landing;
