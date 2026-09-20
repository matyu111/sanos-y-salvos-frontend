import { PublicClientApplication } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: "80f88177-c995-4f70-9bae-dd56af657969", // Id de cliente de la SPA en Azure
    authority: "https://login.microsoftonline.com/b96a854a-2ed8-4431-8c5a-3d20ba4a9194", // Tenant ID de Sanos y Salvos Cloud
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["openid", "profile", "email", "User.Read"],
};

export const tokenRequest = {
  scopes: [
    "api://2e3c9553-c4e1-41d3-be14-7776e4a47f06/mascotas.read",
    "api://2e3c9553-c4e1-41d3-be14-7776e4a47f06/mascotas.write",
  ],
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const initializeMsal = async () => {
  await msalInstance.initialize();
  await msalInstance.handleRedirectPromise();
  return msalInstance;
};

export const msalInitializedPromise = initializeMsal();

