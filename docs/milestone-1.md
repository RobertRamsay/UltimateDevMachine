# Milestone 1 — first implementation slice

## Implemented

- GameMaker LTS shell with three target profiles: C64 Ultimate, Commodore 77, VICE.
- Recorded CPU preference, explicitly distinct from the unchanged hardware speed.
- GML PRG builder with labels, absolute fixups, relative branch-range checks and
  scratch-memory overlap rejection. The CLI compiles the same relocation recipe.
- BASIC `SYS 2061` startup at `$0801`, with native code beginning at `$080D`.
- Read-only UCI signature check accepting `$C9` and IRQ-active `$49`. An interface
  signature is not board/firmware identification; absence can mean disabled UCI.
- Optional REU presence/transfer diagnostic with two complementary patterns,
  original-page backup, restoration and restoration readback.
- Scripts for VICE launch and Ultimate REST information/PRG transfer.

## Build and use

Open `UltimateDevMachine.yyp` in GameMaker LTS and run it. Select 1, 2 or 3, then
press B. The displayed path points to the PRG in the app's normal save directory;
a JSON target manifest sits beside it. S toggles the preferred maximum versus
keeping the current speed. This preference is metadata only in version 0.1.
All targets currently generate identical diagnostic machine code.

Alternatively, run `node tools/build.mjs` from the repository. This regenerates
`datafiles/foundation.json`, `build/foundation.prg` and its symbol map. When changing
`tools/foundation.mjs`, regenerate the included JSON before rebuilding GameMaker.

`tools/Build-Editor.ps1` compiles with the installed LTS runtime. Its default paths
match the development machine; override `RuntimePath` and `ProjectTool` elsewhere.

### VICE

Run `tools/Run-Vice.ps1 -VicePath <path-to-x64sc.exe>`. Configure the REU in VICE's
settings first. Test with it disabled and enabled. With no UCI emulation, the
signature check should report unavailable. Load/run manually if autostart is
disabled by local emulator settings. Press R in the C64 window for the transfer
test, or another key to return to BASIC without REU writes.

### Ultimate hardware

Use a dedicated test session with BASIC/KERNAL ROMs mapped, no active cartridge
software, no concurrent REU user and REU enabled for the positive test. Enable
Command Interface to test the UCI signature. Start with normal CPU speed; repeat
at firmware-supported settings selected in the device menu. The PRG never writes
turbo registers.

Copy the PRG to USB storage and select Run in the Ultimate file browser, or use
PowerShell 7 with `tools/Run-Ultimate.ps1 -DeviceUrl http://<device-address>/`.
The script queries `/v1/info`, then uploads and runs the PRG; running it resets the
C64. Add `-InfoOnly` for identification without a reset or upload. For a configured
network password, supply `ULTIMATE_NETWORK_PASSWORD` through the environment.
No password is stored in the project or printed by the script.

The transfer script checks the API's JSON errors as well as HTTP failures. It is
not a substitute for reading the program's on-device results. No physical device
address was supplied, so hardware transfer has not been exercised.

## Memory and diagnostic limits

The diagnostic owns C64 RAM `$3000-$330A`: pattern buffer, original REU page,
restoration-check buffer, result byte and saved REU registers. REU offsets
`$000000-$0000FF` are temporarily overwritten after backup. Only run this as a
standalone diagnostic, not over a resident application. A hardware fault or reset
can prevent restoration; the program reports detected restoration failures.

It masks IRQ during transfers and restores processor flags and REU registers
`$DF02-$DF0A`. Status reads acknowledge completion flags. It does not preserve
pending REU commands/interrupt status or claim to restore a running application.
It uses immediate DMA with completion-bit checks, without an unbounded polling
loop. Physical DMA stalls cannot be timed out by the halted 6510 itself.

The register readback probe is only preliminary. A pass requires both 256-byte
patterns and the restoration check. A pass establishes a tested page, not total
REU capacity, timing behaviour or Ultimate model identity.

## Validation on 2026-09-29

- GameMaker LTS runtime `2026.0.0.23`: project load/link and Windows VM compile pass.
- Compiled GameMaker runner: GML assembler smoke test generated a 992-byte PRG.
  Its SHA-256 matches the CLI output byte for byte.
- Ten Node tests pass. These execute the generated opcodes in a bounded
  instruction-level harness with simulated KERNAL/REU behaviour. Cases include
  absent REU/UCI, user skip, IRQ-active UCI signature, transfer corruption, missing
  completion, restoration failure and assembler validation.
- PowerShell helper scripts pass syntax parsing; live transfer and VICE launch
  are untested. No cycle-accurate emulator or physical-hardware pass is claimed.
- Interactive shell visual inspection remains pending; compilation is not a UI test.

## Remaining before Milestone 1 completion

1. Verify model/core/firmware identification and translate it into capabilities.
2. Implement turbo configuration only for documented, identified profiles; validate
   selection, register availability and restoration on each supported board.
3. Implement bounded REU capacity/alias testing and boundary transfers.
4. Run baseline tests in actual VICE, then record device results and timing on
   C64 Ultimate. Validate Commodore 77 controls and hardware separately.
5. Bring in reusable C64 Dev Machine assembler/build infrastructure when available.

## Primary technical references

- [UCI registers](https://1541u-documentation.readthedocs.io/en/latest/uci/core_uci_architecture.html)
- [Turbo modes and differing speed tables](https://1541u-documentation.readthedocs.io/en/latest/config/turbo_mode.html)
- [Ultimate REST interface](https://1541u-documentation.readthedocs.io/en/latest/api/api_calls.html)
- [VICE REU implementation and register definitions](https://github.com/VICE-Team/svn-mirror/blob/main/vice/src/c64/cart/reu.c)
- [VICE machine-specific manual](https://vice-emu.sourceforge.io/vice_7.html)

The REU implementation reference establishes register roles, immediate command
bits, directions and completion semantics. No VICE source code is copied into
this project. Firmware/hardware behaviour still requires separate validation.
