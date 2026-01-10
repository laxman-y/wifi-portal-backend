import axios from "axios";

const ROUTER_URL = "http://192.168.1.1:2050";

export async function allowMac(mac) {
  try {
    await axios.get(`${ROUTER_URL}/nodogsplash_auth`, {
      params: { mac }
    });
    console.log("MAC authorized:", mac);
  } catch (err) {
    console.error("Router auth failed:", err.message);
  }
}

export async function blockMac(mac) {
  try {
    await axios.get(`${ROUTER_URL}/nodogsplash_deauth`, {
      params: { mac }
    });
    console.log("MAC deauthorized:", mac);
  } catch (err) {
    console.error("Router deauth failed:", err.message);
  }
}
