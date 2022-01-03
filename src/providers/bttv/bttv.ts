import got from 'got';

import type { IEmoteProviderEmote } from '..';
import type { IEmoteProvider } from '../provider';

interface IUser {
    readonly id: string;
    readonly name: string;
    readonly displayName: string;
    readonly providerId: string;
}

interface ISharedEmote {
    readonly id: string;
    readonly code: string;
    readonly imageType: string;
    readonly user: IUser;
}

interface IChannelEmote {
    readonly id: string;
    readonly code: string;
    readonly imageType: string;
    readonly userId: string;
}

interface IUserResponse {
    readonly id: string;
    readonly bots: readonly string[];
    readonly avatar: string;
    readonly channelEmotes: readonly IChannelEmote[];
    readonly sharedEmotes: readonly ISharedEmote[];
}

export class BetterTwitchTVEmoteProvider implements IEmoteProvider {
    public readonly baseUrl: string;

    public constructor(baseUrl = 'https://api.betterttv.net') {
        this.baseUrl = baseUrl;
    }

    public async GetEmotesByChannelId(channelId: string): Promise<readonly IEmoteProviderEmote[]> {
        const { body } = await got<IUserResponse>({
            responseType: 'json',
            retry: { limit: 2 },
            url: `${this.baseUrl}/3/cached/users/twitch/${channelId}`,
        });

        return [...body.channelEmotes, ...body.sharedEmotes].map(({ code, id, imageType }) => ({
            id,
            name: code,
            url: `https://cdn.betterttv.net/emote/${id}/{{size}}x.${imageType}`,
        }));
    }
}
