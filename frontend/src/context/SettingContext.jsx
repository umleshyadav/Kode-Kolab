// Importing necessary hooks from React
import { createContext, useEffect, useState } from "react"

// Importing PropTypes to validate prop types for the provider component
import PropTypes from "prop-types"

// Importing a custom hook `useLocalStorage` to handle getting items from browser local storage
import useLocalStorage from "../hooks/useLocalStorage"

// Creating a new React context object that will hold the settings state and functions
const SettingContext = createContext()

// Declaring default settings that will be used if nothing is found in localStorage
const defaultSettings = {
    theme: "Dracula",                // Default theme name
    language: "Javascript",          // Default language for the editor
    fontSize: "16",                  // Default font size for code editor
    fontFamily: "Space Mono",        // Default font family
    showGitHubCorner: true,          // Boolean flag to show/hide GitHub corner ribbon
}

// Creating the context provider component to wrap child components and provide settings data
function SettingContextProvider({ children }) {
    const { getItem } = useLocalStorage()
    // Destructuring getItem from custom useLocalStorage hook to read from local storage

    const storedSettings = JSON.parse(getItem("settings")) || {}
    // Reading and parsing the stored "settings" object from localStorage
    // If null or empty, fallback to an empty object to avoid crashes

    // Extract each setting from storedSettings or fall back to defaultSettings if undefined

    const storedTheme =
        storedSettings.theme !== undefined
            ? storedSettings.theme
            : defaultSettings.theme
    // Check if a stored theme exists; if yes, use it; otherwise, fall back to the default theme

    const storedLanguage =
        storedSettings.language !== undefined
            ? storedSettings.language
            : defaultSettings.language
    // Same logic as above for programming language preference

    const storedFontSize =
        storedSettings.fontSize !== undefined
            ? storedSettings.fontSize
            : defaultSettings.fontSize
    // Same for font size used in the code editor

    const storedFontFamily =
        storedSettings.fontFamily !== undefined
            ? storedSettings.fontFamily
            : defaultSettings.fontFamily
    // Same for font family used in code editor

    const storedShowGitHubCorner =
        storedSettings.showGitHubCorner !== undefined
            ? storedSettings.showGitHubCorner
            : defaultSettings.showGitHubCorner
    // Same for the boolean flag indicating if the GitHub corner ribbon should be visible

    // Initializing React state hooks for each setting so they can be updated and re-rendered when changed
    const [theme, setTheme] = useState(storedTheme)
    // State for selected theme and its setter function

    const [language, setLanguage] = useState(storedLanguage)
    // State for selected language (like Javascript, Python, etc.)

    const [fontSize, setFontSize] = useState(storedFontSize)
    // State for font size preference

    const [fontFamily, setFontFamily] = useState(storedFontFamily)
    // State for font family used in code editor

    const [showGitHubCorner, setShowGitHubCorner] = useState(
        storedShowGitHubCorner,
    )
    // State for toggling the visibility of GitHub ribbon in UI

    // Function to reset all settings back to their default values
    const resetSettings = () => {
        setTheme(defaultSettings.theme)
        setLanguage(defaultSettings.language)
        setFontSize(defaultSettings.fontSize)
        setFontFamily(defaultSettings.fontFamily)
        setShowGitHubCorner(defaultSettings.showGitHubCorner)
        // All state variables are updated to the default values declared at the top
    }

    // useEffect that runs every time any setting value changes (like theme, language, etc.)
    // It updates the "settings" object in localStorage with the latest values
    useEffect(() => {
        const updatedSettings = {
            theme,
            language,
            fontSize,
            fontFamily,
            showGitHubCorner,
        }
        // Construct a settings object with current state values

        localStorage.setItem("settings", JSON.stringify(updatedSettings))
        // Save the updated settings into localStorage as a JSON string so it persists on reload
    }, [theme, language, fontSize, fontFamily, showGitHubCorner])
    // Dependencies: Whenever any of these values change, the effect is triggered

    // Return the context provider with all state values and setter functions passed as context value
    return (
        <SettingContext.Provider
            value={{
                theme,                 // Current theme
                setTheme,              // Function to change theme
                language,              // Current selected language
                setLanguage,           // Function to change language
                fontSize,              // Current font size
                setFontSize,           // Function to change font size
                fontFamily,            // Current font family
                setFontFamily,         // Function to change font family
                showGitHubCorner,      // Boolean to toggle GitHub corner ribbon
                setShowGitHubCorner,   // Setter to toggle GitHub ribbon visibility
                resetSettings,         // Function to reset all settings to default
            }}
        >
            {children}
        </SettingContext.Provider>
    )
    // `children` here will be any component(s) wrapped inside the SettingContextProvider in your app
}

// Using PropTypes to enforce that the children prop is passed and is of type React node
SettingContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
}

// Named export of the provider component to wrap your app in it
export { SettingContextProvider }

// Default export of the actual context, so that child components can consume it using useContext(SettingContext)
export default SettingContext
