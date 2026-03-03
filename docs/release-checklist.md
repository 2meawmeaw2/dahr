# Release Checklist

## Product assets
- [ ] Verify app icon variants are exported and configured (adaptive icon + iOS icon).
- [ ] Verify splash artwork, background color, and dark/light variants are current.
- [ ] Check screenshots for onboarding, workout logging, and progress screens.

## Platform permissions
- [ ] Confirm only required iOS permission strings are present in `Info.plist` configuration.
- [ ] Confirm Android permissions are minimal and justified.
- [ ] Validate notification, camera, photo, and health permission copy for user clarity.

## Store metadata
- [ ] Update App Store Connect title/subtitle/keywords and privacy URL.
- [ ] Update Google Play short description/full description and contact details.
- [ ] Refresh store screenshots, feature graphic, and app category.
- [ ] Verify support URL and marketing URL point to live pages.

## Build + quality gates
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
- [ ] Run `npm test`.
- [ ] Run `npm run ci:expo:ios`.
- [ ] Run `npm run ci:expo:android`.

## Release operations
- [ ] Bump version/build numbers in Expo config.
- [ ] Validate changelog and release notes.
- [ ] Confirm crash reporting and analytics environments are set to production.
- [ ] Final smoke test on at least one iOS and one Android physical device.
