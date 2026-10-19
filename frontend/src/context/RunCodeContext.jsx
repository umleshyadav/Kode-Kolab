// importing createContext, useEffect, and useState from React to use for creating context and managing component state and side effects
import { createContext, useEffect, useState } from "react"

// importing PropTypes to perform runtime type checking on the children prop passed to the provider component
import PropTypes from "prop-types"

// importing custom hook `useFileSystem` to access the file system context (like currentFile)
import useFileSystem from "../hooks/useFileSystem"

// importing axiosInstance, a pre-configured Axios instance for making HTTP requests (e.g., API calls to backend server)
import axiosInstance from "../api/"

// importing toast from react-hot-toast to show toast notifications like success, error, or loading messages
import toast from "react-hot-toast"

// importing lang-map library to infer the programming language from a file extension, e.g., `.js` maps to JavaScript
import langMap from "lang-map"

// creating a new context for running code, which will be provided to children components
const RunCodeContext = createContext()

// defining a provider component which will wrap the app/component tree to share code execution context values
const RunCodeContextProvider = ({ children }) => {

    const { currentFile } = useFileSystem()
    // using the useFileSystem hook to get the current file that the user is editing or has opened

    const [input, setInput] = useState("")
    // declaring input state to store the standard input (stdin) that a user can provide before running the code

    const [output, setOutput] = useState("")
    // declaring output state to store the result of the executed code (either stdout or stderr)

    const [isRunning, setIsRunning] = useState(false)
    // declaring isRunning state to indicate whether the code execution is in progress (used to disable buttons or show spinners)

    const [supportedLanguages, setSupportedLanguages] = useState([])
    // this state will hold a list of supported languages fetched from the backend (used for selecting proper compiler/runtime)

    const [selectedLanguage, setSelectedLanguage] = useState("")
    // this state holds the language object (like name, version) selected for the current file, based on file extension

    // useEffect hook that runs once when the component mounts (due to empty dependency array)
    // it fetches the supported programming languages from the backend API
    useEffect(() => {
        const fetchSupportedLanguages = async () => {
            try {
                const languages = await axiosInstance.get("/runtimes")
                // sending a GET request to the `/runtimes` endpoint which returns a list of supported languages
                setSupportedLanguages(languages.data)
                // storing the fetched language data (an array) into the state so it can be used to auto-match file types
            } catch (error) {
                console.error(error?.response?.data || error)
                // logging the error response in console for debugging
                toast.error("Failed to fetch supported languages")
                // showing a toast error message to the user
            }
        }

        fetchSupportedLanguages()
        // immediately invoking the async function to fetch languages
    }, [])

    // useEffect hook that runs when either the current file name or the list of supportedLanguages changes
    // it automatically sets the selectedLanguage based on the file extension
    useEffect(() => {
        if (supportedLanguages.length === 0 || !currentFile?.name) return
        // if no languages are loaded yet or there’s no current file open, do nothing

        const extension = currentFile.name.split(".").pop()
        // extracting the file extension from the current file name (e.g., "main.cpp" → "cpp")

        const languageName = langMap.languages(extension)
        // using lang-map to convert file extension into language name(s). e.g., "cpp" → ["C++"]

        const language = supportedLanguages.find(
            (lang) =>
                lang.aliases.includes(extension) || 
                languageName.includes(lang.language.toLowerCase()),
        )
        // searching the supportedLanguages array to find a language object that either:
        // - includes this file extension in its `aliases`
        // - or has a name that matches what langMap detected

        if (language) setSelectedLanguage(language)
        // if a matching language is found, set it as selectedLanguage (e.g., { language: 'cpp', version: '11.2.0' })

        else setSelectedLanguage("")
        // if no match is found, clear the selected language
    }, [currentFile?.name, supportedLanguages])
    // re-run this effect whenever the file name changes or new languages are fetched

    // defining a function to execute the code of the current file using the selected language and input
    const runCode = async () => {
        try {
            if (!selectedLanguage) {
                return toast.error("Please select a language to run the code")
                // if no language has been selected, show error message and stop execution
            } else if (!currentFile) {
                return toast.error("Please open a file to run the code")
                // if no file is open, show error message and stop execution
            } else {
                toast.loading("Running code...")
                // if both language and file are available, show loading message while code runs
            }

            setIsRunning(true)
            // mark code as currently running — useful for disabling buttons or showing loading spinners

            const { language, version } = selectedLanguage
            // destructure language name and version from selectedLanguage object

            const response = await axiosInstance.post("/execute", {
                language,
                version,
                files: [
                    { name: currentFile.name, content: currentFile.content },
                ],
                stdin: input,
            })
            // sending a POST request to `/execute` endpoint with:
            // - language and version info
            // - file content and name in a files array
            // - standard input (if any)
            // backend will run the code and return stdout/stderr

            if (response.data.run.stderr) {
                setOutput(response.data.run.stderr)
                // if there's an error during execution, set the error as the output
            } else {
                setOutput(response.data.run.stdout)
                // otherwise, set the standard output as result
            }

            setIsRunning(false)
            // mark execution as complete

            toast.dismiss()
            // remove the loading toast after getting response
        } catch (error) {
            console.error(error?.response?.data || error)
            // log the error in the browser console for debugging

            setIsRunning(false)
            // mark execution as complete even in case of error

            toast.dismiss()
            // close the loading toast

            toast.error("Failed to run the code")
            // show a toast with error message
        }
    }

    // returning the context provider which exposes several values to all components within its tree
    // these values include: input setter, output result, running status, language selection, and the runCode function itself
    return (
        <RunCodeContext.Provider
            value={{
                setInput,                // function to update stdin input
                output,                  // holds the output/error result of the last run
                isRunning,               // boolean indicating whether code execution is in progress
                supportedLanguages,      // array of all available languages fetched from backend
                selectedLanguage,        // object containing currently selected language info
                setSelectedLanguage,     // function to manually set/change the selected language
                runCode,                 // function to execute the code with current file, input and language
            }}
        >
            {children}
        </RunCodeContext.Provider>
    )
}

// defining PropTypes to validate that the `children` prop passed to this context provider is a React node (required)
RunCodeContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
}

// exporting RunCodeContextProvider as a named export so it can be used to wrap other components
export { RunCodeContextProvider }

// exporting RunCodeContext as default so it can be consumed via useContext(RunCodeContext) in child components
export default RunCodeContext
