import Map "mo:core/Map";
import Nat64 "mo:core/Nat64";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Blob "mo:core/Blob";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type MediaType = {
    #movie;
    #tvShow;
    #videoGame;
  };

  type MediaEntry = {
    id : Nat64;
    title : Text;
    mediaType : MediaType;
    rating : ?Nat;
    review : ?Text;
    dateAdded : Time.Time;
    owner : Principal;
  };

  type ShareLink = {
    id : Nat64;
    owner : Principal;
    expiresAt : ?Time.Time;
  };

  public type UserProfile = {
    name : Text;
  };

  public type EmojiReaction = {
    emoji : Text;
    count : Nat;
  };

  var nextMediaId : Nat64 = 0;
  var nextShareLinkId : Nat64 = 0;

  let mediaEntries = Map.empty<Nat64, MediaEntry>();
  let userShares = Map.empty<Principal, [Principal]>();
  let shareLinks = Map.empty<Nat64, ShareLink>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // New reactions feature state
  let reviewReactions = Map.empty<Nat64, Map.Map<Text, [Principal]>>();

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Media entry management functions
  public shared ({ caller }) func createMediaEntry(title : Text, mediaType : MediaType, rating : ?Nat, review : ?Text) : async Nat64 {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create media entries");
    };

    let mediaEntry : MediaEntry = {
      id = nextMediaId;
      title;
      mediaType;
      rating;
      review;
      dateAdded = Time.now();
      owner = caller;
    };

    mediaEntries.add(nextMediaId, mediaEntry);
    nextMediaId += 1;
    mediaEntry.id;
  };

  public query ({ caller }) func getMediaEntriesByUser(user : Principal) : async [MediaEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view media entries");
    };

    let filteredEntries = mediaEntries.values().toArray().filter(
      func(entry) {
        entry.owner == user;
      }
    );

    if (caller == user) {
      return filteredEntries;
    };

    switch (userShares.get(user)) {
      case (?sharedWithList) {
        if (sharedWithList.values().contains(caller)) {
          return filteredEntries;
        };
      };
      case (null) {};
    };

    if (AccessControl.isAdmin(accessControlState, caller)) {
      return filteredEntries;
    };

    Runtime.trap("Not authorized to view these entries");
  };

  public query func getMediaEntriesByShareLink(shareLinkId : Nat64) : async [MediaEntry] {
    switch (shareLinks.get(shareLinkId)) {
      case (?link) {
        switch (link.expiresAt) {
          case (?expiry) {
            if (Time.now() > expiry) {
              Runtime.trap("Share link has expired");
            };
          };
          case (null) {};
        };

        return mediaEntries.values().toArray().filter(
          func(entry) {
            entry.owner == link.owner;
          }
        );
      };
      case (null) { Runtime.trap("Invalid share link") };
    };
  };

  public shared ({ caller }) func grantAccessToUser(friend : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can grant access");
    };

    if (friend.isAnonymous()) {
      Runtime.trap("Cannot grant access to anonymous principal");
    };

    let existingArray = switch (userShares.get(caller)) {
      case (?arr) { arr };
      case (null) { [] };
    };

    if (existingArray.values().contains(friend)) {
      Runtime.trap("Already granted access to this user");
    };

    let newArray = existingArray.concat([friend]);
    userShares.add(caller, newArray);
  };

  public shared ({ caller }) func revokeAccessFromUser(friend : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can revoke access");
    };

    switch (userShares.get(caller)) {
      case (?array) {
        let newArray = array.filter(func(p : Principal) : Bool { p != friend });
        userShares.add(caller, newArray);
      };
      case (null) {
        Runtime.trap("No access grants found");
      };
    };
  };

  public shared ({ caller }) func generateShareLink(expiryTime : ?Time.Time) : async Nat64 {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate share links");
    };

    switch (expiryTime) {
      case (?expiry) {
        if (expiry <= Time.now()) {
          Runtime.trap("Expiry time must be in the future");
        };
      };
      case (null) {};
    };

    let shareLink : ShareLink = {
      id = nextShareLinkId;
      owner = caller;
      expiresAt = expiryTime;
    };

    shareLinks.add(nextShareLinkId, shareLink);
    nextShareLinkId += 1;
    shareLink.id;
  };

  public shared ({ caller }) func revokeShareLink(shareLinkId : Nat64) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can revoke share links");
    };

    switch (shareLinks.get(shareLinkId)) {
      case (?link) {
        if (link.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("You can only revoke your own share links");
        };
        shareLinks.remove(shareLinkId);
      };
      case (null) {
        Runtime.trap("Share link does not exist");
      };
    };
  };

  public shared ({ caller }) func updateMediaEntry(id : Nat64, title : Text, mediaType : MediaType, rating : ?Nat, review : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update entries");
    };

    switch (mediaEntries.get(id)) {
      case (?existingEntry) {
        if (existingEntry.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("You can only modify your own entries");
        };

        let updatedEntry : MediaEntry = {
          id;
          title;
          mediaType;
          rating;
          review;
          dateAdded = existingEntry.dateAdded;
          owner = existingEntry.owner;
        };

        mediaEntries.add(id, updatedEntry);
      };
      case (null) { Runtime.trap("Entry does not exist") };
    };
  };

  public shared ({ caller }) func deleteMediaEntry(id : Nat64) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete entries");
    };

    switch (mediaEntries.get(id)) {
      case (?entry) {
        if (entry.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("You can only delete your own entries");
        };

        mediaEntries.remove(id);
      };
      case (null) { Runtime.trap("Entry does not exist") };
    };
  };

  public query ({ caller }) func getMyMediaEntries() : async [MediaEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their entries");
    };

    mediaEntries.values().toArray().filter(
      func(entry) {
        entry.owner == caller;
      }
    );
  };

  /// This functionality is implemented in the frontend. Motoko cannot directly access the file system.
  /// Implemented as query to indicate large response to TypeScript (up to 2MB allowed)
  public query ({ caller }) func getAllProjectFilesZipBlob() : async Blob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can download project source files");
    };
    Runtime.trap("Functionality is TypeScript only. Please remove Motoko code and 'dfx deploy' again.");
  };

  // New Backend functionality for community page and emoji reactions

  public query ({ caller }) func getAllReviews() : async [MediaEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view reviews");
    };

    let entries = mediaEntries.values();
    entries.toArray().filter(
      func(entry) {
        switch (entry.review) {
          case (?text) { text.size() > 0 };
          case (null) { false };
        };
      }
    );
  };

  public shared ({ caller }) func addReaction(reviewId : Nat64, emoji : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add reactions");
    };

    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot add reactions");
    };

    switch (mediaEntries.get(reviewId)) {
      case (null) { Runtime.trap("Review does not exist") };
      case (?_) {};
    };

    let reviewReactionMap = switch (reviewReactions.get(reviewId)) {
      case (?map) { map };
      case (null) {
        let newMap = Map.empty<Text, [Principal]>();
        reviewReactions.add(reviewId, newMap);
        newMap;
      };
    };

    let existingReactions = switch (reviewReactionMap.get(emoji)) {
      case (?arr) { arr };
      case (null) { [] };
    };

    if (existingReactions.values().contains(caller)) {
      Runtime.trap("You have already added this reaction");
    };

    let newReactions = existingReactions.concat([caller]);
    reviewReactionMap.add(emoji, newReactions);
  };

  public query ({ caller }) func getReactionCounts(reviewId : Nat64) : async [EmojiReaction] {
    switch (mediaEntries.get(reviewId)) {
      case (null) { Runtime.trap("Review does not exist") };
      case (?_) {};
    };

    let reactionsMap = switch (reviewReactions.get(reviewId)) {
      case (?map) { map };
      case (null) { Map.empty<Text, [Principal]>() };
    };

    let coreEmojis = ["👍", "❤️", "😂", "😮", "😢", "🔥"];
    coreEmojis.map(
      func(emoji) {
        let count = switch (reactionsMap.get(emoji)) {
          case (?arr) { arr.size() };
          case (null) { 0 };
        };
        {
          emoji;
          count;
        };
      }
    );
  };

  public query ({ caller }) func hasUserReacted(reviewId : Nat64, emoji : Text) : async Bool {
    switch (reviewReactions.get(reviewId)) {
      case (?reactionMap) {
        switch (reactionMap.get(emoji)) {
          case (?userArray) {
            return userArray.values().contains(caller);
          };
          case (null) { return false };
        };
      };
      case (null) { return false };
    };
  };

  public shared ({ caller }) func removeReaction(reviewId : Nat64, emoji : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can remove reactions");
    };

    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot remove reactions");
    };

    switch (mediaEntries.get(reviewId)) {
      case (null) { Runtime.trap("Review does not exist") };
      case (?_) {};
    };

    switch (reviewReactions.get(reviewId)) {
      case (?reviewMap) {
        switch (reviewMap.get(emoji)) {
          case (?userArray) {
            if (userArray.values().contains(caller)) {
              let updatedArray = userArray.filter(func(user) { user != caller });
              reviewMap.add(emoji, updatedArray);
              return;
            } else {
              Runtime.trap("You have not added this reaction");
            };
          };
          case (null) { Runtime.trap("Reaction does not exist") };
        };
      };
      case (null) { Runtime.trap("Reaction does not exist") };
    };
  };
};
