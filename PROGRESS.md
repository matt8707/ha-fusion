# Progress

## Groupings

List grouped by domains and categorized based on their similar behaviors

### Sensor

- [x] air_quality
- [x] calendar
  - [x] idea: add actual calendar in modal
- [x] event
- [x] image_processing
- [x] mailbox
- [x] sensor
- [x] binary_sensor
- [x] stt
- [x] update
  - [x] idea: update functionality in modal
- [x] weather
- [x] schedule
- [x] button
- [x] input_button
- [x] scene
- [x] sun

### Switch

- [x] automation
- [x] input_boolean
- [x] remote
- [x] siren
- [x] switch
- [x] script
  - [x] idea: show running state

### Climate

- [x] climate
  - [x] horizontal temp select
  - [x] issue <https://github.com/matt8707/ha-fusion/issues/22>
- [x] fan
- [x] humidifier
- [x] water_heater

### Other

- [x] alarm_control_panel
  - [x] <https://github.com/matt8707/ha-fusion/issues/3>
  - [x] respect `code_format` (null / number / text)
  - [x] respect `code_arm_required` and `code_disarm_required`
  - [x] filter modes by `supported_features` bitmask
  - [x] fix <https://github.com/matt8707/ha-fusion/issues/628>
- [x] lock
  - [ ] option to lock with code?
- [x] camera
- [x] cover
  - [x] <https://github.com/matt8707/ha-fusion/issues/29>
  - [x] <https://github.com/matt8707/ha-fusion/issues/13>
- [x] number
- [x] input_number
  - [x] idea: round state if .0
  - [x] support different modes other than mode: slider
- [x] light
  - [x] open rgb issue <https://github.com/matt8707/ha-fusion/issues/18>
- [x] media_player
- [x] input_select
  - [x] <https://github.com/matt8707/ha-fusion/issues/4>
- [x] select
  - [x] use svelecte
- [x] text
  - [x] input field in modal
- [x] input_text
- [x] todo
  - [x] modal has a shopping_list functionality
- [x] vacuum
  - [x] idea: custom map if map camera
  - [x] <https://github.com/matt8707/ha-fusion/issues/24>
- [x] counter
- [x] group
- [x] valve
- [x] lawn_mower

### Date

- [x] date
- [x] datetime
- [x] input_datetime
  - [ ] parse date in state
- [x] time
  - [ ] time input like `timer`
- [x] timer
  - [x] when set state in modal don't stop timer
  - [x] add entity name to timers
        <https://github.com/matt8707/ha-fusion/issues/107>

### Device Tracker

- [x] device_tracker
- [x] person
  - [x] bug: if no entity_picture in map show icon
  - [x] bug: if no gps modal won't open
  - [ ] idea: toggle icon pings phone?
  - [x] make api key more clear if missing
        <https://github.com/matt8707/ha-fusion/issues/121>
- [x] zone
  - [ ] idea: map with all persons?

## Object types

- [x] button
- [x] camera
- [x] custom_panel
  - rows: camera, buttons, sensor, slider
  - configurable primary entity state on tile
  - full i18n (en + it)
- [ ] map
- [ ] media
  - [ ] <https://github.com/matt8707/ha-fusion/issues/20>
- [x] light slider
  - [x] <https://github.com/matt8707/ha-fusion/issues/40>

## List of domains (incomplete)

<https://www.home-assistant.io/integrations/demo/> <br>
<https://github.com/home-assistant/core/blob/dev/homeassistant/const.py>

---

## Fork fixes (amedello/ha-fusion)

### HA 2025.x compatibility

- [x] Socket.ts: token validation and auth robustness
  - `loadTokens()` handles literal `"null"` string and validates token structure
  - `clearTokens()` uses `localStorage.removeItem()` instead of writing null
  - added missing `await` on `auth.refreshAccessToken()`
  - `subscribeServices()` moved to global connection level
  - added `ERR_INVALID_AUTH_CALLBACK` handling and `auth_callback=1` URL cleanup
  - fix <https://github.com/matt8707/ha-fusion/issues/632>

### YouTube add-on

- [x] Extended YouTube thumbnail support to Chromecast / Google TV (`app_id: 2C6A6E3D`)
  - previously only supported iOS (`com.google.ios.youtube`)
- [x] Upgraded `youtubei.js` to v16 — OAuth2 now uses TV client (required by Google)
  - fixes `Failed to refresh access token: 400` error

### Ingress / External auth

- [x] Fix auth redirect URL when using HA Addon Ingress (#636)
  - detects Ingress path (`/api/hassio_ingress/`) and passes explicit `redirectUrl` to `getAuth()`
  - prevents OAuth2 callback failure when accessing ha-fusion externally via Ingress
  - no impact on Docker / direct port installs

### Custom Panel (feature/custom-panel)

- [x] New `custom_panel` item type (tile + view modal + config modal)
  - `Main/CustomPanel.svelte` — tile with icon, name, primary entity state
  - `Modal/CustomPanelModal.svelte` — read-only view modal
  - `Modal/CustomPanelConfig.svelte` — edit modal with row management
  - Row sub-components: `RowCamera`, `RowButtons`, `RowSensor`, `RowSlider`
  - `ButtonConfigRow.svelte` for per-button config
- [x] Primary entity on tile: `primary_row_id` on `CustomPanelItem` lets user pick a sensor/slider row whose state is shown on the tile
- [x] Binary sensor state translation: `$lang(state) || state` pattern
- [x] All UI strings use `$lang()` — no hardcoded English in components
- [x] Full Italian translation (14 new keys in `it.json`)
- [x] GraphQL-consistent UI: `<h2>` section dividers, `ConfigButtons` footer, standard Svelte modal layout

### Pending

- [ ] Lock with code support
- [ ] `input_datetime` parse date in state
