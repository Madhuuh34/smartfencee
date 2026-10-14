import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import {
  ANIMALS,
  CAMERAS,
  FARM_ZONES,
  SENSORS,
  SIMULATION_WAYPOINTS,
  STAGES_CONFIG,
  WATER_PUMP_LOCATION,
} from '../data/farmData';
import {
  AnimalType,
  DemoStage,
  DeterrenceEvent,
  StageInfo,
} from '../types';
import { soundEffects } from '../utils/audio';

interface FarmContextType {
  // State
  stage: DemoStage;
  stageInfo: StageInfo | null;
  stageProgress: number; // 0 to 1 for current stage
  totalProgress: number; // 0 to 1 overall demo progress
  isPlaying: boolean;
  isPaused: boolean;
  selectedAnimal: AnimalType;
  selectedCameraId: string;
  selectedZoneId: string;
  isNightMode: boolean;
  isAutoSprayEnabled: boolean;
  sprayDurationSec: number;
  isWaterSpraying: boolean;
  waterTankLevel: number;
  lastSprayTime: string | null;
  currentDistanceM: number;
  telemetryHistory: { time: string; distance: number }[];
  animalWorldPos: [number, number, number];
  animalMapPos: [number, number];
  animalHeadingDeg: number;
  historicalTrail: [number, number, number][];
  historicalMapTrail: [number, number][];
  events: DeterrenceEvent[];
  activeEvent: DeterrenceEvent | null;
  eventDetailModal: DeterrenceEvent | null;
  isMuted: boolean;
  alertBanner: { title: string; message: string; type: 'amber' | 'emerald' | 'blue' } | null;

  // Actions
  startFullDemo: () => void;
  pauseDemo: () => void;
  resumeDemo: () => void;
  replayDemo: () => void;
  resetDemo: () => void;
  triggerDetectionNow: () => void;
  testWaterSpray: () => void;
  stopWaterSpray: () => void;
  toggleAutoSpray: () => void;
  setSprayDurationSec: (sec: number) => void;
  setSelectedAnimal: (animal: AnimalType) => void;
  setSelectedCameraId: (id: string) => void;
  setSelectedZoneId: (id: string) => void;
  setIsNightMode: (night: boolean) => void;
  setIsMuted: (muted: boolean) => void;
  setEventDetailModal: (event: DeterrenceEvent | null) => void;
  clearEvents: () => void;
  dismissAlert: () => void;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

// Helper to interpolate waypoints
function interpolateWaypoints(t: number): {
  world: [number, number, number];
  map: [number, number];
  heading: number;
} {
  const clampedT = Math.max(0, Math.min(1, t));
  const wps = SIMULATION_WAYPOINTS;

  let prev = wps[0];
  let next = wps[wps.length - 1];

  for (let i = 0; i < wps.length - 1; i++) {
    if (clampedT >= wps[i].progress && clampedT <= wps[i + 1].progress) {
      prev = wps[i];
      next = wps[i + 1];
      break;
    }
  }

  const span = next.progress - prev.progress || 0.0001;
  const localRatio = Math.max(0, Math.min(1, (clampedT - prev.progress) / span));

  const x = prev.x + (next.x - prev.x) * localRatio;
  const z = prev.z + (next.z - prev.z) * localRatio;
  const y = 0; // terrain level

  const lat = prev.lat + (next.lat - prev.lat) * localRatio;
  const lng = prev.lng + (next.lng - prev.lng) * localRatio;

  // Calculate heading
  const dx = next.x - prev.x;
  const dz = next.z - prev.z;
  const headingRad = Math.atan2(dx, dz);
  const headingDeg = (headingRad * 180) / Math.PI;

  return {
    world: [x, y, z],
    map: [lat, lng],
    heading: headingDeg,
  };
}

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stage, setStage] = useState<DemoStage>('idle');
  const [stageProgress, setStageProgress] = useState(0);
  const [totalProgress, setTotalProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [selectedAnimal, setSelectedAnimalState] = useState<AnimalType>('deer');
  const [selectedCameraId, setSelectedCameraId] = useState('CAM-02-E');
  const [selectedZoneId, setSelectedZoneId] = useState('zone-east');
  const [isNightMode, setIsNightMode] = useState(false);
  const [isAutoSprayEnabled, setIsAutoSprayEnabled] = useState(true);
  const [sprayDurationSec, setSprayDurationSec] = useState(5);
  const [isWaterSpraying, setIsWaterSpraying] = useState(false);
  const [waterTankLevel, setWaterTankLevel] = useState(WATER_PUMP_LOCATION.currentLevelLiters);
  const [lastSprayTime, setLastSprayTime] = useState<string | null>(null);

  const [currentDistanceM, setCurrentDistanceM] = useState(14.8);
  const [telemetryHistory, setTelemetryHistory] = useState<{ time: string; distance: number }[]>([
    { time: '00s', distance: 14.8 },
  ]);

  const [animalWorldPos, setAnimalWorldPos] = useState<[number, number, number]>([
    SIMULATION_WAYPOINTS[0].x,
    0,
    SIMULATION_WAYPOINTS[0].z,
  ]);
  const [animalMapPos, setAnimalMapPos] = useState<[number, number]>([
    SIMULATION_WAYPOINTS[0].lat,
    SIMULATION_WAYPOINTS[0].lng,
  ]);
  const [animalHeadingDeg, setAnimalHeadingDeg] = useState(240);

  const [historicalTrail, setHistoricalTrail] = useState<[number, number, number][]>([]);
  const [historicalMapTrail, setHistoricalMapTrail] = useState<[number, number][]>([]);

  const [events, setEvents] = useState<DeterrenceEvent[]>(() => {
    // Seed 1-2 realistic historical events for realism
    return [
      {
        id: 'SF-DEMO-8821',
        timestamp: '15 mins ago',
        isoDate: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        animalType: 'wild_boar',
        animalName: 'Wild Boar',
        confidence: 96.2,
        zoneId: 'zone-east',
        zoneName: 'Zone B — East Cornfield',
        cameraId: 'CAM-02-E',
        sensorId: 'SEN-01-US',
        sensorDistanceM: 3.1,
        pumpDurationSec: 5,
        pumpStatus: 'Success',
        deterrenceResponse: 'Ultrasonic Pulse + Cyan Water Spray',
        smsStatus: 'SIMULATED — NOT SENT',
        verified: true,
        notes: 'Subject halted at 3.1m and retreated northeast towards buffer treeline.',
      },
    ];
  });

  const [activeEvent, setActiveEvent] = useState<DeterrenceEvent | null>(null);
  const [eventDetailModal, setEventDetailModal] = useState<DeterrenceEvent | null>(null);
  const [isMuted, setIsMutedState] = useState(false);
  const [alertBanner, setAlertBanner] = useState<{
    title: string;
    message: string;
    type: 'amber' | 'emerald' | 'blue';
  } | null>(null);

  // References for deterministic animation loop
  const animFrameRef = useRef<number | null>(null);
  const stageStartTimeRef = useRef<number>(0);
  const stageElapsedBeforePauseRef = useRef<number>(0);
  const currentStageIndexRef = useRef<number>(0);

  const stageOrder: DemoStage[] = [
    'monitoring',
    'approaching',
    'capturing',
    'detecting',
    'sensing',
    'spraying',
    'recording',
    'departing',
  ];

  const currentStageInfo = STAGES_CONFIG.find((s) => s.id === stage) || null;

  const setIsMuted = (val: boolean) => {
    setIsMutedState(val);
    soundEffects.setMuted(val);
  };

  const setSelectedAnimal = (animal: AnimalType) => {
    setSelectedAnimalState(animal);
  };

  const dismissAlert = () => setAlertBanner(null);

  // Direct spray actions
  const testWaterSpray = useCallback(() => {
    soundEffects.playClick();
    setIsWaterSpraying(true);
    soundEffects.startSpraySound();
    setLastSprayTime(new Date().toLocaleTimeString());
    setWaterTankLevel((prev) => Math.max(prev - 12, 100));
  }, []);

  const stopWaterSpray = useCallback(() => {
    soundEffects.playClick();
    setIsWaterSpraying(false);
    soundEffects.stopSpraySound();
  }, []);

  const toggleAutoSpray = () => {
    soundEffects.playClick();
    setIsAutoSprayEnabled((prev) => !prev);
  };

  // Helper to record an event
  const createDemoEvent = useCallback(() => {
    const animalCfg = ANIMALS[selectedAnimal];
    const zoneCfg = FARM_ZONES.find((z) => z.id === selectedZoneId) || FARM_ZONES[1];
    const newEvt: DeterrenceEvent = {
      id: `SF-EVT-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: 'Just now',
      isoDate: new Date().toISOString(),
      animalType: selectedAnimal,
      animalName: animalCfg.name,
      confidence: 94.6,
      zoneId: zoneCfg.id,
      zoneName: zoneCfg.name,
      cameraId: selectedCameraId,
      sensorId: 'SEN-01-US',
      sensorDistanceM: 2.4,
      pumpDurationSec: sprayDurationSec,
      pumpStatus: isAutoSprayEnabled ? 'Success' : 'Manual',
      deterrenceResponse: isAutoSprayEnabled
        ? 'Safe Automated Water Jet + Ultrasonic Beam'
        : 'Water Spray Disabled (Observation Only)',
      smsStatus: 'SIMULATED — NOT SENT',
      verified: true,
      notes: `${animalCfg.name} detected crossing perimeter into ${zoneCfg.crop} beds. Non-lethal deterrence triggered.`,
    };

    setActiveEvent(newEvt);
    setEvents((prev) => [newEvt, ...prev]);

    setAlertBanner({
      title: `AI ALERT: ${animalCfg.name.toUpperCase()} DETECTED`,
      message: `${zoneCfg.name} • Conf: 94.6% DEMO • Camera: ${selectedCameraId} • SMS Logged (SIMULATED)`,
      type: 'amber',
    });

    soundEffects.playAlert();
  }, [selectedAnimal, selectedZoneId, selectedCameraId, sprayDurationSec, isAutoSprayEnabled]);

  // Main simulation tick
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    let localAnimId: number;

    const tick = (now: number) => {
      if (stageStartTimeRef.current === 0) {
        stageStartTimeRef.current = now;
      }

      const currentStageKey = stageOrder[currentStageIndexRef.current];
      const stageConfig = STAGES_CONFIG.find((s) => s.id === currentStageKey);
      const stageDuration = stageConfig ? stageConfig.durationMs : 3000;

      const elapsed = now - stageStartTimeRef.current + stageElapsedBeforePauseRef.current;
      const progressInStage = Math.min(1, elapsed / stageDuration);
      setStageProgress(progressInStage);

      // Compute overall progress across all 8 stages
      const totalStages = stageOrder.length;
      const overall = (currentStageIndexRef.current + progressInStage) / totalStages;
      setTotalProgress(overall);

      // Update animal position along path
      const { world, map, heading } = interpolateWaypoints(overall);
      setAnimalWorldPos(world);
      setAnimalMapPos(map);
      setAnimalHeadingDeg(heading);

      // Append trail periodically
      setHistoricalTrail((prev) => {
        if (prev.length === 0 || Math.hypot(prev[prev.length - 1][0] - world[0], prev[prev.length - 1][2] - world[2]) > 0.8) {
          return [...prev, world];
        }
        return prev;
      });

      setHistoricalMapTrail((prev) => {
        if (prev.length === 0 || Math.hypot(prev[prev.length - 1][0] - map[0], prev[prev.length - 1][1] - map[1]) > 0.0003) {
          return [...prev, map];
        }
        return prev;
      });

      // Compute dynamic ultrasonic sensor distance
      // Distance from animal to sensor SEN-01 (world: [11, 0.9, -1])
      const distToSensor = Math.hypot(world[0] - 11, world[2] - (-1));
      const normalizedDist = Math.max(1.8, Math.min(15.0, parseFloat(distToSensor.toFixed(1))));
      setCurrentDistanceM(normalizedDist);

      // Check if stage is complete
      if (progressInStage >= 1) {
        // Stage transition
        const nextIndex = currentStageIndexRef.current + 1;
        if (nextIndex < stageOrder.length) {
          currentStageIndexRef.current = nextIndex;
          stageStartTimeRef.current = now;
          stageElapsedBeforePauseRef.current = 0;
          const nextStageKey = stageOrder[nextIndex];
          setStage(nextStageKey);

          // Handle stage triggers
          if (nextStageKey === 'detecting') {
            soundEffects.playDetectionBeep();
          } else if (nextStageKey === 'spraying') {
            if (isAutoSprayEnabled) {
              setIsWaterSpraying(true);
              soundEffects.startSpraySound();
              setLastSprayTime(new Date().toLocaleTimeString());
              setWaterTankLevel((prev) => Math.max(prev - 8, 80));
            }
          } else if (nextStageKey === 'recording') {
            createDemoEvent();
          } else if (nextStageKey === 'departing') {
            // Stop water spray when animal departs
            setIsWaterSpraying(false);
            soundEffects.stopSpraySound();
          }
        } else {
          // Simulation complete
          setIsPlaying(false);
          setStage('completed');
          setIsWaterSpraying(false);
          soundEffects.stopSpraySound();
          setAlertBanner({
            title: 'DEMO COMPLETED SUCCESSFULLY',
            message: 'All 8 stages executed. Safe deterrence verified with zero wildlife injury.',
            type: 'emerald',
          });
          return;
        }
      }

      localAnimId = requestAnimationFrame(tick);
    };

    localAnimId = requestAnimationFrame(tick);
    animFrameRef.current = localAnimId;

    return () => {
      cancelAnimationFrame(localAnimId);
    };
  }, [isPlaying, isPaused, isAutoSprayEnabled, createDemoEvent]);

  // Rolling telemetry recorder
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTelemetryHistory((prev) => {
        const next = [...prev, { time: `${Math.round(totalProgress * 28)}s`, distance: currentDistanceM }];
        if (next.length > 20) next.shift();
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, totalProgress, currentDistanceM]);

  // Actions
  const startFullDemo = () => {
    soundEffects.playClick();
    currentStageIndexRef.current = 0;
    stageStartTimeRef.current = 0;
    stageElapsedBeforePauseRef.current = 0;
    setHistoricalTrail([]);
    setHistoricalMapTrail([]);
    setActiveEvent(null);
    setIsWaterSpraying(false);
    soundEffects.stopSpraySound();
    setStage(stageOrder[0]);
    setIsPaused(false);
    setIsPlaying(true);
  };

  const pauseDemo = () => {
    soundEffects.playClick();
    if (!isPlaying || isPaused) return;
    setIsPaused(true);
    if (stageStartTimeRef.current > 0) {
      stageElapsedBeforePauseRef.current += performance.now() - stageStartTimeRef.current;
    }
    stageStartTimeRef.current = 0;
    if (isWaterSpraying) {
      soundEffects.stopSpraySound();
    }
  };

  const resumeDemo = () => {
    soundEffects.playClick();
    if (!isPlaying || !isPaused) return;
    setIsPaused(false);
    stageStartTimeRef.current = 0;
    if (stage === 'spraying' && isAutoSprayEnabled) {
      soundEffects.startSpraySound();
    }
  };

  const replayDemo = () => {
    soundEffects.playClick();
    startFullDemo();
  };

  const resetDemo = () => {
    soundEffects.playClick();
    setIsPlaying(false);
    setIsPaused(false);
    currentStageIndexRef.current = 0;
    stageStartTimeRef.current = 0;
    stageElapsedBeforePauseRef.current = 0;
    setStage('idle');
    setStageProgress(0);
    setTotalProgress(0);
    setIsWaterSpraying(false);
    soundEffects.stopSpraySound();
    setCurrentDistanceM(14.8);
    setAlertBanner(null);

    const init = SIMULATION_WAYPOINTS[0];
    setAnimalWorldPos([init.x, 0, init.z]);
    setAnimalMapPos([init.lat, init.lng]);
    setHistoricalTrail([]);
    setHistoricalMapTrail([]);
  };

  const triggerDetectionNow = () => {
    soundEffects.playClick();
    // Fast forward directly to detecting stage
    currentStageIndexRef.current = 3; // detecting
    stageStartTimeRef.current = 0;
    stageElapsedBeforePauseRef.current = 0;
    setStage('detecting');
    setIsPlaying(true);
    setIsPaused(false);
    soundEffects.playDetectionBeep();
  };

  const clearEvents = () => {
    soundEffects.playClick();
    setEvents([]);
    setActiveEvent(null);
  };

  return (
    <FarmContext.Provider
      value={{
        stage,
        stageInfo: currentStageInfo,
        stageProgress,
        totalProgress,
        isPlaying,
        isPaused,
        selectedAnimal,
        selectedCameraId,
        selectedZoneId,
        isNightMode,
        isAutoSprayEnabled,
        sprayDurationSec,
        isWaterSpraying,
        waterTankLevel,
        lastSprayTime,
        currentDistanceM,
        telemetryHistory,
        animalWorldPos,
        animalMapPos,
        animalHeadingDeg,
        historicalTrail,
        historicalMapTrail,
        events,
        activeEvent,
        eventDetailModal,
        isMuted,
        alertBanner,
        startFullDemo,
        pauseDemo,
        resumeDemo,
        replayDemo,
        resetDemo,
        triggerDetectionNow,
        testWaterSpray,
        stopWaterSpray,
        toggleAutoSpray,
        setSprayDurationSec,
        setSelectedAnimal,
        setSelectedCameraId,
        setSelectedZoneId,
        setIsNightMode,
        setIsMuted,
        setEventDetailModal,
        clearEvents,
        dismissAlert,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};
