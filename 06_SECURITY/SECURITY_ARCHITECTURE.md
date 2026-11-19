# Security architecture

Protect the single server boundary and avoid unnecessary user identity. No end-user accounts exist. Hosted live AI uses a private operator capability code and exact owned-sample allowlisting. The code is entered privately, held in memory and sent in X-Demo-Code. It is not an account password or embedded client secret. Hash both supplied and expected code to fixed-length SHA-256 buffers and compare with timingSafeEqual. Enforce a minimum configured secret length. Never log its value.

Validate exact Origin against APP_ORIGIN before AI processing. Reject missing Origin on analyze in hosted mode. Browser clients cannot bypass code/sample validation even if they emulate an Origin header. GET health returns safe configuration only. There is no permissive CORS middleware or cross-origin service.

Bound the actual request stream to 64,000 UTF-8 bytes. Reject non-JSON before parsing. Strict schemas disallow unknown properties. Use plaintext rendering for source, model explanations and copied reports. No user-controlled fetch URL, file parser, template execution, markdown rendering or tool invocation exists.

Import server-only in key-bearing modules. Search production assets for a secret-shaped canary during security testing, without inserting a real credential into source. .env.local and evaluation transcripts containing sensitive content are ignored by Git. A no-secrets check operates on filenames/patterns and never prints candidate secret values.

A process-local throttle is best-effort only because serverless instances are independent. Keep live deployment code private and use a free provider project without billing. Monitor metadata and disable AI_MODE if abuse occurs. A permanent public production service would need stronger distributed quota controls, private-content handling and user research. Those are outside this personal demo.
