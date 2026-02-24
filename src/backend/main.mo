import Map "mo:core/Map";
import Nat64 "mo:core/Nat64";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Blob "mo:core/Blob";
import Storage "blob-storage/Storage";
import List "mo:core/List";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Data migration: Return new version on upgrade (invisible for users)

actor {
  // Initialize the user system state to store authentication information
  let accessControlState = AccessControl.initState();

  type OldMediaEntry = {
    id : Nat64;
    title : Text;
    mediaType : MediaType;
    rating : ?Nat;
    review : ?Text;
    dateAdded : Time.Time;
    owner : Principal;
  };

  type MediaType = {
    #movie;
    #tvShow;
    #videoGame;
  };

  public type Image = { #embedded : Blob; #external : Storage.ExternalBlob };

  type MediaEntry = {
    id : Nat64;
    title : Text;
    mediaType : MediaType;
    rating : ?Nat;
    review : ?Text;
    dateAdded : Time.Time;
    owner : Principal;
    image : ?Image;
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

  // Use the StorageMixin for persistent storage access
  include MixinStorage();

  let mediaEntries = Map.empty<Nat64, MediaEntry>();
  let userShares = Map.empty<Principal, [Principal]>();
  let shareLinks = Map.empty<Nat64, ShareLink>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  // New banner photo system
  var bannerPhoto : ?Storage.ExternalBlob = null;
  // New reactions feature state
  let reviewReactions = Map.empty<Nat64, Map.Map<Text, [Principal]>>();
  // Community content page state
  let officialRecommendations = Map.empty<Nat64, MediaEntry>();

  // Include authentication system from 'MixinAuthorization.mo'
  include MixinAuthorization(accessControlState);

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

  public query ({ caller }) func getBannerPhoto() : async ?Storage.ExternalBlob {
    bannerPhoto;
  };

  public shared ({ caller }) func setBannerPhoto(newBanner : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can change banner photo");
    };

    bannerPhoto := ?newBanner;
  };

  // New Community content page functions

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

  public query ({ caller }) func getAllOfficialRecommendations() : async [MediaEntry] {
    officialRecommendations.values().toArray();
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

  // Outstanding Loan functions

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
      image = null;
    };

    mediaEntries.add(nextMediaId, mediaEntry);
    nextMediaId += 1;
    mediaEntry.id;
  };

  public shared ({ caller }) func addImageToMediaEntry(_contentType : Text, mediaId : Nat64, image : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add images");
    };

    let entry = switch (mediaEntries.get(mediaId)) {
      case (null) { Runtime.trap("Media entry does not exist") };
      case (?entry) { entry };
    };

    if (entry.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You can only add images to your own entries");
    };

    let entryWithImage = { entry with image = ?#external(image) };
    mediaEntries.add(mediaId, entryWithImage);
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
