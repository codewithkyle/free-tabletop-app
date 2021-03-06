# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## [0.9.0] - 2021-02-03

### Added

- creatures have nametags again
- Game Masters can switch dice roll announcements from "Global" to "Local" in the room info menu
- full suite of monster data (xp, speed, languages, challenge rating, etc)
- monster manual
    - search creatures
    - delete creature
    - view creature
    - edit creatures
    - add custom creatures
- creature stat block popup modal

### Fixed

- switched Contact Support link to open GitHub Issues instead of an email
- improved creature lookup performance & search result quality

### Removed

- creature stats and abilities HUD (moved to monster manual)

## [0.8.2] - 2021-01-17

### Fixed

- added global error handling and error snack bar notification triggering
- player position reset when loading new maps
- player pawns no longer appear on gridless tabletops
- HUD overflow right bugs

### Removed

- players no longer see creature nametags

## [0.8.1] - 2021-01-10

### Added

- disconnection error snack bar notification

## [0.8.0] - 2021-01-07

### Added

- Game Masters can toggle tabletop scene visibility
- messenger features
    - clickable links
    - image previews (created from links)
    - embedded YouTube videos
    - persistent message history (per room)
- paintbrush size slider
- persistent popup image history
- popup image labels
- ability to expand/shrink modals
- localized field of view based fog of war
    - team-based visibility (players see all players and NPCs fields of view)
    - player vs player visibility (players only see their field of view)
- dynamically hiding/showing pawns using fog of war
- dynamic light sources

### Fixed

- buffer overflow bug that could appear while painting cells on massive maps

## [0.7.0] - 2020-12-30

### Added

- death celebration effect (confetti and sound effect)
- performance settings
    - toggle special effects quality (high/low)
    - toggle death celebration effect (on/off)
- new conditions
    - charmed
    - stunned
    - unconscious
    - restrained
- new low quality conditions
    - bleeding
    - burning
    - poisoned
    - charmed
    - stunned
    - unconscious
- ability to toggle pawn visibility
- updated footer
    - added copyright
    - added support email link
- tooltips

### Fixed

- clearing monster lookup input after selection
- last touched moveable modal is forced to the top of the z-index stack
- Creature & NPC move on death bug
- improved NPC & Creature death removal performance
- fixed modal visibility toggle performance

## [0.6.0] - 2020-12-29

### Added

- bleeding effect
- burning effect
- poisoned effect
- concentrating effect

### Fixed

- adjusted cells fog color

## [0.5.1] - 2020-12-22

### Fixed

- Chrome caching issues
- players can no longer overwrite fog with the highlighter

## [0.5.0] - 2020-12-22

### Added

- players can directly message each other
- room-based all chat

### Fixed

- fixed pawn relocation when reloading bug

## [0.4.0] - 2020-12-21

### Added

- tabletop painter
    - eraser
    - paint fog of war
    - highlight cells
- popup images
- center tabletop on pawn functionality

### Fixed

- refactored tabletop render system to use the `<canvas>` element
- moved cell rendering to use the `<canvas>` element
- modal CSS performance issues
- fog of war performance issues
- creature HUD overflow issues

## [0.3.4] - 2020-12-04

### Fixed

- combat order no longer resets when syncing
- custom creature spawning bug

### Removed

- temporarily disabled messenger functionality

## [0.3.3] - 2020-11-20

### Fixed

- ping icon rendering bug
- players can ping into the fog of war

## [0.3.2] - 2020-11-15

### Fixed

- fog of war grid-gap bug (Chrome)
- fog of war desync bug

## [0.3.1] - 2020-11-15

### Fixed

- fog of war reset on connect/reconnect bug
- fog of war performance issues
- refactored pawn movement (increased performance & speed)
- room locking & player reconnecting bug

## [0.3.0] - 2020-11-14

### Added

- tabletop loading animation
- tabletop image loading error notification
- image loading SFX
- initial fog of war functionality

### Fixed

- JavaScript performance issues
- tabletop touch/click and drag bug

## [0.2.0] - 2020-11-11

### Added

- dice menu can be kept open
- dice menu can be moved
- NPCs can be removed
- Creatures can be removed
- dice rolls are announced to everyone in the room
- Tabletop settings dropdown
- ability to set custom grid sizes (32px minimum)

### Fixed

- pinging is placed relative to the cell clicked
- remove number input ticker (due to Blazor bug)

## [0.1.6] - 2020-11-07

### Fixed

- removed app access after an update was downloaded and is pending reload
- centered snack bar message
- fixed inaccurate document titles

## [0.1.5] - 2020-11-07

### Fixed

- reduced minimum device/window size (768x500)

## [0.1.4] - 2020-11-06

### Fixed

- Firefox CSS issues (removed CSS lazy loading)

## [0.1.3] - 2020-11-06

### Added

- initial beta build
- CI/CD pipeline

[0.9.0]: https://github.com/codewithkyle/free-tabletop-app/compare/v0.8.2...v0.9.0
[0.8.2]: https://github.com/codewithkyle/free-tabletop-app/compare/v0.8.1...v0.8.2
[0.8.1]: https://github.com/codewithkyle/free-tabletop-app/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/codewithkyle/free-tabletop-app/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/codewithkyle/free-tabletop-app/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/codewithkyle/free-tabletop-app/compare/v0.5.1...v0.6.0
[0.5.1]: https://github.com/codewithkyle/free-tabletop-app/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/codewithkyle/free-tabletop-app/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/codewithkyle/free-tabletop-app/compare/v0.3.4...v0.4.0
[0.3.4]: https://github.com/codewithkyle/free-tabletop-app/compare/v0.3.3...v0.3.4
[0.3.3]: https://github.com/codewithkyle/free-tabletop-app/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/codewithkyle/free-tabletop-app/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/codewithkyle/free-tabletop-app/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/codewithkyle/free-tabletop-app/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/codewithkyle/free-tabletop-app/compare/v0.1.6...v0.2.0
[0.1.6]: https://github.com/codewithkyle/free-tabletop-app/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/codewithkyle/free-tabletop-app/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/codewithkyle/free-tabletop-app/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/codewithkyle/free-tabletop-app/releases/tag/v0.1.3