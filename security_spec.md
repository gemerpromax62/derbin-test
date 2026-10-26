# Security Specification (Phase 0: Payload-First Security TDD)

## 1. Data Invariants
1. **Default-Deny Catch-All**: No document outside explicitly matched paths (`/users/{userId}`, `/users/{userId}/private/{docId}`, `/users/{userId}/configs/{configId}`) can ever be read or written.
2. **Verified Identity & Ownership**: Every write operation requires an authenticated user with `request.auth.token.email_verified == true` whose `request.auth.uid` strictly matches both the path `{userId}` and the payload `uid` field.
3. **PII Isolation (Split Collection)**: User email addresses are isolated inside `/users/{userId}/private/info` and are never stored in `/users/{userId}`. Access to `/users/{userId}` and `/users/{userId}/private/{docId}` is strictly limited to `isOwner(userId)`.
4. **Master Gate Relational Sync**: A `ProxyConfig` document in `/users/{userId}/configs/{configId}` can only be read, created, updated, or deleted if the parent `/users/{userId}` document exists and belongs to `request.auth.uid`.
5. **Anti-Update-Gap & Immutable Fields**: All `create` and `update` rules wrap logic with `isValidUserProfile`, `isValidUserPrivateInfo`, or `isValidProxyConfig`. Immutable fields (`uid`, `createdAt`) cannot be modified on `update`, and timestamps (`createdAt`, `updatedAt`) must match `request.time`.

## 2. The "Dirty Dozen" Payloads
1. **Unverified Email Write**: Authenticated user with `email_verified: false` attempts to create `/users/user_1`. -> `PERMISSION_DENIED`
2. **Identity Spoofing on Profile Create**: User `user_1` attempts to create `/users/user_1` with `uid: "user_2"`. -> `PERMISSION_DENIED`
3. **Cross-User Profile Read (PII/Profile Leak)**: User `user_2` attempts `get` on `/users/user_1`. -> `PERMISSION_DENIED`
4. **Cross-User Private Email Read**: User `user_2` attempts `get` on `/users/user_1/private/info`. -> `PERMISSION_DENIED`
5. **Shadow Field Injection on Profile**: User `user_1` sends valid `UserProfile` plus `"isAdmin": true`. -> `PERMISSION_DENIED`
6. **Value Poisoning on Update**: User `user_1` updates `displayName` to a 500-character string (exceeding `maxLength: 60`). -> `PERMISSION_DENIED`
7. **Invalid Enum State Injection**: User `user_1` sets `subscriptionPlan: "godmode"` (not in `["free", "30d", "90d", "lifetime"]`). -> `PERMISSION_DENIED`
8. **Forged Client Timestamp**: User `user_1` creates a profile with a past `createdAt` timestamp not equal to `request.time`. -> `PERMISSION_DENIED`
9. **Immutable Field Mutation**: User `user_1` attempts to change `createdAt` or `uid` during an `update` on `/users/user_1`. -> `PERMISSION_DENIED`
10. **Orphaned Subcollection Write**: User `user_1` attempts to create `/users/user_1/configs/cfg_1` before `/users/user_1` exists. -> `PERMISSION_DENIED`
11. **Path ID Poisoning**: User `user_1` attempts to create `/users/user_1/configs/invalid$id!@#` failing `isValidId()`. -> `PERMISSION_DENIED`
12. **Out-of-Bounds Numeric Telemetry**: User `user_1` creates a `ProxyConfig` with `pingSpoofMs: 9999` (exceeding max `120`). -> `PERMISSION_DENIED`
