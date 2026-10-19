// Importing custom app-wide context hook for accessing shared global state
import useAppContext from "../hooks/useAppContext"

// Importing constant action types used for socket communication
import ACTIONS from "../utils/actions"

// Importing possible user status values (like CONNECTED, JOINED, FAILED, etc.)
import UserStatus from "../utils/status"

// Importing prop-types for validating React props
import PropTypes from "prop-types"

// Importing core React features
import { createContext, useCallback, useEffect, useMemo } from "react"

// Importing toast notification library for showing real-time feedback
import { toast } from "react-hot-toast"

// Importing socket.io-client for real-time socket communication
import { io } from "socket.io-client"

// Accessing the backend URL (from `.env` file using Vite's import.meta.env) with local fallback
const BACKEND_URL =
    import.meta.env.VITE_API_BACKEND_URL || "http://localhost:3000"

// Creating the socket context to share socket instance and data across the app
const SocketContext = createContext()

// Creating context provider component to encapsulate socket logic
const SocketProvider = ({ children }) => {
    // Destructure shared state and setters from global App Context
    const {
        setUsers,           // Sets the list of active users in the room
        setStatus,          // Sets current user status (connecting, joined, etc.)
        setCurrentUser,     // Sets the current logged-in user details
        drawingData,        // Current drawing state shared among users
        setDrawingData,     // Updates shared drawing data
    } = useAppContext()

    /**
     * useMemo:
     * This ensures the socket instance is only created once when the component mounts,
     * and not re-created on every render.
     * `reconnectionAttempts: 2` limits reconnection retries if connection fails.
     */
    const socket = useMemo(
        () =>
            io(BACKEND_URL, {
                reconnectionAttempts: 2,
            }),
        [],
    )

    /**
     * handleError:
     * useCallback ensures this function remains stable and doesn't re-create unnecessarily.
     * Triggered when socket fails to connect to the server.
     */
    const handleError = useCallback(
        (err) => {
            console.log("socket error", err)                           // Log the error
            setStatus(UserStatus.CONNECTION_FAILED)                   // Update user status
            toast.dismiss()                                           // Clear any previous toasts
            toast.error("Failed to connect to the server")            // Show error message
        },
        [setStatus],
    )

    /**
     * handleUsernameExist:
     * Called when the username the user tries to use already exists in the room.
     */
    const handleUsernameExist = useCallback(() => {
        toast.dismiss()                                               // Clear any existing toasts
        setStatus(UserStatus.INITIAL)                                 // Reset user status
        toast.error("The username you chose already exists in the room. Please choose a different username.")
    }, [setStatus])

    /**
     * handleJoiningAccept:
     * Called when the server accepts the user's join request and returns user list.
     */
    const handleJoiningAccept = useCallback(
        ({ user, users }) => {
            setCurrentUser(user)                                      // Set the current user's details
            setUsers(users)                                           // Update the list of all users in the room
            toast.dismiss()                                           // Remove previous messages
            setStatus(UserStatus.JOINED)                              // Update status to JOINED
        },
        [setCurrentUser, setStatus, setUsers],
    )

    /**
     * handleUserLeft:
     * Triggered when another user leaves the room.
     * Displays a toast and removes that user from the user list.
     */
    const handleUserLeft = useCallback(
        ({ user }) => {
            toast.success(`${user.username} left the room`)           // Show who left the room
            setUsers((prev) => {
                return prev.filter((u) => u.username !== user.username)
                // Remove the user who left from the current list
            })
        },
        [setUsers],
    )

    /**
     * handleRequestDrawing:
     * Another user requested the current user's drawing state.
     * Responds by sending current drawing data back using SYNC_DRAWING.
     */
    const handleRequestDrawing = useCallback(
        ({ socketId }) => {
            socket.emit(ACTIONS.SYNC_DRAWING, { socketId, drawingData })
            // Send drawing data to the specific socket (the requester)
        },
        [drawingData, socket],
    )

    /**
     * handleDrawingSync:
     * Triggered when current user receives updated drawing data from another peer.
     */
    const handleDrawingSync = useCallback(
        ({ drawingData }) => {
            setDrawingData(drawingData)                               // Update local drawing canvas
        },
        [setDrawingData],
    )

    /**
     * useEffect:
     * Set up socket event listeners when component mounts
     * And clean them up when it unmounts to prevent memory leaks.
     */
    useEffect(() => {
        console.log("backend url: ", BACKEND_URL)

        // Register socket listeners for different events
        socket.on("connect_error", handleError)                       // Socket connection error
        socket.on("connect_failed", handleError)                      // Socket connection failure

        socket.on(ACTIONS.USERNAME_EXISTS, handleUsernameExist)      // Username already taken
        socket.on(ACTIONS.JOIN_ACCEPTED, handleJoiningAccept)        // User successfully joined
        socket.on(ACTIONS.USER_DISCONNECTED, handleUserLeft)         // Another user left the room
        socket.on(ACTIONS.REQUEST_DRAWING, handleRequestDrawing)     // Another user requested drawing
        socket.on(ACTIONS.SYNC_DRAWING, handleDrawingSync)           // Syncing of drawing data

        // Clean up: remove all socket listeners on component unmount
        return () => {
            socket.off("connect_error")
            socket.off("connect_failed")
            socket.off(ACTIONS.USERNAME_EXISTS)
            socket.off(ACTIONS.JOIN_ACCEPTED)
            socket.off(ACTIONS.USER_DISCONNECTED)
            socket.off(ACTIONS.REQUEST_DRAWING)
            socket.off(ACTIONS.SYNC_DRAWING)
        }
    }, [
        handleDrawingSync,
        handleError,
        handleJoiningAccept,
        handleRequestDrawing,
        handleUserLeft,
        handleUsernameExist,
        setUsers,
        socket,
    ])

    /**
     * Return the context provider.
     * Passes down the `socket` instance so that other components can use it via useContext.
     */
    return (
        <SocketContext.Provider
            value={{
                socket,     // Provide the socket instance to children
            }}
        >
            {children}
        </SocketContext.Provider>
    )
}

// Validate that `children` is passed in and is a valid React node
SocketProvider.propTypes = {
    children: PropTypes.node.isRequired,
}

// Export both the provider component and context
export { SocketProvider }       // To wrap the app with this provider
export default SocketContext    // To consume context using useContext(SocketContext)
 