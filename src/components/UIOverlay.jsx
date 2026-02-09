import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  Satellite,
  Radio,
  Search,
  X,
  ChevronLeft,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

function UIOverlay({
  satelliteData,
  selectedSat,
  setSelectedSat,
  filters,
  setFilters,
  cameraControlRef,
}) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // sat search
  const filteredSatellites = useMemo(() => {
    if (!searchQuery.trim()) return satelliteData;
    const query = searchQuery.toLowerCase();
    return satelliteData.filter((sat) =>
      sat.name.toLowerCase().includes(query),
    );
  }, [satelliteData, searchQuery]);

  // orbit status
  const analytics = useMemo(() => {
    const total = satelliteData.length;
    const debris = satelliteData.filter((s) => s.type === "Debris").length;
    const stations = satelliteData.filter((s) => s.type === "Station").length;

    // LEO Density Mean motion > 11.25 rev/day indicates LEO orbit
    const leo = satelliteData.filter(
      (s) => s.satrec && s.satrec.no > (11.25 * 2 * Math.PI) / 1440,
    ).length;
    const leoDensity = total > 0 ? ((leo / total) * 100).toFixed(1) : "0.0";

    return { total, debris, stations, leoDensity };
  }, [satelliteData]);

  // filter function
  const toggleFilter = (filterKey) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* DASHBOARD */}
      <motion.button
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 pointer-events-auto backdrop-blur-md bg-black/80 border border-white/10 rounded-lg px-4 py-2 text-white/90 hover:bg-black/90 hover:border-cyan-500/50 transition-all flex items-center gap-2 group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium tracking-wide">DASHBOARD</span>
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="absolute top-20 left-6 pointer-events-none"
      >
        <div className="flex items-baseline gap-2">
          <h1
            className="text-lg font-bold tracking-wider text-white"
            style={{ fontFamily: "Rajdhani, monospace" }}
          >
            AstraSim
          </h1>
          <span className="text-cyan-400 text-sm">//</span>
          <span className="text-sm text-white/70 tracking-widest font-mono">
            SATELLITE TRACKING
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="relative">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
          </div>
          <span className="text-xs text-green-400 font-medium">
            SYSTEM ONLINE
          </span>
        </div>
      </motion.div>

      {/* Left Sidebar*/}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="absolute left-6 top-40 bottom-6 w-80 pointer-events-auto"
      >
        <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-full shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <Satellite className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">
              SATELLITE CATALOG
            </h2>
          </div>

          {/* Search Bar*/}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              placeholder="Search satellites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-2 text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-xs text-white/50 mt-4 mb-2">
            Showing {Math.min(filteredSatellites.length, 20)} of{" "}
            {filteredSatellites.length} results
          </div>

          {/* Satellite List*/}
          <div className="flex-grow overflow-y-auto space-y-2 pr-2">
            {filteredSatellites.slice(0, 20).map((sat, index) => {
              const isDebris = sat.type === "Debris";
              const isSelected = selectedSat && selectedSat.name === sat.name;
              const accentColor =
                sat.type === "Debris"
                  ? "text-red-400"
                  : sat.type === "GPS"
                    ? "text-yellow-400"
                    : sat.type === "Starlink"
                      ? "text-white"
                      : "text-cyan-400";
              const bgAccent = isSelected
                ? "bg-cyan-500/20"
                : sat.type === "Debris"
                  ? "bg-red-500/10"
                  : "bg-cyan-500/5";
              const borderAccent = isSelected
                ? "border-cyan-500/50"
                : sat.type === "Debris"
                  ? "border-red-500/30"
                  : "border-white/10";

              return (
                <motion.div
                  key={sat.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.02 }}
                  onClick={() => setSelectedSat(isSelected ? null : sat)}
                  className={`${bgAccent} ${borderAccent} border backdrop-blur-sm rounded-lg p-3 hover:scale-105 transition-all cursor-pointer ${isSelected ? "ring-2 ring-cyan-500/30" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-sm tracking-wide truncate">
                        {sat.name}
                      </h3>
                      <p className={`text-xs ${accentColor} font-medium mt-1`}>
                        {sat.type}
                      </p>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full mt-1 flex-shrink-0`}
                      style={{ backgroundColor: sat.color }}
                    ></div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-auto pt-4 border-t border-white/10">
            <div className="bg-black/90 rounded-xl p-4">
              <h3
                className="text-sm font-bold text-white/90 mb-3 tracking-wide"
                style={{ fontFamily: "Rajdhani, sans-serif" }}
              >
                OBJECT CLASSIFICATION
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                  <span className="text-xs text-white/70">
                    RED: Debris / Uncontrolled
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0"></div>
                  <span className="text-xs text-white/70">
                    CYAN: Station / Manned
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-white flex-shrink-0"></div>
                  <span className="text-xs text-white/70">
                    WHITE: Active Satellite
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0"></div>
                  <span className="text-xs text-white/70">
                    GOLD: GPS / Navigation
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Orbital Analytics & Filters & Zoom Controls */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="absolute right-6 top-32 bottom-6 w-96 pointer-events-auto flex flex-col gap-4"
      >
        {/* + - control */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => cameraControlRef?.current?.zoomIn()}
            className="bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-lg p-3 hover:bg-cyan-500/20 transition-all shadow-xl"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5 text-cyan-400" />
          </button>
          <button
            onClick={() => cameraControlRef?.current?.zoomOut()}
            className="bg-black/80 backdrop-blur-md border border-cyan-500/30 rounded-lg p-3 hover:bg-cyan-500/20 transition-all shadow-xl"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5 text-cyan-400" />
          </button>
        </div>

        <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex-1 shadow-2xl overflow-y-auto flex flex-col gap-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Radio className="w-5 h-5 text-green-400" />
              <h2 className="text-xl font-bold text-white tracking-wide">
                ORBITAL ANALYTICS
              </h2>
            </div>

            <div className="space-y-3">
              {/* Total Tracked */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4"
              >
                <div className="text-sm text-cyan-400 font-medium mb-1">
                  TOTAL TRACKED
                </div>
                <div className="text-4xl font-bold text-white tabular-nums">
                  {analytics.total.toLocaleString()}
                </div>
                <div className="text-xs text-white/50 mt-1">Active Objects</div>
              </motion.div>

              {/* Debris Count */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"
              >
                <div className="text-sm text-red-400 font-medium mb-1">
                  DEBRIS COUNT
                </div>
                <div className="text-4xl font-bold text-white tabular-nums">
                  {analytics.debris.toLocaleString()}
                </div>
                <div className="text-xs text-white/50 mt-1">
                  Collision Hazards
                </div>
              </motion.div>

              {/* Stations */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4"
              >
                <div className="text-sm text-purple-400 font-medium mb-1">
                  STATIONS
                </div>
                <div className="text-4xl font-bold text-white tabular-nums">
                  {analytics.stations.toLocaleString()}
                </div>
                <div className="text-xs text-white/50 mt-1">
                  Operational Facilities
                </div>
              </motion.div>

              {/* LEO Density */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4"
              >
                <div className="text-sm text-yellow-400 font-medium mb-1">
                  LEO DENSITY
                </div>
                <div className="text-4xl font-bold text-white tabular-nums">
                  {analytics.leoDensity}%
                </div>
                <div className="text-xs text-white/50 mt-1">
                  Low Earth Orbit
                </div>
              </motion.div>
            </div>
          </div>

          {/* Visibility Filters Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white tracking-wide">
                VISIBILITY FILTERS
              </h2>
            </div>

            <div className="space-y-2">
              {/* Debris Filter */}
              <button
                onClick={() => toggleFilter("debris")}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                  filters.debris
                    ? "bg-red-500/10 border-red-500/30 hover:bg-red-500/20"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-sm text-white font-medium">Debris</span>
                </div>
                {filters.debris ? (
                  <Eye className="w-4 h-4 text-red-400" />
                ) : (
                  <EyeOff className="w-4 h-4 text-white/40" />
                )}
              </button>

              {/* Station Filter */}
              <button
                onClick={() => toggleFilter("station")}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                  filters.station
                    ? "bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <span className="text-sm text-white font-medium">
                    Stations
                  </span>
                </div>
                {filters.station ? (
                  <Eye className="w-4 h-4 text-cyan-400" />
                ) : (
                  <EyeOff className="w-4 h-4 text-white/40" />
                )}
              </button>

              {/* Starlink Filter */}
              <button
                onClick={() => toggleFilter("starlink")}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                  filters.starlink
                    ? "bg-white/10 border-white/30 hover:bg-white/20"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                  <span className="text-sm text-white font-medium">
                    Starlink
                  </span>
                </div>
                {filters.starlink ? (
                  <Eye className="w-4 h-4 text-white" />
                ) : (
                  <EyeOff className="w-4 h-4 text-white/40" />
                )}
              </button>

              {/* GPS Filter */}
              <button
                onClick={() => toggleFilter("gps")}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                  filters.gps
                    ? "bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  <span className="text-sm text-white font-medium">
                    GPS / Navigation
                  </span>
                </div>
                {filters.gps ? (
                  <Eye className="w-4 h-4 text-yellow-400" />
                ) : (
                  <EyeOff className="w-4 h-4 text-white/40" />
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* detail selection view */}
      {selectedSat && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto"
        >
          <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-5 shadow-2xl min-w-[500px]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {selectedSat.name}
                </h3>
                <p className="text-sm" style={{ color: selectedSat.color }}>
                  {selectedSat.type}
                </p>
              </div>
              <button
                onClick={() => setSelectedSat(null)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-white/50 mb-1">NORAD ID</div>
                <div className="text-white font-mono text-sm">
                  {selectedSat.satrec?.satnum || "N/A"}
                </div>
              </div>
              <div>
                <div className="text-xs text-white/50 mb-1">INCLINATION</div>
                <div className="text-white font-mono text-sm">
                  {selectedSat.satrec?.inclo
                    ? ((selectedSat.satrec.inclo * 180) / Math.PI).toFixed(2) +
                      "°"
                    : "N/A"}
                </div>
              </div>
              <div>
                <div className="text-xs text-white/50 mb-1">PERIOD</div>
                <div className="text-white font-mono text-sm">
                  {selectedSat.satrec?.no
                    ? ((2 * Math.PI) / selectedSat.satrec.no).toFixed(1) +
                      " min"
                    : "N/A"}
                </div>
              </div>
            </div>

            <button className="mt-4 w-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 font-medium py-2 px-4 rounded-lg transition-colors">
              LOCK CAMERA
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default UIOverlay;
