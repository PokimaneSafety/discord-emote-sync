export interface IEmoteProviderEmote {
    readonly id: string;
    readonly name: string;
    readonly url: string;
}

export interface IEmoteProvider {
    GetEmotesByChannelId(channelId: string): Promise<readonly IEmoteProviderEmote[]>;
}
