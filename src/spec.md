# Specification

## Summary
**Goal:** Add a Community Reviews page where users can view all reviews from all users in a unified social feed, with emoji reactions for each review.

**Planned changes:**
- Create new /community route displaying all users' reviews in chronological order
- Add "Community Reviews" navigation link in header
- Display each review as a card with media title, type badge, rating bar, review text, reviewer name, date, and auto-fetched media image
- Implement emoji reaction bar (👍 ❤️ 😂 😮 😢 🔥) under each review with real-time count updates
- Store reactions in backend database, preventing duplicate reactions per user per emoji
- Style page to match existing dark theme with cinematic aesthetic
- Create backend endpoint to fetch all reviews across all users

**User-visible outcome:** Users can browse a community feed of all reviews from all users, see auto-fetched images for each media item, and react to reviews with emojis that update counts instantly without page refresh.
