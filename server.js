// server.js
const express = require("express");
const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const WebSocket = require("ws");
const fs = require("fs");

// ==============================
const PORT = process.env.PORT || 3000;
const TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJnZW5kZXIiOjAsImNhblZpZXdTdGF0IjpmYWxzZSwiZGlzcGxheU5hbWUiOiJoZWxsb2tpZXRkZXB6YWkiLCJib3QiOjAsImlzTWVyY2hhbnQiOmZhbHNlLCJ2ZXJpZmllZEJhbmtBY2NvdW50Ijp0cnVlLCJwbGF5RXZlbnRMb2JieSI6ZmFsc2UsImN1c3RvbWVySWQiOjI2MzE1MDI1MiwiYWZmSWQiOiIwYjA4ZDA0YjI1YmNkMGFkNDQ4NGMwZjlkYmQ1NmM0ZSIsImJhbm5lZCI6ZmFsc2UsImJyYW5kIjoic3VuLndpbiIsInRpbWVzdGFtcCI6MTc1Nzc2NzEwNjI0NCwibG9ja0dhbWVzIjpbXSwiYW1vdW50IjowLCJsb2NrQ2hhdCI6ZmFsc2UsInBob25lVmVyaWZpZWQiOnRydWUsImlwQWRkcmVzcyI6IjI0MDI6ODAwOjYyY2Q6YjRkMTo4YzY0OmEzYzk6MTJiZjpjMTlhIiwibXV0ZSI6ZmFsc2UsImF2YXRhciI6Imh0dHBzOi8vaW1hZ2VzLnN3aW5zaG9wLm5ldC9pbWFnZXMvYXZhdGFyL2F2YXRhcl8wOS5wbmciLCJwbGF0Zm9ybUlkIjoxLCJ1c2VySWQiOiJjZGJhZjU5OC1lNGVmLTQ3ZjgtYjRhNi1hNDg4MTA5OGRiODYiLCJyZWdUaW1lIjoxNzQ5MTk0MTM2MTY1LCJwaG9uZSI6Ijg0MzY5ODIzODAwIiwiZGVwb3NpdCI6dHJ1ZSwidXNlcm5hbWUiOiJTQ19oZWxsb2tpZXRuZTIxMiJ9.ObqvJUUyS_yUN6VtK8-6NS5iV2cK5cGEMmrAFnzUOaI"; // token Sunwin thật
const SUNWIN_WSS = `wss://websocket.azhkthg1.net/websocket?token=${TOKEN}`;
const HISTORY_FILE = "history.json";
// ==============================

function saveHistory(data) {
  try {
    fs.appendFileSync(HISTORY_FILE, JSON.stringify(data) + "\n", "utf8");
  } catch (err) {
    console.error("⚠️ Lỗi lưu:", err);
  }
}

const app = express();
const server = createServer(app);

// Tạo WebSocket server riêng cho client connect vào /api/ws
const wss = new WebSocketServer({ server, path: "/api/ws" });

// Kết nối đến Sunwin WS
let sunwinWS;
function connectSunwin() {
  sunwinWS = new WebSocket(SUNWIN_WSS, {
    headers: {
      Origin: "https://web.sunwin.pro",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
    },
  });

  sunwinWS.on("open", () => {
    console.log("✅ Đã kết nối WS Sunwin");
  });

  sunwinWS.on("message", (msg) => {
    try {
      if (msg.toString().startsWith("42")) {
        const data = JSON.parse(msg.toString().slice(2));
        const event = data[0];
        const payload = data[1];

        if (event === "tx_result") {
          const xx = payload.xx || [];
          if (xx.length === 3) {
            const tong = xx[0] + xx[1] + xx[2];
            const ketqua = {
              Phien: payload.phien,
              Xuc_xac_1: xx[0],
              Xuc_xac_2: xx[1],
              Xuc_xac_3: xx[2],
              Tong: tong,
              Ket_qua: tong >= 11 ? "Tài" : "Xỉu",
            };

            console.log("📩", ketqua);
            saveHistory(ketqua);

            // forward lại cho tất cả client đang connect vào /api/ws
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(ketqua));
              }
            });
          }
        }
      }
    } catch (err) {
      console.error("⚠️ Parse lỗi:", err);
    }
  });

  sunwinWS.on("close", () => {
    console.log("🔒 Mất kết nối Sunwin, thử lại sau 5s...");
    setTimeout(connectSunwin, 5000);
  });

  sunwinWS.on("error", (err) => {
    console.error("❌ Lỗi WS Sunwin:", err.message);
  });
}
connectSunwin();

// Client connect vào server Render
wss.on("connection", (wsClient) => {
  console.log("🤝 Client connect /api/ws");

  wsClient.on("close", () => {
    console.log("👋 Client rời /api/ws");
  });
});

// Endpoint test
app.get("/", (req, res) => {
  res.send("Server proxy WS Sunwin đang chạy!");
});

server.listen(PORT, () => {
  console.log(`🚀 Server chạy tại cổng ${PORT}`);
});
