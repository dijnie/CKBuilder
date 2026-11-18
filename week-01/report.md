# Week 1 Report · CKBuilders

Ngày thực hành trong workspace: 18/11/2026 (UTC). Báo cáo ghi nhận lần chạy công cụ trong workspace và để trống phần phản ánh cá nhân.

## Tóm tắt kiến thức

- **CKB và transaction.** Trạng thái hiện tại gồm các live Cell. Transaction tham chiếu các Cell đầu vào để tiêu thụ và tạo các Cell đầu ra mới. Cell đã bị tiêu thụ không thể làm đầu vào cho một giao dịch khác.
- **Cell Model.** Một Cell gồm `capacity`, `lock`, `type` (tùy chọn) và `data`. Capacity phải đủ cho số byte mà các trường chiếm. 1 CKB tương ứng với 1 byte dung lượng và bằng 100.000.000 shannon.
- **Script và CKB-VM.** Lock Script kiểm tra quyền tiêu thụ Cell. Type Script kiểm tra quy tắc của nhóm Cell đầu vào và đầu ra có cùng Type Script. CKB-VM thực thi mã RISC-V để xác minh giao dịch.
- **Triển khai.** Binary của Script được lưu trong dữ liệu của một Cell. Giao dịch dùng Script có thể đưa OutPoint của Cell chứa mã vào `cell_deps`. Deploy và thực thi Script là hai bước kiểm tra riêng trong bài thực hành này.

Tài liệu Academy đã đối chiếu từ mã nguồn khóa **CKB Fundamentals**. [Lesson 1 · What is CKB?](https://github.com/Flouse/ckb-academy/blob/370f31f5dc432c5a4b07c81a7731e292235bc420/site/src/content/courses/basic-theory/chapter_1.mdx) · [Lesson 2 · What does a cell contain?](https://github.com/Flouse/ckb-academy/blob/370f31f5dc432c5a4b07c81a7731e292235bc420/site/src/content/courses/basic-theory/chapter_2.mdx) · [Nervos Quick Start](https://docs.nervos.org/docs/getting-started/quick-start)

## Kết quả thực hành

| Kiểm tra | Kết quả |
| --- | --- |
| OffCKB 0.4.13 | Node ở `127.0.0.1:8114`, RPC proxy ở `127.0.0.1:28114` |
| Script | `always-success`, ELF RISC-V 936 byte |
| Thực thi bằng ckb-debugger 1.1.2 | `Run result: 0`, 595 cycles |
| Transaction deploy | `0x98bf5d14c0138561b1c8e42c4260500dd15ebf9da8314a9a42067c80761a1b22`, trạng thái `committed` |
| OutPoint | Output index `0` của transaction trên |
| Kiểm tra Cell qua RPC | `live`, dữ liệu trùng khớp từng byte với binary đã build |

[Log khởi động node](evidence/offckb-running.txt) · [Log deploy](evidence/contract-deployed.txt) · [Log debugger](evidence/contract-executed.txt) · [Xác minh RPC](evidence/rpc-verification.txt) · [Thông tin Script](deployment/scripts.json)

### Ảnh minh chứng

Ảnh chụp cửa sổ terminal hiển thị lại log gốc của lần chạy.

- [OffCKB devnet đang chạy](screenshots/offckb-running.png)
- [Deploy đã xác nhận và kết quả chạy Script trong debugger](screenshots/contract-deployed.png)

## Khó khăn và cách xử lý

Lần deploy đầu dừng ở bước xác nhận vì lệnh được chạy qua một pipeline ghi log. Lần chạy tiếp theo dùng `--yes` với `--network devnet` và đợi giao dịch được xác nhận. Sau đó, RPC xác minh Cell chứa binary, còn debugger chạy binary riêng để kiểm tra mã trả về.

## Phản ánh cá nhân

<!-- Sau khi tự thực hành, ghi lại thời gian thực tế, điều bạn hiểu rõ hơn và một khó khăn bạn trực tiếp gặp. -->

## Trạng thái checklist

- [x] Chuẩn bị ghi chú về CKB, Cell Model, CKB-VM, Script và transaction.
- [ ] Đọc Lesson 1 và 2, tự ghi lại điều học được.
- [x] Cài OffCKB và kiểm tra devnet qua RPC.
- [x] Deploy Script thử nghiệm và xác minh giao dịch.
- [x] Lưu ảnh terminal và log thực tế.
- [ ] Đăng repository và dev log lên GitHub sau khi kết nối tài khoản.
- [x] Soạn báo cáo kỹ thuật Week 1 trong workspace.

## Kế hoạch tuần 2

Đọc tiếp phần Script Basics, xem một transaction qua RPC để phân biệt input, output và `cell_deps`, rồi thử viết một Script từ chối dữ liệu đầu vào sai định dạng. [Nervos Quick Start và lộ trình học Script](https://docs.nervos.org/docs/getting-started/quick-start)
