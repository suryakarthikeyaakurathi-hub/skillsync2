# SkillSync Firestore Access Control security_spec.md

This specification outlines the data invariants, potential attack vectors (the "Dirty Dozen"), and the corresponding security rule constructs that will protect our cloud-synchronized state.

---

## 1. Data Invariants & Zero-Trust Policies

*   **Identities (Students):**
    *   A student profile documents MUST only be writeable by the authenticated user matching `request.auth.uid`.
    *   Once set, immutable parameters (`id`, `email`) cannot be changed.
    *   All user profiles require standard size-enforces for strings and arrays.

*   **Projects:**
    *   Any authenticated developer student may create a Project.
    *   Only the verified project creator (`creatorId == request.auth.uid`) can edit, modify, or delete the project listing.
    *   Validation helpers must enforce structural formats on keys and sizes.

*   **Communities & Community Messages:**
    *   Communities are readable by any authenticated student.
    *   Message logs (under both chat threads and communities) can only be created by an authenticated user matching the message's `senderId`.

*   **Direct Message Threads:**
    *   Threads are discoverable and read-writeable by authenticated students wishing to collaborate.
    *   To prevent privilege escalation, senders can never spoof their `senderId` and must provide correct matching timestamps and tags.

---

## 2. The "Dirty Dozen" Logic Payloads

Below are twelve targeted malicious JSON payloads aimed to bypass conventional validation gates, and how our Fortress rules reject them:

1.  **Student Identity Hijack:**
    *   *Payload:* `{ id: "adversary-uid", name: "Sarah Jenkins" }` written to `/students/victim-uid`.
    *   *Rejection logic:* Blocked by checking `request.auth.uid == studentId`.

2.  **Unverified Profile Fabrication:**
    *   *Payload:* `{ id: "my-uid", email: "admin@gatech.edu", ... }` written by a user whose `email_verified` flag is `false`.
    *   *Rejection logic:* Blocked by checking `request.auth.token.email_verified == true`.

3.  **Ghost Field Injection (Shadow Update):**
    *   *Payload:* `{ idText: "...", name: "Suryakarthikeya", adminPrivilege: true }`
    *   *Rejection logic:* `affectedKeys().hasOnly()` or complete schema size checking matches valid keys list exactly.

4.  **PII Blanket Data Scraping:**
    *   *Payload:* Authenticated hacker requests `get` on a private user subcollection.
    *   *Rejection logic:* Denied by default unless explicitly verified owner.

5.  **Project Creator Spoofing:**
    *   *Payload:* `{ id: "proj-1", title: "Free Hackathon", creatorId: "another-hacker" }` created by user `my-uid`.
    *   *Rejection logic:* Blocked by checking `incoming().creatorId == request.auth.uid`.

6.  **Immutable Field Overwrite:**
    *   *Payload:* Updating project `creatorId` after creation to lock out original creator.
    *   *Rejection logic:* Enforce `incoming().creatorId == existing().creatorId`.

7.  **Resource Exhaustion (Denial of Wallet):**
    *   *Payload:* Inundating a 1.2MB JSON string in the `bio` property of a student profile.
    *   *Rejection logic:* Rigid `.size() <= 400` constraint on string bio.

8.  **Empty Array Overrun:**
    *   *Payload:* Appending massive nested lists in the `skills` array.
    *   *Rejection logic:* Enforcing `skills.size() <= 20` bounds limit.

9.  **Relational Orphan Write:**
    *   *Payload:* Creating a message under a non-existent threat thread id.
    *   *Rejection logic:* Verifying `exists(/databases/$(database)/documents/threads/$(threadId))` on message creation.

10. **State Shortcutting / Workflow Bypass:**
    *   *Payload:* Forcefully updating a project's status from "Idea" to "Completed" while modifying unauthorized fields.
    *   *Rejection logic:* Actions-based check enforcing strictly separated update paths.

11. **Sender ID Spoof (Message Tab):**
    *   *Payload:* `{ senderId: "fake-id", text: "Malicious DM" }` written to a thread.
    *   *Rejection logic:* Enforcing `incoming().senderId == request.auth.uid`.

12. **Future Timestamp Inject:**
    *   *Payload:* Message created with a client-side falsified timestamp parameter.
    *   *Rejection logic:* Strict verification that `incoming().timestamp == request.time` or matching pattern bounds.

---

## 3. Fortress Rule Architecture Map

We will construct `/firestore.rules` containing highly modular, rigorous helpers following the Eight Pillars:
- Global Safety Net default closed.
- Identity verification checking `email_verified == true`.
- Strong relational `isValidId(...)` guards.
