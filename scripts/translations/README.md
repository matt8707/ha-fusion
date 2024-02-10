# Translations

Translations are pulled from a local Home Assistant Docker container by editing and running `generate.sh`

## Edit

**To edit translations contribute directly to Home Assistant**
<https://developers.home-assistant.io/docs/translations/>

## Find

The easiest way to locate translations is to first copy them to your local machine, then search in that folder using, for example, Visual Studio Code.

```bash
# example
docker exec -it homeassistant bash
scp -r \
  /usr/local/lib/python3.12/site-packages/hass_frontend/static/translations \
  matte@192.168.1.109:/Users/matte/Downloads
```

If translations can't be found in "frontend", they're in the components directory, for example media player, climate and camera translations...

```bash
# components dir > 100mb
/usr/src/homeassistant/homeassistant/components
```

## Add

In `fetch.py` add your translation key using the following format;

```py
("hello", ["ui.example.hello"]),
```

Where `hello` is the key that will be used in fusion e.g. `$lang('hello')` and `"ui.example.hello"` is the Home Assistant translation key. It is important to put it under the correct path as well, for example under "Lovelace" for translations that exist in `/translations/lovelace` folder.
