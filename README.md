# Leonida Trophy Atlas — GTA VI trophy guide & tracker

[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun rank](https://make.fun/badge/gta6-trophy-guide-01/KaiserHxZ/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun reward](https://make.fun/badge/gta6-trophy-guide-01/KaiserHxZ/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all 55 Grand Theft Auto VI trophies on PlayStation 5 (1 platinum, 2 gold, 6 silver, 46 bronze), built for the [gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it does

- **Checklist of all 55 official trophies** — official name, description and grade for each, with progress saved in your browser (localStorage).
- **A guide for every trophy**, written in our own words and cited beside it. Sources: the [PowerPyx GTA 6 Trophy Guide & Roadmap](https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/) for the how-to of each trophy, and [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-ps5/trophies/) / [PSNProfiles](https://psnprofiles.com/trophies/grand-theft-auto-vi) for the official trophy list. No guide text is copied from any of them.
- **Roadmap to the platinum** — three stages (story 60–80h, the 100% checklist ~100h, cleanup ~10h; about 200h total, difficulty 4/10), plus the one possibly missable trophy flagged: *Positive Mental Attitude*, with the Chapter 1 meditation step spelled out.
- **Filters** — by kind (story, missable, collectibles, activities, quests, crime, completion, online) and by grade, plus search and a hide-earned toggle. There are no online trophies: all 55 are offline.
- **Spoiler-safe mode** — hides story-trophy names and descriptions until you earn them.
- **Export / import** — save progress to a JSON file and load it back on another browser.

## Run it

Static files, no build step, no network at runtime:

```sh
node serve.ts   # then open http://localhost:8080
```

Or open `app/index.html` directly in a browser.

## Notes

- Unofficial fan-made tracker. Not affiliated with Rockstar Games or PlayStation; it uses no Rockstar logo, artwork or game screenshots.
- Cheats disable trophies and there is no mission replay, so the guide keeps the run cheat-free and suggests saving at the start and end of each chapter.
- `main.ts` copies `app/` and `screenshots/` to `/output` and writes `dossier.json` with the vendored make.fun library (`vendor/makefun-frontend.ts`, untouched).

## License

MIT — see [LICENSE](LICENSE).
