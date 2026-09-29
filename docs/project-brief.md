# C64 Ultimate Engine

## Project Goal

Build a new GameMaker-based game engine/editor specifically for C64 Ultimate hardware.

This is a separate sibling product to C64 Dev Machine, not a mode inside it.

C64 Dev Machine remains focused on classic C64 development and visual assembly/code tooling.

C64 Ultimate Engine should instead behave more like a modern lightweight game engine whose runtime happens to execute on C64 Ultimate hardware.

## Core Philosophy

The user should work with:

- scenes
- entities
- sprites
- animation
- collisions
- input
- maps
- cameras
- audio
- behaviours
- scripts
- REU assets
- raster effects

They should not need to think primarily in terms of individual 6502 opcodes.

The engine should generate or execute efficient native 6502/6510 code, tables, bytecode and data underneath.

GameMaker is the editor and authoring environment.

The C64 Ultimate is the target runtime.

## Target Hardware

Design specifically around C64 Ultimate hardware rather than maintaining stock-C64 compatibility.

Expected capabilities include, where supported by the specific Ultimate hardware/firmware:

- high-speed CPU operation up to 64 MHz on supported C64 Ultimate targets
- Commodore 77 as an additional target, with an advertised 77 MHz maximum; firmware control and timing must be verified before enabling it
- 16 MB REU
- VIC-II video output
- raster manipulation
- Ultimate-specific palette capabilities
- Ultimate-specific audio capabilities
- fast REU transfers
- expanded asset storage
- real hardware transfer and testing

Do not guess hardware behaviour.

Verify Ultimate-specific registers, timing behaviour, firmware capabilities and limitations against current official documentation and reliable technical sources.

## Architecture

The project should use this broad architecture:

GameMaker Editor
→ Project/Scene Data
→ Engine Compiler / Asset Builder
→ Native Runtime / Script Bytecode
→ 6502/6510 + Ultimate-specific code
→ C64 Ultimate hardware

The runtime should be modular and data-driven.

## Suggested Engine Systems

Create independent modules for:

### Entity System
- entity IDs
- transforms
- hierarchy where useful
- enable/disable
- tags/types
- lightweight components

### Scene System
- scene loading
- entity creation
- scene transitions
- persistent objects
- scene data stored in REU where appropriate

### Graphics System
- VIC-II sprites
- sprite multiplexing
- layered sprites
- high-colour logical sprites
- bitmap compositing
- REU streamed animation
- tile maps
- bitmap backgrounds
- double buffering where practical

A logical game object should not necessarily correspond to one hardware sprite.

The renderer should be capable of deciding whether an object is rendered using:

- one VIC sprite
- several layered VIC sprites
- multiplexed sprites
- bitmap compositing
- raster colour changes
- a combination of techniques

### Raster System
Create a central raster scheduler.

It should manage:

- scanline events
- palette changes
- sprite register changes
- sprite bank switching
- REU operations
- bitmap updates
- IRQ scheduling

Eventually provide a visual raster timeline in the editor.

### REU System

Treat the 16 MB REU as a fundamental part of the engine architecture rather than just expansion memory.

Support:

- asset allocation
- asset banks
- streaming
- DMA transfer
- animation frame storage
- map storage
- audio data
- scene data
- temporary work buffers

Create a visual REU memory map in the editor.

### Animation System
Support:

- sprite sheets
- frame sequences
- REU-resident animation
- playback speed
- events
- loops
- one-shot animations

### Input System
Support standard C64/Ultimate input including:

- keyboard
- joystick
- mouse where appropriate
- configurable actions

### Collision System
Keep the first implementation simple and efficient:

- AABB
- point
- simple tile collision

More advanced collision can come later.

### Audio System
Design for:

- SID
- Ultimate-specific PCM/DMA audio where available
- music
- sound effects
- simultaneous channels
- REU-resident audio assets

### Camera System
Support:

- scrolling
- scene offsets
- map following
- screen bounds
- simple shake/effects

### Script System

Create a compact native scripting language or bytecode system.

Do not make scripting equivalent to raw assembly.

Example style:

player.speed = 3

when left
    player.x -= player.speed
end

when collide enemy
    player.health -= 1
end

when fire
    spawn bullet
end

The GameMaker editor can compile this into compact bytecode or generated native routines.

At verified turbo speeds, including the planned Commodore 77 target, a lightweight VM is acceptable if it provides significant usability advantages. Budget and test it per hardware/firmware profile; do not assume a 77 MHz effective throughput.

Provide an Advanced Native/ASM escape hatch later.

## Hardware Abstraction Layer

Create one central Ultimate hardware layer.

Conceptually expose functions such as:

- ultimate_detect
- ultimate_get_capabilities
- ultimate_set_cpu_speed
- ultimate_reu_alloc
- ultimate_reu_copy_to_ram
- ultimate_reu_copy_from_ram
- ultimate_palette_set
- ultimate_audio_play
- ultimate_wait_raster
- ultimate_irq_install

Higher-level systems should call this abstraction rather than directly scattering hardware register access throughout the runtime.

## GameMaker Host

Continue using GameMaker LTS as the editor technology.

Reuse proven infrastructure from C64 Dev Machine wherever sensible, particularly:

- assembler code generation
- labels
- fixups
- branches
- PRG creation
- binary import/export
- asset conversion
- REU transfer logic
- sprite editor
- bitmap editor
- palette handling
- project serialization
- config handling
- VICE integration
- build/run pipeline
- Ultimate hardware transfer/testing logic

Do not duplicate mature systems unnecessarily.

However, avoid dragging the existing Dev Machine UI architecture into the new product if it compromises the cleaner engine-style workflow.

Share technology, not clutter.

## Editor Design

The editor should eventually contain major workspaces such as:

### Scene
Visual scene editing and entity placement.

### Entities
Entity definitions and behaviours.

### Graphics
Sprites, animations, bitmap assets and rendering modes.

### REU
Visual asset/memory map for the 16 MB REU.

### Raster
Visual scanline/raster scheduler.

### Audio
SID and Ultimate audio assets.

### Scripts
Native high-level engine scripting.

### Performance
Show engine performance information including:

- CPU load
- raster time
- REU transfer volume
- active logical sprites
- active hardware sprites
- missed raster deadlines
- memory usage
- frame rate

## Performance Philosophy

Make the performance budget visible.

The editor should eventually be able to display information such as:

CPU usage: 24%
REU transferred this frame: 320 KB
Logical sprites: 23
Hardware sprite operations: 61
Raster events: 38
Target: 50 Hz
Raster deadline: SAFE

The purpose is to make advanced C64 Ultimate programming understandable rather than mysterious.

## First Technical Milestone

Do not attempt to build the entire engine immediately.

First create a minimal vertical slice.

### Milestone 1: Ultimate Runtime Foundation

Build:

- GameMaker project shell
- Ultimate hardware detection
- CPU-speed configuration
- REU detection
- REU transfer test
- simple runtime startup
- VICE development path where supported
- real Ultimate hardware test path

### Milestone 2: Ultimate Sprite Playground

Create a simple editor/runtime demonstration focused on high-colour logical sprites.

Allow an imported sprite/animation to be rendered using one or more of:

- layered VIC sprites
- raster multiplexing
- raster colour changes
- REU streamed graphics
- bitmap compositing

The user should be able to import an asset, create multiple moving entities and see the engine handle the hardware implementation.

This should be the first major proof that the new product offers something fundamentally different from C64 Dev Machine.

## Initial Research Priorities

Before implementing major systems, establish an accurate technical reference for:

1. CPU turbo control
2. maximum supported CPU speeds across Ultimate hardware variants
3. REU implementation and DMA behaviour
4. CPU/VIC timing interaction at turbo speeds
5. raster IRQ behaviour
6. Ultimate palette control
7. Ultimate audio/DMA channels
8. VICE support for relevant Ultimate extensions
9. hardware feature detection
10. safe fallback behaviour

Keep technical references in project documentation.

## Product Positioning

C64 Dev Machine:
"See your code."

C64 Ultimate Engine:
A game engine designed around what modern Ultimate hardware allows a C64-style system to do.

Possible positioning:

"VIC-II Unleashed"

or

"Build beyond the original limits."

The new engine should feel related to C64 Dev Machine but visually and conceptually cleaner, more modern and more engine-like.

## Development Rule

Prefer small working vertical slices over speculative large architectures.

Every major system should first be demonstrated running on the actual target hardware.

Treat real C64 Ultimate hardware behaviour as the source of truth.
## Commodore 77 Support Requirement

Support the Commodore 77 (referred to as Ultimate 77 in the initial request) as a first-class planned target alongside C64 Ultimate. Its advertised maximum is 77 MHz. Keep advertised speed, requested speed, firmware-supported speed and measured performance separate. Do not infer its speed-register encoding from the older 48 MHz or 64 MHz models. See [Hardware targets](hardware-targets.md) for evidence, unknowns and acceptance criteria.

