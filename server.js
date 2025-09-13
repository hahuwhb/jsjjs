// server.js
const WebSocket = require("ws");

const TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhbW91bnQiOjAsInVzZXJuYW1lIjoiU0NfYXBpc3Vud2luMTIzIn0.hgrRbSV6vnBwJMg9ZFtbx3rRu9mX_hZMZ_m5gMNhkw0";
const WSS_URL = `wss://websocket.azhkthg1.net/websocket?token=${TOKEN}`;

function connectWS() {
  const ws = new WebSocket(WSS_URL, {
    headers: {
      "Host": "websocket.azhkthg1.net",
      "Origin": "https://web.sunwin.pro",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "vi,en-US;q=0.9,en;q=0.8",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      // 👇 nếu server vẫn 403, cần thêm Cookie lấy từ trình duyệt thật
      // "Cookie": "sid=xxxx; deviceId=xxxx; session=xxxx",
      Connection: "Upgrade",
      Upgrade: "websocket",
    },
  });

  ws.on("open", () => {
    console.log("✅ Đã kết nối Sunwin WS");
  });

  ws.on("message", (msg) => {
    console.log("📩 Data:", msg.toString());
  });

  ws.on("close", () => {
    console.log("🔌 Mất kết nối, thử lại sau 5s...");
    setTimeout(connectWS, 5000);
  });

  ws.on("error", (err) => {
    console.error("❌ Lỗi:", err.message);
  });
}

connectWS();
