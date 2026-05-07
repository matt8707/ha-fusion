# ha-fusion

A modern, easy-to-use and performant custom [Home Assistant](https://www.home-assistant.io/) dashboard.

This is a personal fork of [ha-fusion](https://github.com/matt8707/ha-fusion) by [matt8707](https://github.com/matt8707), extended with additional features and improvements.



[![preview](/static/preview.png)](https://www.youtube.com/watch?v=D8mWruSuPOM)

---

## What's different in this fork

### New: Custom Panel item type

A new dashboard item type — `CUSTOM PANEL` — that lets you build a fully configurable multi-row panel inside a single tile. Rows can be freely combined and reordered:

| Row type | What it does |
|----------|--------------|
| **Camera** | Embeds a camera stream (with optional live feed) |
| **Buttons** | Up to 4 action buttons per row, each fully configurable |
| **Sensor** | Displays a sensor or binary sensor value with optional prefix/suffix |
| **Slider** | Controls a `light` or `number` entity via a brightness/value slider |

A "primary entity" can be pinned to the tile so its state is always visible at a glance without opening the panel.
All UI strings are fully translated (English and Italian included, contributor for other translation are welcome).

For the full list of changes, fixes and improvements see [PROGRESS.md](PROGRESS.md).

---

## Credits

This project is based on the excellent work of [matt8707](https://github.com/matt8707/ha-fusion). All credit for the original dashboard design and architecture goes to him. If you find his project useful, consider supporting him at <https://www.paypal.com/paypalme/matt8707>.

Original demo video: <https://www.youtube.com/watch?v=D8mWruSuPOM>

---

## 📣 Pre-beta

The current state of this project is **pre-beta**. This means that there's basic functionality missing, incomplete features and unresolved issues. General feedback, bug reports and feature requests are welcome!

---

## Installation

### Add-on

For "Operating System" or "Supervised" installation methods, you can install ha-fusion as an add-on:

1. **Add Repository**: To begin, add the ha-fusion add-on repository to your Home Assistant instance. Click the button below or manually add the repository using this URL: <https://github.com/amedello/addon-ha-fusion>.

   [![Open your Home Assistant instance and show the add add-on repository dialog with a specific repository URL pre-filled.](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2Famedello%2Faddon-ha-fusion)

2. **Install Add-on**: After adding the repository, refresh the add-on store page. Locate ha-fusion in the list and proceed with the installation.

---

### Docker

```bash
cd path/to/docker-compose.yml
docker-compose up -d ha-fusion
```

#### Update

```bash
docker-compose pull ha-fusion
docker-compose up -d ha-fusion
```

<details>
<summary><b>Without docker-compose</b></summary>

```bash
docker run -d \
  --name ha-fusion \
  --network bridge \
  -p 5050:5050 \
  -v /path/to/ha-fusion:/app/data \
  -e TZ=Europe/Rome \
  -e HASS_URL=http://your-ha-instance:8123 \
  --restart always \
  ghcr.io/amedello/ha-fusion
```

</details>

---

## Query strings

### View

To set a particular view on load, append `?view=ViewName` to the URL.

### Menu

To disable the menu button (e.g. on wall-mounted tablets), append `?menu=false` to the URL.

---

## Keyboard Shortcuts

| Key                 | Description |
| ------------------- | ----------- |
| **f**               | filter      |
| **esc**             | exit        |
| **cmd + s**         | save        |
| **cmd + z**         | undo        |
| **cmd + shift + z** | redo        |

---

## Debug

Check `docker logs ha-fusion` for backend issues. For frontend issues, open the browser console.

---

## Develop

```bash
# prerequisites
brew install node pnpm  # macOS
# or use your preferred package manager

# install
git clone https://github.com/amedello/ha-fusion.git
cd ha-fusion
pnpm install

# environment
cp .env.example .env
code .env

# dev server
npm run dev -- --open

# lint
npm run check
npm run lint
npm run format

```
## If this project saves you time, a coffee is always appreciated.

[![Buy Me A Coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/amedello)
