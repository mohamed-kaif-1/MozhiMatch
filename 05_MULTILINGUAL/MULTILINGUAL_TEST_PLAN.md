# Multilingual QA

| ID | Test | Expected behaviour | Status |
|---|---|---|---|
| I18N-01 | Flatten both dictionaries | Identical key paths and placeholder sets | Application test NOT RUN |
| I18N-02 | Switch locale while editing and reviewing | Raw source, selection and decisions preserved, document lang updated | NOT RUN |
| I18N-03 | Tamil longest labels at five widths | Wrap without clipping, 44px targets, no horizontal page scroll | NOT RUN |
| I18N-04 | NFC/NFD Tamil and combining marks | Raw text unchanged, safe evidence highlight | NOT RUN |
| I18N-05 | Mixed English/Tamil terms and initials | Explicit source field language retained, no destructive cleanup | NOT RUN |
| I18N-06 | Provider error in Tamil UI | Localized stable message and manual recovery | NOT RUN |
| I18N-07 | Screen-reader labels | Source languages and action labels intelligible, status announced once | NOT RUN |
| I18N-08 | Refresh | Locale retained, source/decisions/code cleared as documented | NOT RUN |

A fluent Tamil reviewer checks naturalness and domain terminology before release. Automated dictionary parity cannot establish translation quality. Provider explanation quality in both locales is assessed separately from equivalence accuracy. In a zero-API run, mock only the provider boundary and label those tests deterministic.
