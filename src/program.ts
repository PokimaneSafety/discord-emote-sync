import * as Discord from 'discord.js';

import * as Helpers from './helpers';
import * as Provider from './providers';

export class Program {
    private static readonly Client = new Discord.Client({
        intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS],
    });

    /* BetterTTV#9768 */
    private static readonly UploaderDiscordID = '351227880153546754';

    /* pokimane */
    private static readonly TwitchUserId = '44445592';

    private static readonly EmoteProvider: Provider.IEmoteProvider = new Provider.BetterTwitchTVEmoteProvider();

    public static Main(token: string, guildId: string) {
        this.Client.on('ready', async () => {
            if (!this.Client.user) {
                console.error('Attempted to reference user struct but it has not yet been received.');
                this.Client.destroy();
                return;
            }

            console.log(`Logged in as ${this.Client.user.tag}`);

            await this.ProcessGuild(guildId);
            this.Client.destroy();
        });

        this.Client.login(token);
    }

    private static async ProcessGuild(guildId: string) {
        const guild = await this.Client.guilds.fetch(guildId);
        console.log(`Targeting guild '${guild.name}' (${guild.id})`);

        console.log(`Loading emojis for guild '${guild.name}' (${guild.id})`);
        const emojis = await guild.emojis.fetch();
        if (emojis.size === 0) {
            console.log(`Guild '${guild.name}' (${guild.id}) has no emotes.`);
            return;
        }
        const discord = emojis.reduce<Provider.IEmoteProviderEmote[]>((list, { id, name, url, author }) => {
            if (name && author && (author.id === this.UploaderDiscordID || author.id === this.Client.user!.id)) {
                list.push({ id, name, url });
            }
            return list;
        }, []);
        console.log(`Successfully loaded ${discord.length} emotes for guild '${guild.name}' (${guild.id})`);

        const bttv = await this.EmoteProvider.GetEmotesByChannelId(this.TwitchUserId);
        console.log(`Successfully loaded ${bttv.length} BTTV emotes.`);

        const [remove, add] = Helpers.SetHelpers.Difference(new Set(bttv), new Set(discord), (value) => value.name);

        for (const { name, url } of add) {
            let success = false;
            let size = 3;
            let formatted = url.replace('{{size}}', size.toString());
            while (size > 0) {
                formatted = url.replace('{{size}}', size.toString());
                console.log(`Adding emoji '${name}': ${formatted}`);
                try {
                    await guild.emojis.create(formatted, name, { reason: 'Synced from BTTV' });
                    success = true;
                    break;
                } catch (err) {
                    console.log(`An error occurred uploading emoji '${name}': ${formatted}: ${(err as Error).message}`);
                }
                --size;
            }

            if (success) console.log(`Successfully added emoji '${name}': ${formatted}`);
            else console.log(`A persistent error occurred uploading emoji '${name}': ${formatted}`);
        }

        for (const { id, name } of remove) {
            console.log(`Removing emoji '${name}' (${id})`);
            const cached = guild.emojis.cache.get(id);
            if (!cached) {
                console.warn(`No emoji exists with id ${id}`);
                continue;
            }
            await cached.delete('Synced from BTTV');
            console.log(`Successfully removed emoji '${name}' (${id})`);
        }
    }
}
