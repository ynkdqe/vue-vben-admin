# Hướng dẫn dành cho GitHub Copilot trong kho `vue-vben-admin`

Các hướng dẫn này giúp Copilot hiểu kiến trúc monorepo, quy ước và cách build/test/chạy dự án để giảm lỗi và tăng tốc khi thực hiện thay đổi. Hướng dẫn áp dụng cho toàn bộ kho.

## Tổng quan dự án
- Monorepo dùng pnpm workspaces và Turbo.
- Ứng dụng chính: `apps/web-antd` (Vue 3, Vite, TypeScript, Ant Design Vue, Pinia, Vue Router, i18n Vben).
- Backend mock phục vụ phát triển: `apps/backend-mock` (Nitro/Unjs).
- Thư mục `packages` chứa thư viện dùng chung (effects, stores, utils, styles, locales, @core...).
- Ưu tiên code theo chuẩn TypeScript, Composition API, và cấu trúc mô-đun của Vben.

## Công cụ & phiên bản
- Node.js >= 18
- pnpm >= 8
- Vite 5, Vue 3, TypeScript

## Cách cài đặt & chạy
Luôn thao tác ở thư mục gốc monorepo và dùng pnpm (không dùng npm).
- Cài đặt: `pnpm -w install`
- Dev app Ant Design: `pnpm --filter @vben/web-antd dev`
- Build app Ant Design: `pnpm --filter @vben/web-antd build`
- Preview build: `pnpm --filter @vben/web-antd preview`
- Dọn dẹp: `node scripts/clean.mjs` (thêm `--del-lock` nếu cần xoá lockfile)

Cấu hình API:
- Base URL API lấy qua `useAppConfig(import.meta.env, import.meta.env.PROD)` và `.env` trong `apps/web-antd`.
- Dev proxy: `apps/web-antd/vite.config.mts` (đường dẫn `/api` sẽ được proxy theo `target`).

## Kiểm thử, lint, typecheck
- Lint: `pnpm lint` (ESLint/Stylelint trong `internal/lint-configs`)
- Typecheck: `pnpm type-check` (vue-tsc)
- Unit test: `pnpm test` hoặc `pnpm vitest` (xem `vitest.workspace.ts`/`vitest.config.ts`)
- Trước khi mở PR, đảm bảo build/lint/type đều pass.

## Quy ước commit & hook
- Commit theo Conventional Commits (commitlint + lefthook). Ví dụ:
  - `feat: add employee list page`
  - `fix: handle 401 refresh`
  - `chore(apps): remove web-ele and web-naive`

## Kiến trúc & bố cục chính
- Ứng dụng web: `apps/web-antd/`
  - `src/api/request.ts`: khởi tạo `RequestClient`, interceptor:
    - Mặc định parse `{ success, data, message, ... }` (qua `defaultResponseInterceptor`).
    - 401 -> tự động refresh token (`authenticateResponseInterceptor`) hoặc logout.
  - `src/router/`: định tuyến & guard; module HRMS có `/hrms/employee`.
  - `src/views/`: trang Vue; dùng Ant Design Vue theo kiểu local registration trong `<script setup>`.
- API mô-đun trong `apps/web-antd/src/api/**`, export qua `src/api/core/index.ts`.
- `packages/effects/request`: `RequestClient`, types & preset interceptors.

## Hướng dẫn thực thi tác vụ thường gặp
- Thêm API mới:
  - Tạo file dưới `apps/web-antd/src/api/<domain>/...`, dùng `requestClient` (kế thừa Authorization, i18n, 401 handling).
  - Nếu cần toàn bộ envelope (paging), đặt `responseReturn: 'body'` và tự normalize (ví dụ chuẩn hoá sang `{ items, total }`).
- Thêm trang mới:
  - Tạo view trong `apps/web-antd/src/views/...` và thêm route trong `apps/web-antd/src/router/routes/modules/*.ts`.
  - Với Ant Design Vue: import component theo PascalCase trong `<script setup>` và ánh xạ subcomponents (ví dụ `const AFormItem = AForm.Item`).
- 401/Refresh token:
  - Bật `enableRefreshToken` trong `apps/web-antd/src/api/request.ts`.
  - `doRefreshToken` gọi `refreshTokenApi`, sau đó retry request theo queue có sẵn.

## Quy tắc sinh mã & chỉnh sửa dành cho Copilot
- Luôn dùng `requestClient` thay vì axios thô để đảm bảo header & interceptor hoạt động.
- List API phân trang (backend trả `{ current, pageSize, total, success, data }`): sử dụng `responseReturn: 'body'` và normalize đầu ra cho table.
- Không đăng ký Ant Design Vue toàn cục; import theo-component để tối ưu bundle.
- Tôn trọng alias import (`#/api/request`, `#/store`, `@vben/*`).
- Không dùng `npm`; chỉ dùng `pnpm` tại root.
- Khi thay đổi public API của package, cập nhật types và `index.ts` export tương ứng.

## Kiểm tra trước khi mở PR
- Build & preview chạy OK cho `apps/web-antd`.
- Lint/typecheck pass.
- Không thêm dependency không cần thiết; nếu thêm, cài ở root bằng `pnpm` và commit lockfile.
- Thay đổi router hoặc API: cập nhật mô tả PR ngắn gọn.

## Thông tin bổ sung
- Clean script: `scripts/clean.mjs` xoá thư mục tạm (`node_modules`, `dist`, `.turbo`, ...).
- Docker: `scripts/deploy/build-local-docker-image.sh` build image local (Linux/macOS hoặc Windows qua WSL2).

## Quy tắc Cho Tương Tác (Ask / FixBug / Agent / Debug)
- Luôn trả lời bằng tiếng Việt
- Nếu thiếu thông tin: nêu rõ cần file / log nào
- Khi fix: mô tả ngắn gọn nguyên nhân + hướng sửa
- Khi phân tích lại: liệt kê giả thuyết theo mức độ ưu tiên
- Không tự ý xóa logic nghiệp vụ đang dùng (tìm tham chiếu trước)
- Với thay đổi breaking: cảnh báo và đề xuất migration / backward compat

> Copilot: Hãy ưu tiên tuân theo hướng dẫn này; chỉ tìm kiếm trong repo khi thông tin thiếu hoặc không chính xác. Khi thay đổi cấu hình lõi (interceptor, Vite), hãy cập nhật file này nếu cần.
