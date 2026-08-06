# Deploy Hà Hồng Elevator lên Railway

Repo này được deploy thành ba service trong cùng một Railway project:

- `frontend`: React/Vite, root directory `/frontend`
- `backend`: ASP.NET Core, root directory `/backend/HaHongElevator.Api`
- `Postgres`: PostgreSQL do Railway quản lý

## 1. Push cấu hình deploy lên GitHub

Commit và push toàn bộ thay đổi mới trong repo này. Railway chỉ build code đã có trên GitHub.

## 2. Tạo database

Trong Project Canvas, chọn **+ New > Database > PostgreSQL**. Nên giữ tên service là `Postgres` để các reference variable bên dưới dùng đúng tên.

## 3. Cấu hình backend service

Nếu service hiện tại đang trỏ vào cả repo, đổi tên thành `backend`. Trong **Settings**:

- Root Directory: `/backend/HaHongElevator.Api`
- Builder: Dockerfile (Railway sẽ tự nhận `Dockerfile`)
- Healthcheck Path: `/health`
- Không cần Build Command hoặc Start Command riêng

Trong **Variables**, thêm:

```env
ConnectionStrings__DefaultConnection=Host=${{Postgres.PGHOST}};Port=${{Postgres.PGPORT}};Database=${{Postgres.PGDATABASE}};Username=${{Postgres.PGUSER}};Password=${{Postgres.PGPASSWORD}}
Jwt__Key=THAY_BANG_CHUOI_BAO_MAT_NGAU_NHIEN_TOI_THIEU_32_BYTE
Jwt__Issuer=HaHongElevator.Api
Jwt__Audience=HaHongElevator.Client
Jwt__ExpiresMinutes=120
AdminSeed__Username=admin
AdminSeed__Password=THAY_BANG_MAT_KHAU_ADMIN_MANH
AdminSeed__FullName=Quản trị viên
Uploads__Path=/data/uploads
ASPNETCORE_ENVIRONMENT=Production
```

Không tự tạo biến `PORT`; Railway cấp biến này khi chạy. Backend đã được cấu hình để bind đúng cổng đó.

Trong **Settings > Networking**, chọn **Generate Domain**. Ghi lại domain backend.

## 4. Tạo volume lưu ảnh upload

Trên Project Canvas, tạo **Volume**, gắn vào service `backend` và đặt Mount Path là:

```text
/data/uploads
```

Nếu bỏ bước này, ảnh admin upload có thể mất sau một lần redeploy/restart.

## 5. Tạo frontend service

Chọn **+ New > GitHub Repo**, chọn lại chính repo này và đặt tên service là `frontend`. Trong **Settings**:

- Root Directory: `/frontend`
- Builder: Dockerfile
- Healthcheck Path: `/health`
- Không cần Build Command hoặc Start Command riêng

Trong **Variables**, thêm biến sau (tên service backend phải đúng là `backend`):

```env
VITE_API_BASE_URL=https://${{backend.RAILWAY_PUBLIC_DOMAIN}}/api
```

Trong **Settings > Networking**, chọn **Generate Domain** cho frontend.

## 6. Cho phép domain frontend gọi backend

Quay lại service `backend`, trong **Variables** thêm:

```env
Cors__AllowedOrigins__0=https://${{frontend.RAILWAY_PUBLIC_DOMAIN}}
```

Nếu dùng custom domain, thay giá trị bằng domain thật, ví dụ `https://hahongelevator.vn`. Không thêm dấu `/` ở cuối.

Sau khi lưu biến, redeploy cả backend và frontend. Biến `VITE_...` được đóng vào frontend lúc build nên frontend bắt buộc phải build lại khi URL API thay đổi.

## 7. Kiểm tra

Mở lần lượt:

- `https://<backend-domain>/health` — phải trả về JSON `Healthy`
- `https://<frontend-domain>/` — trang chủ phải hiển thị
- `https://<frontend-domain>/du-an` — refresh trực tiếp không được lỗi 404
- `https://<frontend-domain>/admin` — đăng nhập bằng tài khoản seed ở trên
- Upload thử một ảnh, redeploy backend, rồi kiểm tra ảnh vẫn còn

Backend tự chạy toàn bộ Entity Framework migrations trước khi tạo tài khoản admin lần đầu.

## Lỗi thường gặp

- Backend báo `JWT key must be at least 32 bytes`: đặt lại `Jwt__Key` dài hơn.
- Backend báo thiếu `AdminSeed:Password`: thêm `AdminSeed__Password`.
- Frontend vẫn gọi localhost: kiểm tra `VITE_API_BASE_URL`, sau đó redeploy frontend.
- Trình duyệt báo CORS: `Cors__AllowedOrigins__0` phải trùng chính xác origin frontend, gồm `https://` và không có path/dấu `/` cuối.
- Healthcheck backend thất bại: kiểm tra Postgres đã chạy và reference variables dùng đúng tên service `Postgres`.
