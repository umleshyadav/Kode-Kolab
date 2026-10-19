// this file is responsible for managing the chat context, including the messages and the socket connection
// and the chat-related state.

import { createContext, useState, useEffect } from "react"
import PropTypes from "prop-types"
import useSocket from "../hooks/useSocket"
// this line is importing a custom hook named useSocket from a file located at "@/hooks/useSocket"
// useSocket is a custom hook that is used to manage the socket connection.
import ACTIONS from "../utils/actions"
// this line is importing a module named ACTIONS from a file located at "@/utils/actions"
// ACTIONS is an object that contains the action types used in the application.
// These action types are used to identify the type of action being performed in the application.
// For example, ACTIONS.RECEIVE_MESSAGE is used to identify the action of receiving a message.
const ChatContext = createContext()
// this line is creating a new context object using the createContext function from React.
// The createContext function is used to create a new context object that can be used to share data between components without having to pass props down manually at every level.


function ChatContextProvider({ children }) {
    const { socket } = useSocket()
    const [messages, setMessages] = useState([])
    const [isNewMessage, setIsNewMessage] = useState(false)
    const [lastScrollHeight, setLastScrollHeight] = useState(0)
// these lines are defining the state variables for the chat context.
// The messages state variable is an array that will hold the chat messages.
// The isNewMessage state variable is a boolean that indicates whether there is a new message.
// The lastScrollHeight state variable is a number that will hold the last scroll height of the chat window.
    useEffect(() => {
        socket.on(ACTIONS.RECEIVE_MESSAGE, ({ message }) => {
            setMessages((messages) => [...messages, message])
            setIsNewMessage(true)
        })
// useEffect is a React hook that allows you to perform side effects in function components.
// The useEffect hook takes two arguments: a function and a dependency array.
// here the useEffect hook is used to listen for the RECEIVE_MESSAGE action from the socket.
// When the RECEIVE_MESSAGE action is received, the callback function is executed.

        return () => socket.off(ACTIONS.RECEIVE_MESSAGE)
    }, [socket])

    return (
        <ChatContext.Provider
            value={{
                messages,
                setMessages,
                isNewMessage,
                setIsNewMessage,
                lastScrollHeight,
                setLastScrollHeight,
            }}
        >
            {children}
        </ChatContext.Provider>
    )
}

ChatContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
}
// this line is defining the prop types for the ChatContextProvider component.
// It specifies that the children prop is required and must be a React node.
// The children prop represents the child components that will be wrapped by the ChatContextProvider component.
export { ChatContextProvider }
export default ChatContext
