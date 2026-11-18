# CKBuilders · Week 1

Thực hành Cell Model, CKB-VM và quy trình triển khai CKB Script trên OffCKB devnet.

- [Week 1 Report](week-01/report.md)
- [Mã nguồn Script Always Success](examples/always-success.rs)
- [Ảnh terminal](week-01/screenshots/)
- [Nhật ký terminal và kết quả RPC](week-01/evidence/)
- [Thông tin triển khai của OffCKB](week-01/deployment/scripts.json)

## Chạy lại bài thực hành

Từ thư mục gốc, cài OffCKB và chạy devnet trong terminal thứ nhất. Lần chạy ghi trong báo cáo dùng Node.js 26.13.0, OffCKB 0.4.13 và rustc 1.99.1.

```bash
npm install -g @offckb/cli@0.4.13
offckb node
```

Trong terminal thứ hai, biên dịch Script, chạy trong debugger rồi deploy vào devnet.

```bash
rustup target add riscv64imac-unknown-none-elf
mkdir -p build
rustc --target riscv64imac-unknown-none-elf -C opt-level=s -C strip=symbols \
  -o build/always-success examples/always-success.rs
offckb install ckb-debugger
ckb-debugger --bin build/always-success
offckb deploy --network devnet --target build/always-success --output build/deployment
```

Đọc `build/deployment/scripts.json` sau khi thấy `tx committed.` để lấy OutPoint của lần chạy mới. Script luôn trả về thành công, chỉ dùng làm ví dụ trên devnet.

[Nervos Quick Start](https://docs.nervos.org/docs/getting-started/quick-start) · [Hướng dẫn OffCKB](https://docs.nervos.org/docs/sdk-and-devtool/offckb)
