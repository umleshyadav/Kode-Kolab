import useAppContext from "../hooks/useAppContext"
import useSetting from "../hooks/useSetting"
import useSocket from "../hooks/useSocket"
import ACTIONS from "../utils/actions"
import initialFile from "../utils/initialFile"
// this line is importing a module named initialFile from a file located at "@/utils/initialFile"
// initialFile is an object that contains the initial file data.

import { saveAs } from "file-saver"
import JSZip from "jszip"
// this line is importing a module named JSZip from a file located at "@/utils/jszip"
// JSZip is a library that allows you to create and read zip files in JavaScript.
// this line is importing a module named saveAs from a file located at "@/utils/file-saver"
import langMap from "lang-map"
// this line is importing a module named langMap from a file located at "@/utils/lang-map"
// langMap is a library that provides a mapping of language codes to language names.
// this line is importing a module named PropTypes from a file located at "@/utils/prop-types"

import PropTypes from "prop-types"
import { createContext, useCallback, useEffect, useState } from "react"
import { toast } from "react-hot-toast"
// this line is importing a module named toast from a file located at "@/utils/react-hot-toast"
// toast is a library that provides a simple way to display notifications in React applications.

import { v4 as uuidv4 } from "uuid"
// this line is importing a module named uuidv4 from a file located at "@/utils/uuid"
// uuidv4 is a library that generates unique identifiers (UUIDs) in version 4 format.
// this line is importing a module named uuid from a file located at "@/utils/uuid"


const FileContext = createContext()
// this line is creating a new context object using the createContext function from React.
// The createContext function is used to create a new context object that can be used to share data between components without having to pass props down manually at every level.

function FileContextProvider({ children }) {
    const { socket } = useSocket()
    const { setLanguage } = useSetting()
// these lines are importing the socket object from the useSocket hook and the setLanguage function from the useSetting hook.
// The socket object is used to communicate with the server using WebSockets.
// The setLanguage function is used to set the programming language for syntax highlighting in the code editor.
// this line is defining the FileContextProvider component, which is a custom context provider component that is used to provide the file context to its children components.

    const [files, setFiles] = useState([initialFile])
    const [currentFile, setCurrentFile] = useState(initialFile)
// these lines are defining the state variables for the file context. using the useState hook.
// The files state variable is an array that will hold the files.
// The currentFile state variable is an object that will hold the currently opened file.

    
   const { setUsers, drawingData } = useAppContext()
// this line is importing the setUsers function and drawingData object from the useAppContext hook.
// The setUsers function is used to set the users in the application context.
// this variable is used to store the drawing data for the application. and is declared using the useAppContext hook.
   

const createFile = (name) => {
        // Check if file with same name already exists
        let num = 1
        let fileExists = files.some((file) => file.name === name)

        while (fileExists) {
            name = `${name} (${num++})`
            fileExists = files.some((file) => file.name === name)
            if (!fileExists) break
        }
// this loop checks if a file with the same name already exists in the files array.
// If a file with the same name exists, it appends a number to the name until a unique name is found.

        const id = uuidv4()  // Generate a unique ID for the new file
        // this line is generating a unique identifier (UUID) for the new file using the uuidv4 function.

       // Generate a unique ID for the new file
        // this line is generating a unique identifier (UUID) for the new file using the uuidv4 function.

        const file = {
            id,
            name,
            content: "",
        }
// this object represents the newly created file, containing a unique ID, a name, and an empty content string.

        setFiles((prev) => [...prev, file]) 
        // this line updates the files state by adding the newly created file to the previous list of files.

        socket.emit(ACTIONS.FILE_CREATED, { file })
        // this line emits a socket event to the server, informing it that a new file has been created and sending the file data.

        return id
        // returns the ID of the newly created file for possible use by the calling component.
    }

    const updateFile = (id, content) => {
        setFiles((prev) =>
            prev.map((file) => {
                if (file.id === id) {
                    file.content = content
                }
                return file
            }),
        )
        // this function updates the content of the file with the specified ID in the files array.
        // it does this by mapping through the existing files and updating the content if the ID matches.
        // this updated list is then used to update the state.
    }

    const openFile = (id) => {
        // Save current file
        if (currentFile) {
            updateFile(currentFile.id, currentFile.content)
        }
        // this condition ensures that before switching files, the current file’s latest content is saved.

        const file = files.find((file) => file.id === id)
        // this line finds the file object in the files array that matches the provided id.

        setCurrentFile(file)
        // sets the selected file as the current file to be displayed or edited.
    }

    const renameFile = (id, newName) => {
        const fileExists = files.some((file) => file.name === newName)
        // this checks whether a file with the new name already exists to avoid name duplication.

        if (fileExists) {
            return false
        }
        // if a file with the same name is found, renaming is aborted and false is returned.

        setFiles((prev) =>
            prev.map((file) => {
                if (file.id === id) {
                    file.name = newName
                }
                return file
            }),
        )
        // updates the name of the file with the matching id in the state.

        const file = { id, name: newName }
        socket.emit(ACTIONS.FILE_RENAMED, { file })
        // emits an event to the server with the renamed file data.

        return true
        // returns true to indicate successful renaming.
    }

    const deleteFile = (id) => {
        setFiles((prev) => prev.filter((file) => file.id !== id))
        // removes the file with the given id from the files array.

        if (currentFile.id === id) {
            setCurrentFile(null)
        }
        // if the deleted file was the one currently open, the currentFile state is set to null.

        socket.emit(ACTIONS.FILE_DELETED, { id })
        // emits an event to notify the server about the file deletion.
    }

    const downloadCurrentFile = () => {
        const blob = new Blob([currentFile.content], {
            type: "text/plain;charset=utf-8",
        })
        // creates a Blob object containing the content of the current file for download.

        saveAs(blob, currentFile.name)
        // triggers a download of the blob as a file using the current file’s name.
    }

    const downloadAllFiles = () => {
        const zip = new JSZip()
        // creates a new instance of JSZip to hold all the files in a zip format.

        files.forEach((file) => {
            const blobFile = new Blob([file.content], {
                type: "text/plain;charset=utf-8",
            })
            zip.file(file.name, blobFile)
        })
        // loops through all files, creates blobs from their content, and adds them to the zip object.

        zip.generateAsync({ type: "blob" }).then(function (content) {
            saveAs(content, "Code-Sync-Files.zip")
        })
        // generates the zip file asynchronously and triggers download once ready.
    }

    const handleUserJoined = useCallback(
        ({ user }) => {
            toast.success(`${user.username} joined the room`)
            // shows a toast notification that a new user has joined the room.

            socket.emit(ACTIONS.SYNC_FILES, {
                files,
                currentFile,
                socketId: user.socketId,
            })
            // sends the current state of all files and the current file to the newly joined user.

            socket.emit(ACTIONS.SYNC_DRAWING, {
                drawingData,
                socketId: user.socketId,
            })
            // sends the drawing data to the new user.

            setUsers((pre) => {
                return [...pre, user]
            })
            // updates the application context with the newly joined user.
        },
        [currentFile, drawingData, files, setUsers, socket],
    )

    const handleFilesSync = useCallback(({ files, currentFile }) => {
        setFiles(files)
        setCurrentFile(currentFile)
        // sets the files and current file received from another user (for syncing purposes).
    }, [])

    const handleFileRenamed = useCallback(({ file }) => {
        setFiles((prev) =>
            prev.map((f) => {
                if (f.id === file.id) {
                    f.name = file.name
                }
                return f
            }),
        )
        // updates the file name in the local state when a rename event is received from the server.
    }, [])

    const handleFileDeleted = useCallback(
        ({ id }) => {
            setFiles((prev) => prev.filter((file) => file.id !== id))
            // removes the file with the specified ID from local state when deletion is broadcast from the server.

            if (currentFile.id === id) {
                setCurrentFile(null)
            }
            // if the deleted file was open, sets current file to null.
        },
        [currentFile?.id],
    )

    const handleFileCreated = useCallback(({ file }) => {
        setFiles((prev) => [...prev, file])
        // adds a newly created file (broadcast by another user) to the local state.
    }, [])

    const handleFileUpdated = useCallback(
        ({ file }) => {
            setFiles((prev) =>
                prev.map((f) => {
                    if (f.id === file.id) {
                        f.content = file.content
                    }
                    return f
                }),
            )
            // updates the content of a file when a sync event for that file is received.

            if (currentFile.id === file.id) {
                setCurrentFile(file)
            }
            // if the updated file is currently open, update its content directly.
        },
        [currentFile?.id],
    )

    useEffect(() => {
        if (currentFile === null) return
        // ensures the following code runs only when a file is opened.

        const language = langMap.languages(currentFile.name.split(".").pop())
        // extracts the file extension from the current file name and determines the programming language.

        if (language && language[0]) {
            setLanguage(language[0])
        }
        // sets the editor language for syntax highlighting using the language detected from file name.
    }, [currentFile, setLanguage])

    useEffect(() => {
        socket.once(ACTIONS.SYNC_FILES, handleFilesSync)
        socket.on(ACTIONS.USER_JOINED, handleUserJoined)
        socket.on(ACTIONS.FILE_CREATED, handleFileCreated)
        socket.on(ACTIONS.FILE_UPDATED, handleFileUpdated)
        socket.on(ACTIONS.FILE_RENAMED, handleFileRenamed)
        socket.on(ACTIONS.FILE_DELETED, handleFileDeleted)
        // these socket event listeners handle various actions like file creation, updates, renaming, deletion, and user joins.

        return () => {
            socket.off(ACTIONS.USER_JOINED)
            socket.off(ACTIONS.FILE_CREATED)
            socket.off(ACTIONS.FILE_UPDATED)
            socket.off(ACTIONS.FILE_RENAMED)
            socket.off(ACTIONS.FILE_DELETED)
            // this cleanup function removes all the event listeners when the component is unmounted to avoid memory leaks.
        }
    }, [
        handleFileCreated,
        handleFileDeleted,
        handleFileRenamed,
        handleFilesSync,
        handleFileUpdated,
        handleUserJoined,
        socket,
    ])

    return (
        <FileContext.Provider
            value={{
                files,
                setFiles,
                currentFile,
                setCurrentFile,
                createFile,
                updateFile,
                openFile,
                renameFile,
                deleteFile,
                downloadCurrentFile,
                downloadAllFiles,
            }}
        >
            {children}
        </FileContext.Provider>
        // this component provides the file-related state and functions to all its children through FileContext.
    )
}

FileContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
}
// this defines the expected prop type for FileContextProvider, ensuring that children is a valid React node.

export { FileContextProvider }
// named export of FileContextProvider to be used in other parts of the application.

export default FileContext
// default export of the FileContext to allow consuming components to access the context using useContext(FileContext).