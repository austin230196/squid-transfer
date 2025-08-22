import { Squid } from "@0xsquid/sdk"; // Import Squid SDK

// Initialize the Squid client with the base URL and integrator ID
export const getSDK = (): Squid => {
  const squid = new Squid({
    baseUrl: "https://apiplus.squidrouter.com",
    integratorId: import.meta.env.VITE_SQUID_INTEGRATOR_ID,
  });
  return squid;
};