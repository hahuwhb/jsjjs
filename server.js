import websocket
import json
import ssl
import time

# ==============================
# Config
# ==============================
TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJnZW5kZXIiOjAsImNhblZpZXdTdGF0IjpmYWxzZSwiZGlzcGxheU5hbWUiOiJoZWxsb2tpZXRkZXB6YWkiLCJib3QiOjAsImlzTWVyY2hhbnQiOmZhbHNlLCJ2ZXJpZmllZEJhbmtBY2NvdW50Ijp0cnVlLCJwbGF5RXZlbnRMb2JieSI6ZmFsc2UsImN1c3RvbWVySWQiOjI2MzE1MDI1MiwiYWZmSWQiOiIwYjA4ZDA0YjI1YmNkMGFkNDQ4NGMwZjlkYmQ1NmM0ZSIsImJhbm5lZCI6ZmFsc2UsImJyYW5kIjoic3VuLndpbiIsInRpbWVzdGFtcCI6MTc1Nzc2NzEwNjI0NCwibG9ja0dhbWVzIjpbXSwiYW1vdW50IjowLCJsb2NrQ2hhdCI6ZmFsc2UsInBob25lVmVyaWZpZWQiOnRydWUsImlwQWRkcmVzcyI6IjI0MDI6ODAwOjYyY2Q6YjRkMTo4YzY0OmEzYzk6MTJiZjpjMTlhIiwibXV0ZSI6ZmFsc2UsImF2YXRhciI6Imh0dHBzOi8vaW1hZ2VzLnN3aW5zaG9wLm5ldC9pbWFnZXMvYXZhdGFyL2F2YXRhcl8wOS5wbmciLCJwbGF0Zm9ybUlkIjoxLCJ1c2VySWQiOiJjZGJhZjU5OC1lNGVmLTQ3ZjgtYjRhNi1hNDg4MTA5OGRiODYiLCJyZWdUaW1lIjoxNzQ5MTk0MTM2MTY1LCJwaG9uZSI6Ijg0MzY5ODIzODAwIiwiZGVwb3NpdCI6dHJ1ZSwidXNlcm5hbWUiOiJTQ19oZWxsb2tpZXRuZTIxMiJ9.ObqvJUUyS_yUN6VtK8-6NS5iV2cK5cGEMmrAFnzUOaI"  # <-- thay token thật của bạn
# WebSocket URL có token
WSS_URL = f"wss://websocket.azhkthg1.net/websocket?token={TOKEN}"
HISTORY_FILE = "history.json"

# ==============================
# Ghi lịch sử mỗi phiên vào file
# ==============================
def save_history(data):
    try:
        with open(HISTORY_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(data, ensure_ascii=False) + "\n")
    except Exception as e:
        print("⚠️ Lỗi lưu history:", e)

# ==============================
# Xử lý khi nhận message
# ==============================
def on_message(ws, message):
    try:
        # Tin Socket.io thường bắt đầu bằng "42" nếu event
        if message.startswith("42"):
            data = json.loads(message[2:])
            event = data[0]
            payload = data[1]

            if event == "tx_result":  # event Tài Xỉu theo server
                phien = payload.get("phien")
                xx = payload.get("xx", [])

                if phien and len(xx) == 3:
                    tong = sum(xx)
                    ket_qua = "Tài" if tong >= 11 else "Xỉu"

                    ketqua = {
                        "Phien": phien,
                        "Xuc_xac_1": xx[0],
                        "Xuc_xac_2": xx[1],
                        "Xuc_xac_3": xx[2],
                        "Tong": tong,
                        "Ket_qua": ket_qua
                    }

                    # In ra JSON giống ảnh bạn muốn
                    print(json.dumps(ketqua, ensure_ascii=False, indent=4))
                    # Lưu vào file
                    save_history(ketqua)

    except Exception as e:
        print("⚠️ Lỗi xử lý:", e)

def on_error(ws, error):
    print("❌ Lỗi WebSocket:", error)

def on_close(ws, close_status_code, close_msg):
    print("🔒 Đóng kết nối:", close_status_code, close_msg)

def on_open(ws):
    print("✅ Kết nối thành công tới Sunwin với origin web.sunwin.pro")

# ==============================
# Chạy WebSocket có headers -> reconnect nếu cần
# ==============================
def run_ws():
    # Header giống trình duyệt
    headers = [
        f"Origin: https://web.sunwin.pro",  
        "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
        "Host: websocket.azhkthg1.net",
        "Connection: Upgrade",
        "Upgrade: websocket"
    ]

    while True:
        try:
            ws = websocket.WebSocketApp(
                WSS_URL,
                header=headers,
                on_message=on_message,
                on_error=on_error,
                on_close=on_close
            )
            ws.on_open = on_open
            ws.run_forever(sslopt={"cert_reqs": ssl.CERT_NONE})
        except Exception as e:
            print("⚠️ Mất kết nối, sẽ thử lại sau 5s:", e)
            time.sleep(5)

if __name__ == "__main__":
    run_ws()
