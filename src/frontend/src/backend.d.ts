import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface MediaEntry {
    id: bigint;
    review?: string;
    title: string;
    owner: Principal;
    mediaType: MediaType;
    rating?: bigint;
    dateAdded: Time;
}
export interface UserProfile {
    name: string;
}
export enum MediaType {
    movie = "movie",
    videoGame = "videoGame",
    tvShow = "tvShow"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createMediaEntry(title: string, mediaType: MediaType, rating: bigint | null, review: string | null): Promise<bigint>;
    deleteMediaEntry(id: bigint): Promise<void>;
    generateShareLink(expiryTime: Time | null): Promise<bigint>;
    /**
     * / This functionality is implemented in the frontend. Motoko cannot directly access the file system.
     * / Implemented as query to indicate large response to TypeScript (up to 2MB allowed)
     */
    getAllProjectFilesZipBlob(): Promise<Uint8Array>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMediaEntriesByShareLink(shareLinkId: bigint): Promise<Array<MediaEntry>>;
    getMediaEntriesByUser(user: Principal): Promise<Array<MediaEntry>>;
    getMyMediaEntries(): Promise<Array<MediaEntry>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    grantAccessToUser(friend: Principal): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    revokeAccessFromUser(friend: Principal): Promise<void>;
    revokeShareLink(shareLinkId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateMediaEntry(id: bigint, title: string, mediaType: MediaType, rating: bigint | null, review: string | null): Promise<void>;
}
