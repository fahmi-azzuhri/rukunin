import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "id.efkode.rukunin",
  appName: "Rukunin",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
