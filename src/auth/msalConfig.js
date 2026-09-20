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
  try {
    await msalInstance.initialize();
    const response = await msalInstance.handleRedirectPromise();
    const account = response?.account || msalInstance.getAllAccounts()[0];

    if (account) {
      const email = account.username || account.idTokenClaims?.preferred_username || "usuario.prueba@sanosysalvosmaty.onmicrosoft.com";
      const nombre = account.name || account.idTokenClaims?.name || "Usuario Azure AD";
      const token = response?.accessToken || response?.idToken || localStorage.getItem("token") || "azure_ad_token_jwt";
      localStorage.setItem("token", token);
      localStorage.setItem("userId", "1");
      localStorage.setItem("nombre", nombre);
      localStorage.setItem("email", email);
      localStorage.setItem("rol", "ADMIN");
    }
  } catch (err) {
    console.debug("MSAL initialization/redirect info:", err);
  }
  return msalInstance;
};

export const msalInitializedPromise = initializeMsal();




