# Hardware targets

Research checked: 2026-09-29. This is a requirements and evidence document;
none of the targets below has been tested by this project.

## Target matrix

| Target | Published maximum | Project status |
| --- | --- | --- |
| Commodore 64 Ultimate | 64 MHz | Primary planned target; detection and control pending |
| Commodore 77 | Advertised 77 MHz | Additional planned target; register mapping and timing unverified |
| Ultimate 64 Elite-II | 64 MHz | Related hardware reference; validate separately before claiming support |
| Earlier Ultimate 64 | 48 MHz | Related hardware reference; different speed table |
| VICE | Configuration dependent | Development test path only; no assumption of Ultimate extension coverage |

Commodore calls the new model **Commodore 77**, a special edition of Commodore 64
Ultimate. Its announcement advertises 77 MHz and early-2027 shipping. This confirms
the requested target and advertised speed, not an implemented programming interface.
Source: [Commodore announcement, 2026-08-25](https://commodore.net/commodore-jacks-into-night-city-with-the-commodore-77-an-all-new-cyberpunk-2077-collaboration/).

## Verified turbo reference

The official documentation gives U64 and U64 Elite-II different speed-index
tables. `$D031` uses bits 0-3 for the index and bit 7 for badline control.
Availability depends on the configured turbo mode; an unavailable register reads
`$FF`. That value alone therefore cannot identify hardware. `$D030` is a
mode-dependent enable switch, not a MHz value.

VIC memory access retains priority. External bus access and badlines constrain
throughput, so advertised CPU MHz cannot be used as a DMA or raster-time budget.
Source: [Official turbo settings and registers](https://1541u-documentation.readthedocs.io/en/latest/config/turbo_mode.html).

The consulted reference does not give a Commodore 77 speed table. Do not encode
77 as a register value, reuse index 15 on that assumption, or extrapolate the
64 MHz timing model without evidence.

## Required capability model

The central hardware layer must distinguish:

- User-selected build target and requested speed.
- Detected board, firmware/core revision and identification confidence.
- Advertised maximum, documented speed options and current configured speed.
- Available REU capacity and tested transfer behaviour.
- Separately verified palette, audio and raster capabilities.
- Measured performance, including video standard and active graphics/DMA load.

Unknown capabilities remain unknown; a selected target is not detection evidence.
If identification or turbo control is unavailable, leave CPU configuration alone,
report the reason, and block builds requiring an unverified feature. Optional
features may use an explicitly designed fallback. This does not require stock-C64
compatibility for the product.

For a verified speed table, choose a supported speed no greater than the requested
limit. Do not silently exceed it. If a project's minimum requirement cannot be
met, report the mismatch. Capability selection belongs in one hardware layer;
scene, entity and script systems must not contain model-specific register writes.

## Milestone 1 acceptance evidence

1. Open and build the shell in the chosen GameMaker LTS version; record its version.
2. Generate a minimal PRG that starts and reports diagnostic results.
3. Establish documented hardware/firmware identification before any optional writes.
4. Test unavailable turbo registers and every supported control mode. On identified
   hardware, test supported speed selections and restoration of prior configuration.
5. Detect usable REU capacity with a documented, bounded procedure. Reserve scratch
   memory; verify transfers in both directions, boundaries and data preservation.
6. Run supported baseline tests in VICE and label unsupported extensions as skipped.
7. Repeat on each claimed hardware/firmware combination. Record PAL/NTSC mode,
   actual settings, checksums, raster deadlines and failures.
8. Keep Commodore 77 turbo enablement pending until its register mapping is verified
   and real hardware tests pass. A specification entry is not a hardware test pass.

## Remaining research

All ten priorities in the project brief remain implementation gates. In particular,
verify REU DMA semantics, turbo/raster IRQ interaction, palette update latency,
audio channel controls, and emulator coverage before implementing those systems.
Do not assume a palette command can meet a scanline deadline.

Primary reference starting points:

- [Ultimate documentation](https://1541u-documentation.readthedocs.io/en/latest/)
- [Firmware releases](https://www.ultimate64.com/Firmware)
- [Firmware source](https://github.com/GideonZ/1541ultimate)

Pin relevant documentation or source revisions when implementing register-level
behaviour. Record real-device test results with exact board and firmware versions.
