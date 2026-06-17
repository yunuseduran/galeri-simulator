import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.duran.galerisimulator",
  appName: "Galeri Simülatörü",
  webDir: "dist",
  android: {
    allowMixedContent: false,
  },
  backgroundColor: "#0f1420",
};

export default config;
