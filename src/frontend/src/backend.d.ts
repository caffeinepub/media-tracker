import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface MediaEntry {
    id: bigint;
    review?: string;
    title: string;
    owner: Principal;
    mediaType: MediaType;
    rating?: bigint;
    image?: Image;
    dateAdded: Time;
}
export type Image = {
    __kind__: "embedded";
    embedded: Uint8Array;
} | {
    __kind__: "external";
    external: ExternalBlob;
};
export interface EmojiReaction {
    count: bigint;
    emoji: string;
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
    addImageToMediaEntry(_contentType: string, mediaId: bigint, image: ExternalBlob): Promise<void>;
    addReaction(reviewId: bigint, emoji: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createMediaEntry(title: string, mediaType: MediaType, rating: bigint | null, review: string | null): Promise<bigint>;
    getAllOfficialRecommendations(): Promise<Array<MediaEntry>>;
    getAllReviews(): Promise<Array<MediaEntry>>;
    getBannerPhoto(): Promise<ExternalBlob | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMediaEntriesByShareLink(shareLinkId: bigint): Promise<Array<MediaEntry>>;
    getMediaEntriesByUser(user: Principal): Promise<Array<MediaEntry>>;
    getReactionCounts(reviewId: bigint): Promise<Array<EmojiReaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeReaction(reviewId: bigint, emoji: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setBannerPhoto(newBanner: ExternalBlob): Promise<void>;
}
