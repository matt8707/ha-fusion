# ha-fusion

A modern, easy-to-use and performant custom [Home Assistant](https://www.home-assistant.io/) dashboard

<https://www.youtube.com/watch?v=D8mWruSuPOM>

[![preview](/static/preview.png)](https://www.youtube.com/watch?v=D8mWruSuPOM)

If you find this project useful, be sure to 🌟 this repository! If you love it, please consider donating! ❤️ <https://www.paypal.com/paypalme/matt8707>

---

## 📣 Pre-beta

The current state of this project is **pre-beta**. This means that there's basic functionality missing, incomplete features and unresolved issues. General feedback, bug reports and feature requests are welcome!

---

## Installation

Todo

- Addon - <https://github.com/matt8707/addon-ha-fusion>
- Docker - <https://github.com/matt8707/ha-fusion/blob/master/docker-compose.yml>

---

## Query strings

### View

To set a particular view when the page loads, add the "view" parameter. For example, if you have a "Bedroom" view, append the query string `?view=Bedroom` to the URL.

### Menu

To disable the menu button, append the query string `?menu=false` to the URL. This is useful when you want to avoid unwanted changes to your dashboard, such as on wall-mounted tablets.

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

To debug any errors, check the "Log" tab if you're using the addon, or use `docker logs ha-fusion` for Docker setups. To inspect frontend issues, open the browser's console.

---

## Develop

To begin contributing to the project, you'll first need to install node. It's also recommended to install pnpm. If you're unfamiliar with Svelte, consider doing the tutorial at <https://learn.svelte.dev>

```bash
# prerequisites (macos)
brew install node pnpm

# install
git clone https://github.com/matt8707/ha-fusion.git
cd ha-fusion
pnpm install

# server
npm run dev -- --open

# dependencies
pnpm outdated
pnpm upgrade

# lint
npm run check
npm run lint
npm run format
```
