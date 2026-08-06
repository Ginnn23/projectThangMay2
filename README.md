# projectThangMay2

## Chạy toàn bộ dự án bằng Docker Compose

```powershell
docker compose up --build -d
docker compose ps
```

- Frontend: http://localhost:5173
- Backend health: http://localhost:5090/health
- PostgreSQL host port: `5433`
- Admin mặc định: `admin` / `Admin@123456`

Xem log:

```powershell
docker compose logs -f
```

Dừng dự án nhưng giữ nguyên database và ảnh upload:

```powershell
docker compose down
```

Muốn tùy chỉnh mật khẩu hoặc port, sao chép `.env.compose.example` thành `.env` rồi sửa giá trị. Không commit file `.env`.
