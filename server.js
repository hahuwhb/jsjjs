// server.js
const WebSocket = require("ws");

// ==============================
const TOKEN =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJnZW5kZXIiOjAsImNhblZpZXdTdGF0IjpmYWxzZSwiZGlzcGxheU5hbWUiOiJoZWxsb2tpZXRkZXB6YWkiLCJib3QiOjAsImlzTWVyY2hhbnQiOmZhbHNlLCJ2ZXJpZmllZEJhbmtBY2NvdW50Ijp0cnVlLCJwbGF5RXZlbnRMb2JieSI6ZmFsc2UsImN1c3RvbWVySWQiOjI2MzE1MDI1MiwiYWZmSWQiOiIwYjA4ZDA0YjI1YmNkMGFkNDQ4NGMwZjlkYmQ1NmM0ZSIsImJhbm5lZCI6ZmFsc2UsImJyYW5kIjoic3VuLndpbiIsInRpbWVzdGFtcCI6MTc1Nzc2NzEwNjI0NCwibG9ja0dhbWVzIjpbXSwiYW1vdW50IjowLCJsb2NrQ2hhdCI6ZmFsc2UsInBob25lVmVyaWZpZWQiOnRydWUsImlwQWRkcmVzcyI6IjI0MDI6ODAwOjYyY2Q6YjRkMTo4YzY0OmEzYzk6MTJiZjpjMTlhIiwibXV0ZSI6ZmFsc2UsImF2YXRhciI6Imh0dHBzOi8vaW1hZ2VzLnN3aW5zaG9wLm5ldC9pbWFnZXMvYXZhdGFyL2F2YXRhcl8wOS5wbmciLCJwbGF0Zm9ybUlkIjoxLCJ1c2VySWQiOiJjZGJhZjU5OC1lNGVmLTQ3ZjgtYjRhNi1hNDg4MTA5OGRiODYiLCJyZWdUaW1lIjoxNzQ5MTk0MTM2MTY1LCJwaG9uZSI6Ijg0MzY5ODIzODAwIiwiZGVwb3NpdCI6dHJ1ZSwidXNlcm5hbWUiOiJTQ19oZWxsb2tpZXRuZTIxMiJ9.ObqvJUUyS_yUN6VtK8-6NS5iV2cK5cGEMmrAFnzUOaI";

const WSS_URL = `wss://websocket.azhkthg1.net/websocket?token=${TOKEN}`;
// ==============================

const ws = new WebSocket(WSS_URL, {
  headers: {
    "Origin": "https://web.sunwin.pro",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "vi,en-US;q=0.9,en;q=0.8",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    Connection: "Upgrade",
    Upgrade: "websocket",
  },
});

ws.on("open", () => {
  console.log("✅ Đã kết nối thành công WS Sunwin");
});

ws.on("message", (msg) => {
  try {
    const text = msg.toString();
    console.log("📩 RAW:", text);

    if (text.startsWith("42")) {
      const data = JSON.parse(text.slice(2));
      const event = data[0];
      const payload = data[1];

      if (event === "tx_result" && payload?.xx?.length === 3) {
        const tong = payload.xx[0] + payload.xx[1] + payload.xx[2];
        const kq = tong >= 11 ? "Tài" : "Xỉu";
        console.log(
          `🎲 Phiên ${payload.phien}: [${payload.xx.join(", ")}] = ${tong} => ${kq}`
        );
      }
    }
  } catch (err) {
    console.error("⚠️ Parse lỗi:", err);
  }
});

ws.on("close", () => {
  console.log("🔌 Mất kết nối WS");
});

ws.on("error", (err) => {
  console.error("❌ Lỗi:", err.message);
});
