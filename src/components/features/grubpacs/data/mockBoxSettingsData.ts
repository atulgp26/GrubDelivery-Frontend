export type SignalStrength = "NO SIGNAL" | "WEAK" | "STRONG";
export type OnOff = "ON" | "OFF";

export interface BoxDriver {
  name: string;
  phone: string;
}

export interface BoxSettingsData {
  boxId: number | string;
  hardware: {
    power: { status: OnOff; connected: boolean };
    grublock: { status: "LOCKED" | "UNLOCKED" };
    ioniser: { status: OnOff };
    dualZone: { status: OnOff };
    extThermostat: { temp: string };
    gyrosensor: { status: "DETECTED" | "NOT DETECTED" };
  };
  connections: {
    wifi: { status: SignalStrength };
    bluetooth: { status: SignalStrength };
    signal4g: { status: "WEAK" | "STRONG" };
    gps: { status: OnOff };
  };
  zone1: { set: string; actual: string };
  zone2: { set: string; actual: string };
  driver: BoxDriver | null;
}

export const mockBoxSettingsData: BoxSettingsData[] = [
  {
    boxId: 1,
    hardware: {
      power: { status: "ON", connected: true },
      grublock: { status: "UNLOCKED" },
      ioniser: { status: "ON" },
      dualZone: { status: "ON" },
      extThermostat: { temp: "23°C" },
      gyrosensor: { status: "DETECTED" },
    },
    connections: {
      wifi: { status: "NO SIGNAL" },
      bluetooth: { status: "STRONG" },
      signal4g: { status: "WEAK" },
      gps: { status: "ON" },
    },
    zone1: { set: "-8°C", actual: "-9°C" },
    zone2: { set: "0°C", actual: "0°C" },
    driver: { name: "Ravi Kumar", phone: "+91 98765 43210" },
  },
  {
    boxId: 2,
    hardware: {
      power: { status: "ON", connected: false },
      grublock: { status: "UNLOCKED" },
      ioniser: { status: "ON" },
      dualZone: { status: "ON" },
      extThermostat: { temp: "21°C" },
      gyrosensor: { status: "DETECTED" },
    },
    connections: {
      wifi: { status: "WEAK" },
      bluetooth: { status: "STRONG" },
      signal4g: { status: "STRONG" },
      gps: { status: "ON" },
    },
    zone1: { set: "-5°C", actual: "-4°C" },
    zone2: { set: "2°C", actual: "2°C" },
    driver: { name: "Priya Sharma", phone: "+91 98001 12345" },
  },
  {
    boxId: 3,
    hardware: {
      power: { status: "ON", connected: true },
      grublock: { status: "LOCKED" },
      ioniser: { status: "OFF" },
      dualZone: { status: "ON" },
      extThermostat: { temp: "19°C" },
      gyrosensor: { status: "DETECTED" },
    },
    connections: {
      wifi: { status: "STRONG" },
      bluetooth: { status: "STRONG" },
      signal4g: { status: "STRONG" },
      gps: { status: "ON" },
    },
    zone1: { set: "-10°C", actual: "-10°C" },
    zone2: { set: "4°C", actual: "4°C" },
    driver: { name: "Ankit Verma", phone: "+91 99887 76543" },
  },
  {
    boxId: 4,
    hardware: {
      power: { status: "ON", connected: false },
      grublock: { status: "UNLOCKED" },
      ioniser: { status: "ON" },
      dualZone: { status: "OFF" },
      extThermostat: { temp: "25°C" },
      gyrosensor: { status: "NOT DETECTED" },
    },
    connections: {
      wifi: { status: "WEAK" },
      bluetooth: { status: "WEAK" },
      signal4g: { status: "WEAK" },
      gps: { status: "OFF" },
    },
    zone1: { set: "-3°C", actual: "-1°C" },
    zone2: { set: "5°C", actual: "6°C" },
    driver: null,
  },
  {
    boxId: 5,
    hardware: {
      power: { status: "ON", connected: true },
      grublock: { status: "LOCKED" },
      ioniser: { status: "ON" },
      dualZone: { status: "ON" },
      extThermostat: { temp: "22°C" },
      gyrosensor: { status: "DETECTED" },
    },
    connections: {
      wifi: { status: "NO SIGNAL" },
      bluetooth: { status: "STRONG" },
      signal4g: { status: "STRONG" },
      gps: { status: "ON" },
    },
    zone1: { set: "-8°C", actual: "-8°C" },
    zone2: { set: "0°C", actual: "1°C" },
    driver: { name: "Sunita Rao", phone: "+91 97654 32100" },
  },
  {
    boxId: 6,
    hardware: {
      power: { status: "OFF", connected: false },
      grublock: { status: "LOCKED" },
      ioniser: { status: "OFF" },
      dualZone: { status: "OFF" },
      extThermostat: { temp: "—" },
      gyrosensor: { status: "NOT DETECTED" },
    },
    connections: {
      wifi: { status: "NO SIGNAL" },
      bluetooth: { status: "NO SIGNAL" },
      signal4g: { status: "WEAK" },
      gps: { status: "OFF" },
    },
    zone1: { set: "—", actual: "—" },
    zone2: { set: "—", actual: "—" },
    driver: null,
  },
  {
    boxId: 7,
    hardware: {
      power: { status: "ON", connected: false },
      grublock: { status: "LOCKED" },
      ioniser: { status: "ON" },
      dualZone: { status: "ON" },
      extThermostat: { temp: "20°C" },
      gyrosensor: { status: "DETECTED" },
    },
    connections: {
      wifi: { status: "STRONG" },
      bluetooth: { status: "STRONG" },
      signal4g: { status: "STRONG" },
      gps: { status: "ON" },
    },
    zone1: { set: "-6°C", actual: "-5°C" },
    zone2: { set: "2°C", actual: "3°C" },
    driver: null,
  },
  {
    boxId: 8,
    hardware: {
      power: { status: "ON", connected: false },
      grublock: { status: "UNLOCKED" },
      ioniser: { status: "OFF" },
      dualZone: { status: "ON" },
      extThermostat: { temp: "24°C" },
      gyrosensor: { status: "NOT DETECTED" },
    },
    connections: {
      wifi: { status: "WEAK" },
      bluetooth: { status: "STRONG" },
      signal4g: { status: "WEAK" },
      gps: { status: "ON" },
    },
    zone1: { set: "-4°C", actual: "-3°C" },
    zone2: { set: "3°C", actual: "3°C" },
    driver: null,
  },
  {
    boxId: 9,
    hardware: {
      power: { status: "OFF", connected: false },
      grublock: { status: "LOCKED" },
      ioniser: { status: "OFF" },
      dualZone: { status: "OFF" },
      extThermostat: { temp: "—" },
      gyrosensor: { status: "NOT DETECTED" },
    },
    connections: {
      wifi: { status: "NO SIGNAL" },
      bluetooth: { status: "NO SIGNAL" },
      signal4g: { status: "WEAK" },
      gps: { status: "OFF" },
    },
    zone1: { set: "—", actual: "—" },
    zone2: { set: "—", actual: "—" },
    driver: null,
  },
  {
    boxId: 10,
    hardware: {
      power: { status: "ON", connected: true },
      grublock: { status: "UNLOCKED" },
      ioniser: { status: "ON" },
      dualZone: { status: "ON" },
      extThermostat: { temp: "23°C" },
      gyrosensor: { status: "DETECTED" },
    },
    connections: {
      wifi: { status: "STRONG" },
      bluetooth: { status: "STRONG" },
      signal4g: { status: "STRONG" },
      gps: { status: "ON" },
    },
    zone1: { set: "-9°C", actual: "-9°C" },
    zone2: { set: "1°C", actual: "1°C" },
    driver: { name: "Mohan Das", phone: "+91 98000 00000" },
  },
];
