# cash-popper

This application allows a developer to trigger a cash drawer that's connected
to a local computer through a simple API call, intended for web-based
point-of-sale applications. 

## How it Works

Specifically, this was built to work with [this USB-Serial Adapter][adapter],
which connects a RJ11/RJ12 printer-driven cash drawer via a simulated serial
connection, and triggers the cash drawer whenever any data is written to the
generated port.

`cash-popper` makes a few assumptions, looking for USB-based serial ports on
the system and displaying them as potential options. If you have lots on your
system, or some other adapter, it may fail to auto-detect them. Please file
an issue if you're using the above trigger and not seeing it work.

## Usage

Once you've launched the application, it will check your system for what it
thinks are possible cash drawers and start an API server in the background.

The API server listens by default on `http://localhost:31198`, and can be
monitored with `GET http://localhost:31198/ping`. If that port is in use
on your system, the app will pick the first available port between
`40000` and `60000` as its API url. You can always see it on the main panel.

**Note**: If there is only one cash drawer, it will automatically select that
as the default. If there is more than one, you will need to tell `cash-popper`
which drawer to use by going to `Drawers` in the top right corner and clicking
`Set Default` on the one you want to use.

Once your default drawer is ready (either auto- or manually-selected), in your
POS application, hit `PUT http://localhost:31198/default-drawer/open`. You
could also use curl to test locally:

```bash
# On MacOS

curl -I -X PUT http://localhost:31198/default-drawer/open
```

```powershell
# On Windows PowerShell

Invoke-RestMethod -Method PUT -Uri http://localhost:31198/default-drawer/open
```

If your drawer pops open, you're good to go! But see the `Caveats` section below.

### Reloading

If you launch the app before the cash drawer is plugged in, you'll need to reload
the drawers. You can do this one of two ways:

1. Right click on the tray icon and select `"Reload Drawers"`
2. Click `Reload Drawers` in the main window footer within the app itself.

In the future, this may poll USB connections to check when new ports are added,
but it's pretty low-hanging fruit.

### Quitting

Because it's designed to just run forever in the background, when closing the main
window, it will simply minimize it to the tray. If you need to actually exit,
right-click the tray icon and select "quit"

## OS Support

### Windows

`cash-popper` is designed first and foremost to run on Windows, as that's all
the EOM-POS trigger claims to support, and that's my intended use case. Any
changes will focus on keeping it working there before other platforms.

### MacOS

`cash-popper` has also been lightly tested on MacOS. Despite the trigger's
claims of only working on Windows on the sale page, installing a simple
[Prolific PL2303 Driver][macos-driver] got it working for me. The trigger
vendor _may_ use other chipsets without really advertising them, though,
as they don't exactly advertise their specs. YMMV.

### Linux

Ostensibly, it _should_ work if a similar driver exists, but I don't have
a Linux desktop to test and my interest in getting it to work is low.
PRs welcomed if someone needs it and wants to put in the effort.

## Known Issues

### "I sent a bunch of open commands, and now it won't open"

The protocol we have to work with is quite lacking. It seems to get easily
overloaded if you send multiple open requests at once. No data comes back
on the serial port, so there seems to be no way to see if there is too much
data buffered, etc.

Waiting a few seconds before sending a command again seems to resolve it in
all my testing. It's unclear if this is a limitation of the specific drawer
I am using, or if it is the trigger itself.

## Future Roadmap

* Prompt the user to select a default cash drawer if there is > 1 when first
  loading the application.
* Persist selection of default cash drawer port across launches / restarts
  when there is more than one cash drawer connected.
* Poll USB to automatically reload cash drawers when plugging one in and out. There
  are not a lot of platform agnostic interfaces that I could find at first blush,
  so it would need to be kind of a manual affair. Likely not to happen for a long
  while.
* Maybe: Possibly attach a label to cash drawers, along with other metadata.
* Maybe: Expose an API for triggering a specific cash drawer that isn't default
  by its path (or mentioned label)
* Maybe: Log cash drawer triggers. Key-opens wouldn't be tracked, obviously,
  but could provide a (very limited) audit trail for when the drawer was opened
  either via API or direct "open" click on the drawers pane.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

[adapter]: https://www.amazon.com/EOM-POS-Trigger-Drawer-Connecting-Drawer/dp/B083F928QF "EOM-POS USB Trigger for Cash Drawer"
[macos-driver]: https://www.prolific.com.tw/US/ShowProduct.aspx?p_id=229&pcid=41