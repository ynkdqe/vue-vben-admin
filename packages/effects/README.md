## Effects 目录

`effects` Directories are designed to store code and logic related to slight coupling. If your package has the following features, it is recommended to place it in the `effects` directory:

-**State Management**: Use the state management framework `pinia` and contains the part that handles side effects (such as asynchronous operations, API calls).
-**User Preferences**: Use `@vben-core/preferences` to handle user preferences, involving local storage or browser cache logic (such as using `localStorage`).
-**Navigation and routing**: To handle navigation, page jumps and other scenarios, it is necessary to manage the logic of routing changes.
-**Component library dependencies**: Contains parts that are tightly coupled to specific component libraries or rely on large repositories.

By classifying the relevant code into the `effects` directory, the project structure can be clearer and easy to maintain and expand.
