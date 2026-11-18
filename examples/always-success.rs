#![no_std]
#![no_main]

use core::{arch::global_asm, panic::PanicInfo};

// CKB-VM uses the RISC-V exit syscall (93). Put the success code in a0.
global_asm!(
    ".global _start",
    "_start:",
    "li a0, 0",
    "li a7, 93",
    "ecall",
);

#[panic_handler]
fn panic(_: &PanicInfo<'_>) -> ! {
    loop {
        core::hint::spin_loop();
    }
}
