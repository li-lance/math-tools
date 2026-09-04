# Math Tools Context

## Product mission

Math Tools is a browser-based collection of interactive demonstrations for primary-school mathematics classrooms in mainland China. It helps a teacher make an abstract mathematical idea visible and manipulable on a computer, projector, or interactive teaching display.

Mathematical clarity, classroom readability, and avoiding misleading representations take priority over decorative motion.

## Users and classroom setting

The primary user is a primary-school mathematics teacher. The teacher finds and prepares a case, then controls it during class. Students primarily watch and may interact directly with the shared teaching display. The primary hardware target is a teacher computer connected to a 16:9 projector or teaching display. Pointer and touch are first-class inputs, and key actions must also be usable with a keyboard.

## Domain vocabulary

### Case

A case is an independently runnable, interactive mathematics demonstration with a stated teaching objective, controlled parameters, and bounded interaction. A case is not a worksheet question, video, slide deck, or general-purpose document.

### Case definition

A case definition is the discoverable description and runtime entry point for a case. It provides a stable identity and route, Chinese metadata, classification, teaching guidance, validated defaults, URL state behavior, declared capabilities, a lazy runtime entry point, and teaching-review criteria.

### Teaching parameter

A teaching parameter is a mathematically meaningful state a teacher may want to reproduce, such as a fraction denominator, number-line interval, or solid's unfolding state. Supported teaching parameters may be represented in the URL.

### Ephemeral state

Ephemeral state records momentary interaction such as hover, an animation frame, or an intermediate camera drag. It remains inside a case and is not represented in the URL.

### Device preference

A device preference controls the local presentation environment rather than mathematical meaning. The application may store it locally through its settings service, but cases do not access browser persistence directly.

## Product experience

Teachers browse a searchable and filterable case library, read a case detail page, and enter a full-screen presentation through a stable URL. The mathematical stage occupies most of the presentation view. A large bottom control bar contains common actions and may be collapsed. Advanced case parameters use an expandable panel.

## First milestone

The first milestone establishes the case framework and three representative cases: a 3D geometry case, a draggable number-line case, and a fraction-partition case. They validate 3D, 2D direct manipulation, and parameterized discrete visual models. They do not represent complete curriculum coverage.

## Product rules

- Built-in cases are curated and implemented by developers through one case-definition interface.
- A case exposes bounded interactions that serve its teaching objective.
- No account or backend is required.
- A successful first load makes built-in cases available offline.
- Shareable teaching parameters may be encoded in the URL; ephemeral state is not.
- Device preferences may be stored locally through application-owned services.
- The first release uses simplified Chinese and general mainland-China primary-school mathematics terminology without binding to one textbook edition.
- The product collects no usage analytics, cookies, or student data.
- Cases do not make network requests.
- Key interactions support pointer, touch, and keyboard input.
- Mathematical distinctions are not communicated by color alone.

## Quality principles

Mathematical logic is tested independently from rendering wherever practical. Automated tests cover mathematical invariants, case contracts, interactions, and critical browser flows. Every case also receives a human teaching review covering its objective, terminology, parameter validity, readability, usability, and risk of visual or mathematical misinterpretation.

## Non-goals for the first release

- A general case or slide editor
- AI-generated cases
- Teacher, student, class, or school accounts
- Cloud persistence or cross-device synchronization
- Student-device participation or real-time rooms
- Assessment, grades, or learning analytics
- Third-party analytics or tracking
- Complete coverage of one textbook or the grades one-through-six curriculum
- A native desktop application
- A universal visualization DSL
- A content-management publishing workflow
