# Generated TypeScript contract boundary

03_BACKEND/contracts.generated.ts is generated directly from the delivered canonical JSON schemas. It defines AnalyzeRequest, AnalyzeResponse, ErrorResponse and ProviderOutput. It can be copied or imported during implementation as a reference. Runtime Zod inference remains the application's eventual type source, and must accept/reject the same examples.

The declaration generator maps required properties, enums, arrays, nullable fields and literal constants. String length, patterns, exact-object excess-property behaviour on arbitrary values and cross-field coverage remain runtime validations. In particular, FieldRef kind/label compatibility is a semantic invariant after schema parsing. A TypeScript type cannot by itself prove source evidence correctness.

Documentation checks validate JSON Schema, OpenAPI equality and example evidence independently. The future app's Zod/TypeScript runtime parity and build tests remain NOT RUN. Do not report generated declarations as an implemented API.
