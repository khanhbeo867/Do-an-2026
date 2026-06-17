# Costume Rental

Hệ thống web quản lý cho thuê trang phục và đạo cụ, bao gồm các nghiệp vụ quản lý danh mục, nhập kho, lập phiếu mượn/thuê, hoàn trả, xử lý phạt, lập hóa đơn và thống kê vận hành.

## 1. Mục tiêu dự án

- Chuẩn hóa quy trình vận hành kho trang phục và đạo cụ.
- Theo dõi vòng đời từng SKU từ lúc nhập kho đến lúc hoàn trả.
- Quản trị nghiệp vụ thuê/mượn với các trạng thái rõ ràng.
- Hỗ trợ đối soát tài chính qua phiếu phạt và hóa đơn.
- Cung cấp số liệu thống kê phục vụ điều phối hàng ngày.

## 2. Công nghệ sử dụng

### 2.1 Frontend

- React 19
- TypeScript
- Vite
- TanStack Router
- TanStack React Query
- TanStack React Form
- Tailwind CSS
- Zustand
- TipTap

### 2.2 Backend giả lập cho phát triển

- Bun runtime
- Express
- json-server (lowdb)
- express-fileupload

## 3. Kiến trúc tổng quan

Hệ thống gồm hai phần chạy song song:

- Frontend (port 5000): ứng dụng giao diện quản trị.
- Mock API server (port 8000): phục vụ REST API và dữ liệu giả lập từ file cơ sở dữ liệu.

Luồng gọi API:

1. Frontend gọi qua lớp request chung ở src/lib/request.ts.
2. URL mặc định được ghép với prefix /api.
3. JWT token được đính kèm qua header Authorization: Bearer <token>.
4. Nếu nhận 401, frontend tự gọi /api/auth/refresh để lấy token mới.

## 4. Cấu trúc thư mục quan trọng

```text
costume-rental/
|-- mock/
|   |-- db.json                     # Dữ liệu giả lập
|   |-- db.schema.json              # Định nghĩa schema dữ liệu
|   |-- index.ts                    # Entry mock server
|   |-- lib.ts                      # Query helpers (_expand, _embed, filter, pagination)
|   |-- middleware.ts               # JWT middleware
|   |-- routes/                     # Các route nghiệp vụ
|       |-- auth.routes.ts
|       |-- user.route.ts
|       |-- employee.route.ts
|       |-- warehouse.route.ts
|       |-- category.route.ts
|       |-- costume.route.ts
|       |-- equipment-props.route.ts
|       |-- inventory.route.ts
|       |-- loan.route.ts
|       |-- return.route.ts
|       |-- billing.route.ts
|       |-- statistics.route.ts
|       |-- images-gallery.route.ts
|
|-- src/
|   |-- apis/                       # RPC + schema + types theo từng module
|   |-- routes/                     # Các trang theo TanStack Router
|   |-- components/                 # UI components
|       |-- animated                  # Animation component
|       |-- blocks                    # Thành phần của mỗi page
|       |-- errors                    # Hiển thị lỗi
|       |-- forms                     # Xử lý form
|       |-- layouts                   # Thành phần khung giao diện người dùng
|       |-- shared                    # Thành phần dùng chung trong toàn bộ dự án (có chứa logic xử lý)
|       |-- ui                        # Thành phần dùng chung toàn bộ dự án
|   |-- middlewares/                # auth/request middleware phía frontend
|   |-- lib/                        # request, utils, helper
|   |-- common/                     # constants, types dùng chung
|
|-- postman/                        # Collection và môi trường Postman
|-- public/                         # Tài nguyên static
|-- vite.config.ts
|-- package.json
```

## 5. Thiết lập môi trường

### 5.1 Yêu cầu

- Bun (khuyến nghị phiên bản mới).
- Node.js tương thích với dự án (phục vụ toolchain nếu cần).

### 5.2 Biến môi trường cần có

Tạo file .env.local với giá trị mẫu:

```env
VITE_NODE_ENV=development
VITE_EXTERNAL_API_URL=http://localhost:8000/api
VITE_BASE_IMAGE_URL=http://localhost:8000/upload
```

Lưu ý backend mock dùng JWT secret từ process env:

```env
JWT_SECRET=your_dev_secret
NODE_ENV=development
```

## 6. Chạy dự án

```bash
# Cài đặt dependencies
bun install

# Terminal 1: chạy mock API server
bun run start

# Terminal 2: chạy frontend
bun run dev
```

Truy cập:

- Frontend: http://localhost:5000
- Mock API: http://localhost:8000

## 7. Scripts chính

```bash
# Development
bun dev
bun start:dev

# Quality
bun run lint
bun run format
bun run typecheck

# Testing
bun run test

# Build
bun run build
bun run preview
```

## 8. Mô hình dữ liệu và nghiệp vụ

### 8.1 Thực thể chính

- users: tài khoản đăng nhập, role, liên kết employee.
- employees: hồ sơ nhân sự vận hành.
- warehouses: kho theo loại COSTUME hoặc EQUIPMENT_PROPS.
- categories: danh mục theo loại sản phẩm.
- costumes, equipment_props: master data sản phẩm cho thuê.
- inventory: bản ghi từng SKU vật lý, trạng thái tồn kho.
- loan_forms, loan_form_items: phiếu mượn/thuê và danh sách SKU.
- return_forms, return_form_items: phiếu trả và tình trạng khi trả.
- penalty_forms: phiếu phạt.
- invoices: hóa đơn thanh toán.

### 8.2 Trạng thái kho

- AVAILABLE: sẵn sàng cho thuê/mượn.
- RENTED: đã được checkout.
- MAINTENANCE: cần xử lý sau khi trả.
- DISPOSED: ngừng sử dụng.

### 8.3 Luồng nghiệp vụ mượn/thuê

1. Tạo loan form với method BORROW hoặc RENT.
2. Nếu là RENT:
   - Hệ thống tính tổng giá trị đồ để xác định mức cọc yêu cầu.
   - Trạng thái ban đầu có thể là DEPOSIT_PENDING.
3. Xác nhận cọc (confirm-deposit) để chuyển sang BORROWING.
4. Checkout để đánh dấu SKU trong inventory sang RENTED.
5. Khi trả hàng, tạo return form và kiểm tra condition từng SKU.
6. Complete return:
   - SKU condition tốt chuyển AVAILABLE.
   - SKU condition không tốt chuyển MAINTENANCE.
   - Loan form tự chuyển RETURNED khi tất cả item đã trả.

### 8.4 Luồng tài chính

1. Có thể tạo penalty form từ return form.
2. Tạo invoice cho khoản thuê/phạt.
3. Khi thanh toán invoice, trạng thái invoice chuyển PAID.
4. Nếu invoice liên kết penalty form, penalty cũng được cập nhật PAID.

## 9. Danh sách API chính

Lưu ý: tất cả endpoint bên dưới đều có prefix /api.

### 9.1 Xác thực

- POST /auth/login
- POST /auth/logout
- GET /auth/refresh
- GET /auth/me

### 9.2 Quản trị người dùng và nhân sự

- users: GET /users, GET /users/:id, POST /users, PATCH /users/:id, DELETE /users/:id
- employees: GET /employees, GET /employees/:id, POST /employees, PATCH /employees/:id, DELETE /employees/:id

### 9.3 Danh mục và sản phẩm

- categories: GET/POST/PATCH/DELETE /categories
- costumes: GET/POST/PATCH/DELETE /costumes
- equipment-props: GET/POST/PATCH/DELETE /equipment-props
- images-gallery:
  - GET /images-gallery
  - GET /images-gallery/:id
  - POST /images-gallery/upload
  - PATCH /images-gallery/:id
  - DELETE /images-gallery/:id
  - GET /storage/images-gallery/:folder/:fileName

### 9.4 Kho

- GET /inventory/costumes
- GET /inventory/props
- POST /inventory/import
- PATCH /inventory/status/:sku
- DELETE /inventory/delete/:sku

### 9.5 Nghiệp vụ thuê trả

- loan forms:
  - GET /loan-forms
  - GET /loan-forms/:id
  - POST /loan-forms
  - PATCH /loan-forms/:id
  - DELETE /loan-forms/:id
  - POST /loan-forms/:id/items
  - POST /loan-forms/:id/checkout
  - POST /loan-forms/:id/cancel
  - POST /loan-forms/:id/confirm-deposit
- return forms:
  - GET /return-forms
  - GET /return-forms/:id
  - POST /return-forms
  - PATCH /return-forms/:id
  - DELETE /return-forms/:id
  - POST /return-forms/:id/items
  - PATCH /return-form-items/:id
  - DELETE /return-form-items/:id
  - POST /return-forms/:id/inspect
  - POST /return-forms/:id/complete

### 9.6 Tài chính và thống kê

- penalty forms:
  - GET /penalty-forms
  - GET /penalty-forms/:id
  - POST /penalty-forms
  - PATCH /penalty-forms/:id
  - DELETE /penalty-forms/:id
  - POST /penalty-forms/:id/issue
  - POST /penalty-forms/:id/pay
- invoices:
  - GET /invoices
  - GET /invoices/:id
  - POST /invoices
  - PATCH /invoices/:id
  - DELETE /invoices/:id
  - POST /invoices/:id/issue
  - POST /invoices/:id/pay
- statistics:
  - GET /statistics?range=today|7d|30d|month&method=ALL|BORROW|RENT

## 10. Quy ước query filter của mock API

Mock API hỗ trợ một số cú pháp filter quan trọng:

- field:eq=value
- field:ne=value
- field:gt=value
- field:gte=value
- field:lt=value
- field:lte=value
- field:in=a,b,c
- field:contains=text
- field:startsWith=text
- field:endsWith=text
- \_expand=relation
- \_embed=relation
- \_sort=field&\_order=asc|desc
- \_page=1&\_per_page=10
- \_where={...} cho điều kiện phức tạp dạng JSON

## 11. Trạng thái nghiệp vụ chính

### 11.1 Loan form

- DEPOSIT_PENDING
- BORROWING
- RETURNED
- CANCELED

### 11.2 Return form

- INSPECTED
- RETURNED

### 11.3 Penalty form

- ISSUED
- PAID

### 11.4 Invoice

- ISSUED
- PAID

## 12. Kiểm thử và chất lượng

```bash
# Type check
bun run typecheck

# Lint
bun run lint

# Unit tests
bun run test
```

Khuyến nghị chạy tuần tự typecheck -> lint -> test trước khi merge.

## 13. Troubleshooting

### 13.1 Cổng 5000 hoặc 8000 bị chiếm

```bash
netstat -ano | findstr :5000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### 13.2 Lỗi dependency

```bash
rm -rf node_modules bun.lockb
bun install
```

### 13.3 Lỗi xác thực JWT

- Kiểm tra biến môi trường JWT_SECRET đã có giá trị.
- Đảm bảo access token được gửi đúng header Authorization.
- Kiểm tra API refresh token tại /api/auth/refresh.

### 13.4 Upload ảnh lỗi

- Kiểm tra mime type: png, jpg, jpeg, webp.
- Kiểm tra dung lượng từng file <= 5MB.

## 14. Ghi chú vận hành

- Dữ liệu phát triển được lưu tại mock/db.json.
- Schema tham chiếu tại mock/db.schema.json.
- Khi thay đổi route hoặc schema, cần cập nhật đồng thời:
  - route trong mock/routes
  - rpc trong src/apis/\*/rpc
  - schema validate trong src/apis/\*/schemas

## 15. Hướng phát triển tiếp theo

- Đồng bộ naming endpoint giữa frontend RPC và backend mock cho tất cả module.
- Bổ sung tài liệu OpenAPI chính thức.
- Bổ sung integration tests cho các luồng loan -> return -> billing.

---

Tài liệu này phản ánh cấu trúc và nghiệp vụ theo code hiện tại của dự án.
