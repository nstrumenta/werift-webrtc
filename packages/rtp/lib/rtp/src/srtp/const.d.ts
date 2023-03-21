export declare const ProtectionProfileAes128CmHmacSha1_80: 1;
export declare const ProtectionProfileAeadAes128Gcm: 7;
export type Profile = typeof ProtectionProfileAes128CmHmacSha1_80 | typeof ProtectionProfileAeadAes128Gcm;
export declare const keyLength: (profile: Profile) => number;
export declare const saltLength: (profile: Profile) => 12 | 14;
