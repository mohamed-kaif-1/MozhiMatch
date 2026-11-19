# Translation key specification

Canonical dictionaries have identical nested keys in en.json and ta.json. Namespaces are app, nav, editor, actions, privacy, status, review, reason, rules and errors. Application error codes map to errors.invalidRequest/bodyTooLarge/unsupportedMedia/forbiddenOrigin/unauthorizedDemo/demoRestricted/consentRequired/rateLimited/internal. Provider warning codes map to errors.aiDisabled/aiUnavailable/aiTimeout/aiInvalid/unsupportedContent.

Allowed placeholders are {label}, {count} and {id} in their matching keys. Both locales must contain the same placeholder set at each key. Pass plain primitive values, not HTML. The supplied phrases intentionally avoid ICU plural branching so the same count template works for the small batch limit. If plural rules are added later, validate every locale path and example.

No hardcoded status text is allowed inside components. ReasonCode maps to reason keys, rule code maps to rules keys, and final status maps to status keys. The stored locale is a safe enum. User source and free model explanations must never be interpreted as a message path or JSX fragment.

Add a key only when there is a real control or state. Remove unused copy at the same time as removing a feature. The audit tool checks delivered key and placeholder parity. Runtime integration remains a separate test.
