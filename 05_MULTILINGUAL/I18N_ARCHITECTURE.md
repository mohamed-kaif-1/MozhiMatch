# Internationalisation architecture

Use next-intl NextIntlClientProvider with locale and messages on a single route. Initial server-rendered locale is English. After mount read the allowlisted localStorage bmcq.locale and update the provider and document.documentElement.lang. This avoids reading browser storage on the server. Preserve the workbench reducer across locale switches.

Runtime messages are copied from en.json and ta.json to src/messages. Augment message types from English to catch invalid keys. Every interface string, accessible name, error and loading state uses a key. Source text, model text and user IDs are data, not translation keys. Do not translate them silently. Common terms such as English, தமிழ் and AI remain intentionally familiar.

Missing translations fallback to the English message in development and create a development warning without source content. The coverage test fails a missing key or placeholder mismatch before release. Production should never expose a raw key. There is no geo-IP, browser-language requirement or locale network service.

UI locale travels in AnalyzeRequest to control the explanation language. Input fields stay explicitly en and ta even in Tamil UI. Code-mixed text is accepted as data and an ambiguous meaning should produce uncertain. Locale switches do not rerun inference. A reviewer wanting a new explanation language explicitly reruns the current source after confirmation that cloud processing will occur.
