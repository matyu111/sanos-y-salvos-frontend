import { PublicClientApplication } from "@azure/msal-browser";

export const msalConfig = {
  auth: {
    clientId: "80f88177-c995-4f70-9bae-dd56af657969", // Id de cliente de la SPA en Azure
    authority: "https://login.microsoftonline.com/b96a854a-2ed8-4431-8c5a-3d20ba4a9194", // Tenant ID de Sanos y Salvos Cloud
    redirectUri: "http://localhost:5173",
    postLogoutRedirectUri: "http://localhost:5173",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: [
    "openid",
    "profile",
    "email",
    "api://2e3c9553-c4e1-41d3-be14-7776e4a47f06/mascotas.read",
    "api://2e3c9553-c4e1-41d3-be14-7776e4a47f06/mascotas.write",
  ],
};

export const msalInstance = new PublicClientApplication(msalConfig);
