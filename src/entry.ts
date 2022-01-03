import * as Constants from 'constants';
import Dotenv from 'dotenv';
import DotenvExpand from 'dotenv-expand';
import * as FS from 'fs';
import * as Path from 'path';

import { BANNER } from './banner';
import { Program } from './program';

const ENV_FILE_PATH = Path.join(__dirname, '..', '.env');
const DEBUG = false;

FS.access(ENV_FILE_PATH, Constants.R_OK, (err) => {
    if (!err) {
        const ENV_FILE_CONTENTS = FS.readFileSync(ENV_FILE_PATH);
        const ENV_VARS = DotenvExpand(Dotenv.parse(ENV_FILE_CONTENTS, { debug: DEBUG }));

        for (const [key, value] of Object.entries(ENV_VARS)) {
            process.env[key] = value as string;
        }
    }

    console.log(BANNER);

    const TOKEN = process.env.DISCORD_TOKEN;
    if (!TOKEN?.length) {
        console.error("No value for environment variable 'DISCORD_TOKEN' provided.");
        process.exit(1);
    }

    const GUILD_ID = process.env.DISCORD_GUILD_ID;
    if (!GUILD_ID?.length) {
        console.error("No value for environment variable 'DISCORD_GUILD_ID' provided.");
        process.exit(1);
    }

    Program.Main(TOKEN, GUILD_ID);
});
