# NaughtyBot
NaughtyBot scans robots.txt files explore parts of websites that owners don't want Google to find.

Bishop is MIT licensed and open source; contribute at https://github.com/jkingsman/NaughtyBot.

## Installation

### Manual

> You'll need node and npm set up on your system (which is beyond the scope of this README), and gulp installed (`npm install -g gulp` if you don't already have it).

1. Clone this repo:

  `git clone git@github.com:jkingsman/NaughtyBot.git`

2. Move into it:

  `cd bishop`

2. Install the gulp dependencies:

  `npm install`

3. Make sure the build directory is empty:

  `gulp empty`

4. Build it, using any of the following commands:

| `gulp` command  | result |
| ------------- | ------------- |
| `gulp`  | Lint the code and build the `src` directory into the `dist` directory. `dist` can be imported as an unpacked extension.  |
| `gulp zip`  | Lint the code and build the `src` directory into the `dist` directory, then zip the `dist` directory into `NaughtyBot.zip` in the root `NaughtyBot` folder.  |
| `gulp watch`  | Build the `src` directory into the `dist` directory and rebuild on changes to `src`.  |
| `gulp hint`  | Lint all non-lib js. Doesn't build anything; done as part of `gulp` and `gulp zip`.  |

## License
MIT.

***
