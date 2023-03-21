export declare class SrtpContext {
    srtpProfile?: Profile;
    static findMatchingSRTPProfile(remote: Profile[], local: Profile[]): 1 | 7 | undefined;
}
export declare const ProtectionProfileAes128CmHmacSha1_80: 1;
export declare const ProtectionProfileAeadAes128Gcm: 7;
export declare const Profiles: readonly [1, 7];
export type Profile = (typeof Profiles)[number];
