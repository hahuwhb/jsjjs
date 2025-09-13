const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

// === URL WebSocket bạn đưa ===
const WSS_URL = "wss://websocket.azhkthg1.net/websocket?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJnZW5kZXIiOjAsImNhblZpZXdTdGF0IjpmYWxzZSwiZGlzcGxheU5hbWUiOiJoZWxsb2tpZXRkZXB6YWkiLCJib3QiOjAsImlzTWVyY2hhbnQiOmZhbHNlLCJ2ZXJpZmllZEJhbmtBY2NvdW50Ijp0cnVlLCJwbGF5RXZlbnRMb2JieSI6ZmFsc2UsImN1c3RvbWVySWQiOjI2MzE1MDI1MiwiYWZmSWQiOiIwYjA4ZDA0YjI1YmNkMGFkNDQ4NGMwZjlkYmQ1NmM0ZSIsImJhbm5lZCI6ZmFsc2UsImJyYW5kIjoic3VuLndpbiIsInRpbWVzdGFtcCI6MTc1Nzc2NzEwNjI0NCwibG9ja0dhbWVzIjpbXSwiYW1vdW50IjowLCJsb2NrQ2hhdCI6ZmFsc2UsInBob25lVmVyaWZpZWQiOnRydWUsImlwQWRkcmVzcyI6IjI0MDI6ODAwOjYyY2Q6YjRkMTo4YzY0OmEzYzk6MTJiZjpjMTlhIiwibXV0ZSI6ZmFsc2UsImF2YXRhciI6Imh0dHBzOi8vaW1hZ2VzLnN3aW5zaG9wLm5ldC9pbWFnZXMvYXZhdGFyL2F2YXRhcl8wOS5wbmciLCJwbGF0Zm9ybUlkIjoxLCJ1c2VySWQiOiJjZGJhZjU5OC1lNGVmLTQ3ZjgtYjRhNi1hNDg4MTA5OGRiODYiLCJyZWdUaW1lIjoxNzQ5MTk0MTM2MTY1LCJwaG9uZSI6Ijg0MzY5ODIzODAwIiwiZGVwb3NpdCI6dHJ1ZSwidXNlcm5hbWUiOiJTQ19oZWxsb2tpZXRuZTIxMiJ9.ObqvJUUyS_yUN6VtK8-6NS5iV2cK5cGEMmrAFnzUOaI";

// === Biến lưu lịch sử ===
let historyData = []; // lưu nhiều phiên
let ws = null;
let pingInterval = null;
let reconnectTimeout = null;
let isManuallyClosed = false;

// === Kết nối WebSocket ===
function connectWebSocket() {
  if (ws) {
    isManuallyClosed = true;
    ws.close();
  }
  isManuallyClosed = false;

  ws = new WebSocket(WSS_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Origin": "https://play.sun.win"
    }
  });

  ws.on('open', () => {
    console.log('[✅] WebSocket kết nối');

    const messagesToSend = [
      [1, "MiniGame", "SC_dsucac", "binhsex", {
        "info": "{\"ipAddress\":\"\",\"userId\":\"\",\"username\":\"\",\"timestamp\":,\"refreshToken\":\"\"}",
        "signature": ""
      }],
      [6, "MiniGame", "taixiuPlugin", { cmd: 1005 }],
      [6, "MiniGame", "lobbyPlugin", { cmd: 10001 }]
    ];

    messagesToSend.forEach((msg, i) => {
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(msg));
        }
      }, i * 600);
    });

    pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.ping();
    }, 15000);
  });

  ws.on('pong', () => console.log('[📶] Ping OK'));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (Array.isArray(data) && typeof data[1] === 'object') {
        const cmd = data[1].cmd;

        if (cmd === 1003 && data[1].gBB) {
          const { d1, d2, d3 } = data[1];
          const total = d1 + d2 + d3;
          const result = total > 10 ? "Tài" : "Xỉu";

          const record = {
            Phien: data[1].sid,
            Xuc_xac_1: d1,
            Xuc_xac_2: d2,
            Xuc_xac_3: d3,
            Tong: total,
            Ket_qua: result
          };

          historyData.unshift(record); // thêm vào đầu
          if (historyData.length > 50) historyData.pop(); // chỉ giữ 50 phiên gần nhất

          console.log("Phiên mới:", record);
        }
      }
    } catch (e) {
      console.error('[Lỗi]:', e.message);
    }
  });

  ws.on('close', () => {
    console.log('[🔌] WebSocket ngắt. Đang kết nối lại...');
    clearInterval(pingInterval);
    if (!isManuallyClosed) {
      reconnectTimeout = setTimeout(connectWebSocket, 2500);
    }
  });

  ws.on('error', (err) => console.error('[❌] WebSocket lỗi:', err.message));
}

// === API ===
app.get('/taixiu', (req, res) => {
  res.json(historyData);
});

app.get('/', (req, res) => {
  res.send(`
    <h2>🎯 API lịch sử Sunwin Tài Xỉu</h2>
    <p><a href="/taixiu">Xem lịch sử JSON</a></p>
  `);
});

// === Khởi động server ===
app.listen(PORT, () => {
  console.log(`[🌐] Server chạy tại http://localhost:${PORT}`);
  connectWebSocket();
});