# Project Requirements Document for trAIner AI Fitness App

## 1. Project Overview

trAIner is an all-in-one AI-driven fitness app that generates personalized workout plans and macro goals based on user demographics, fitness preferences, and progress data. The app integrates cutting-edge AI models to search for exercise research, generate custom workout routines, and calculate tailored nutritional recommendations. Using modern technologies like Supabase for authentication and data storage, Perplexity AI for exercise research, and the OpenAI API for plan generation, trAIner fills the gap for fitness enthusiasts seeking a smart, adaptable solution that grows with their personal fitness journey.

We are building trAIner to simplify and enhance the fitness planning experience for users ranging from beginners to advanced athletes. The key objectives are to ensure secure authentication, provide a seamless user-friendly interface, and deliver workout and nutritional recommendations that adapt in real-time to evolving goals. Success will be measured by user engagement, the accuracy and personalization of the workout plans, and the ability to scale the platform for future measurements such as wearables integration and community features.

## 2. In-Scope vs. Out-of-Scope

**In-Scope:**

*   Secure user authentication and account management using Supabase Auth.

*   Comprehensive user profile setup capturing demographics, fitness preferences, and goals (including options for imperial/metric units).

*   Dynamic dashboard interface featuring key workout metrics, workout plan generation, logs, and progress tracking.

*   AI-driven workout plan generation with a two-step integration:

    *   Perplexity AI for exercise and research lookup.
    *   OpenAI API (ChatGPT) for generating personalized workout routines.

*   Hybrid workout plan review and editing, supporting both manual changes and AI-assisted modifications via natural language.

*   Automatic macro calculation based on user demographics and activity levels with clear hooks for future nutritional tracking.

*   Functionality to export and import workout plans in XLSX, PDF, CSV, and Google Sheets formats.

*   Configurable notification system (mobile push, SMS, email, and in-app alerts) based on user choice.

*   Secure data storage separating user-specific data in Supabase from anonymized records in a general memory bank.

**Out-of-Scope:**

*   Advanced nutritional tracking integrations (beyond basic macro calculation) beyond using MyFitnessPal as an alternative.
*   Integration of wearables or health tracking devices in the initial release.
*   Community features such as user forums, group workouts, or social sharing.
*   Multi-language support and advanced gamification elements for this version.
*   Complex roles and permissions (only a single user type is supported for now).

## 3. User Flow

A new user lands on a sleek, modern landing page that showcases the app's dark mode default with vibrant electric blue accents. They are prompted to sign up by entering their name, email, and password, with all data securely handled via Supabase Auth. After signing up, the user is guided through an easy-to-follow onboarding process that includes filling out detailed profile information—covering demographics (height, weight, age, gender, disabilities), fitness preferences (exercise types, equipment, workout frequency), and specific fitness goals. Once the profile is complete, the user is taken to a dynamic dashboard where key metrics like upcoming workouts, workout logs, and macro progress are clearly displayed.

For returning users, the login flow is simple and secure. On the dashboard, users can choose to generate a workout plan by clicking a dedicated button. This triggers a two-step AI integration: first, Perplexity AI fetches exercise research from reputable sources, and then the OpenAI API combines these insights with the user’s data to craft a personalized workout regimen. Once generated, the workout plan appears on the dashboard, where users can review, manually edit, or use natural language inputs to ask for AI-driven improvements. Periodic bi-weekly check-ins remind users to log progress, and all new data updates the workout plans and macro calculations, ensuring the app stays in sync with evolving fitness goals.

## 4. Core Features

*   **User Authentication & Account Management:**

    *   Secure signup and login using Supabase Auth.
    *   Logout functionality and account management capabilities.

*   **User Profile Setup & Personalization:**

    *   Detailed profile input for demographics and fitness preferences.
    *   Options to choose unit systems (imperial/metric).
    *   Editable fields for personal details, workout style, and goals.

*   **Dynamic Dashboard:**

    *   Consistent header/navbar with app branding and hamburger navigation.
    *   Tabs for home overview, workout plan generation, workout logs, and profile management.
    *   Use of charts and graphs for visualizing workout and macro progress.

*   **AI-Driven Workout Plan Generation:**

    *   Two-step process: Perplexity AI for exercise research and OpenAI API (ChatGPT) for personalized plan creation.
    *   Detailed workout plans with exercise selection, technique notes, and scheduling.
    *   Storage of plans and versioning in Supabase along with non-personalized memory bank.

*   **Plan Review & Editing:**

    *   Display of generated plan with options to accept or request edits.
    *   Hybrid approach for manual adjustments or AI-assisted natural language edits.
    *   Immediate updates and persistent saving of edits.

*   **Macro Goals & Nutritional Tracking:**

    *   Automatic calculation of macros (BMR, adjustments based on activity).
    *   Dashboard display of nutritional goals.
    *   Basic macro calculator with hooks for future nutritional tracking enhancements.

*   **Progress & Check-in System:**

    *   Bi-weekly and final check-ins for workout logging and progress analysis.
    *   Generation of personalized AI feedback reports.
    *   Storage of progress data with version history.

*   **Export/Import Functionality:**

    *   Options for exporting workout plans in XLSX, PDF, CSV formats and Google Sheets integration.
    *   Import feature with reliable parsing to integrate data back into the dashboard.

*   **Notification System:**

    *   Customizable notification delivery (mobile push, email, SMS, in-app alerts) based on user preferences.
    *   Reminders for workout days, macro tracking, and progress logging.

## 5. Tech Stack & Tools

*   **Frontend:**

    *   React using V0 by Vercel for component building and dynamic UI.
    *   Modern design principles with responsive styling and dark/light mode support.

*   **Backend:**

    *   Node.js server environment.
    *   Supabase for authentication services and database storage.

*   **AI & API Integrations:**

    *   Perplexity AI for exercise research and data collection.
    *   OpenAI API (ChatGPT via GPT o1) for generating personalized workout plans.
    *   Claude 3.7 Sonnet for potential advanced reasoning tasks.

*   **Development Tools:**

    *   Cursor: Advanced IDE for real-time coding support and suggestions.
    *   Integration with Git-based version control.
    *   Plugin integrations as needed for debugging and testing.

## 6. Non-Functional Requirements

*   **Performance:**

    *   Ensure fast response times for authentication, page loads, and AI plan generation.
    *   Minimal latency when querying Supabase and integrating AI responses.

*   **Security:**

    *   Use end-to-end encryption for data in transit and at rest.
    *   Comply with GDPR, CCPA, and other relevant privacy regulations.
    *   Secure API keys and access tokens; audit and update security protocols on a regular schedule.

*   **Usability:**

    *   Responsive and intuitive UI with dark and light mode capabilities.
    *   Clear visual feedback for user actions (e.g., form submissions, plan edits).
    *   Accessibility standards with high-contrast color schemes and adjustable text sizes.

*   **Reliability:**

    *   Robust error handling for failed API calls or network interruptions.
    *   Automated backups for user data and version history in Supabase.

## 7. Constraints & Assumptions

*   **Constraints:**

    *   Dependency on third-party APIs (Supabase, Perplexity AI, OpenAI API) which must have high availability.
    *   Strict security and privacy requirements necessitate regular audits and updates.
    *   Performance can be impacted by API rate limits and network latency; proper error-handling and fallback mechanisms are needed.

*   **Assumptions:**

    *   All users are anticipated to have similar roles (single user type), with potential for future role expansion.
    *   The provided UI/UX guidelines (dark mode default, electric blue accents, clean modern sans-serif fonts) will be adhered to across all screens.
    *   The system will be built to accommodate future integrations with wearables, nutritional tracking, and community features without major architectural changes.
    *   Users will prefer and choose notification methods based on their individual needs, and the system’s flexibility in this regard is critical.

## 8. Known Issues & Potential Pitfalls

*   **API Rate Limits:**

    *   Third-party AI integrations (OpenAI and Perplexity AI) might have rate limits; caching and request throttling strategies should be implemented.

*   **Data Privacy & Security:**

    *   Ensuring compliance with all data protection regulations could require ongoing reviews and audits.
    *   Proper encryption protocols must be maintained; a breach in security can lead to data loss or reputation harm.

*   **Real-Time Updates:**

    *   Handling dynamic updates to workout plans and macro calculations in real-time can be complex and requires efficient state management.
    *   Testing for edge cases where user input changes rapidly (such as simultaneous edits) is essential.

*   **Export/Import Parsing:**

    *   File parsing for importing workout plans (especially from CSV or Google Sheets) can be error-prone.
    *   Validation rules and clear error messages need to be implemented to guide users through the import process.

*   **User Experience Consistency:**

    *   Integrating multiple notification types while respecting user preferences can lead to inconsistencies if not properly managed.
    *   Clear guidelines and test cases should be in place to ensure smooth transitions between manual and AI-assisted editing modes.

This document is intended to serve as the single source of truth for the trAIner AI Fitness App and should be used as the foundation for subsequent technical documents exploring the tech stack, frontend design, backend architecture, and implementation plans. The description provided herein leaves no room for guesswork and establishes clear expectations for functionality, performance, and scalability moving forward.
