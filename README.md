# C64 Ultimate Engine

A GameMaker-based editor and native C64 Ultimate runtime, developed in the
UltimateDevMachine repository. A separate sibling product to C64 Dev Machine.

Author games using scenes, entities, animation and behaviours. Build native
6502/6510 routines, compact bytecode and assets for supported Ultimate hardware.

## Project references

- [Project brief](docs/project-brief.md)
- [Hardware targets and Commodore 77 requirements](docs/hardware-targets.md)
- [Milestone 1: build, run and validation](docs/milestone-1.md)

## Current status

The first Milestone 1 slice contains a GameMaker target/build shell, a small native
6502 diagnostic and a shared relocation recipe assembled by GML or the Node CLI.
It checks the UCI signature and offers a 256-byte REU round trip with restoration.
CPU preferences are recorded but not applied. Full model detection, REU sizing and
turbo control remain pending. Commodore 77 is a planned target, not tested hardware.

Open `UltimateDevMachine.yyp` in GameMaker LTS. Press 1/2/3 to select a target,
S to change the recorded CPU preference, and B to build a PRG and manifest.
The build status shows the output location. Compilation and a GML assembler smoke
test passed using the installed LTS runtime `2026.0.0.23`.

For a headless build and instruction-level tests (Node.js required):

```text
node tools/build.mjs
node --test tests/foundation.test.mjs
```

The generated `build/foundation.prg` is a dedicated test program, not a game
runtime release. Actual VICE and Ultimate runs remain to be performed. The real
C64 Dev Machine infrastructure is not present in this repository; this initial
relocator can be replaced with the mature assembler when that source is available.
