import PropTypes from "prop-types"
// this line is importing the PropTypes library, which is used for type checking in React.
// PropTypes is a library that allows you to specify the types of props that a component should receive.
import { AppContextProvider } from "./AppContext.jsx"
// AppContextProvider is a custom context provider component that is defined in the AppContext.jsx file.
// It is used to provide the application context to its children components.
import { ChatContextProvider } from "./ChatContext.jsx"
// ChatContextProvider is a custom context provider component that is defined in the ChatContext.jsx file.
// It is used to provide the chat context to its children components.
import { FileContextProvider } from "./FileContext.jsx"
// FileContextProvider is a custom context provider component that is defined in the FileContext.jsx file.
// It is used to provide the file context to its children components.
import { SettingContextProvider } from "./SettingContext.jsx"
// SettingContextProvider is a custom context provider component that is defined in the SettingContext.jsx file.
// It is used to provide the setting context to its children components.
import { SocketProvider } from "./SocketContext.jsx"
// SocketProvider is a custom context provider component that is defined in the SocketContext.jsx file.
// It is used to provide the socket context to its children components.
import { TabContextProvider } from "./TabContext.jsx"
// TabContextProvider is a custom context provider component that is defined in the TabContext.jsx file.
// It is used to provide the tab context to its children components.
import { RunCodeContextProvider } from "./RunCodeContext.jsx"
// RunCodeContextProvider is a custom context provider component that is defined in the RunCodeContext.jsx file.
// It is used to provide the run code context to its children components.
// This is a custom context provider component that wraps all the other context providers.

function AppProvider({ children }) {
    // This function is a React component that serves as a wrapper for multiple context providers.
    // It allows you to provide multiple contexts to your application in a clean and organized way.
    // The component takes a single prop, children, which represents the child components that will be wrapped by the context providers.
    // The component uses the AppContextProvider, SocketProvider, SettingContextProvider, TabContextProvider, FileContextProvider, RunCodeContextProvider, and ChatContextProvider components to wrap the children.
    return (
        <AppContextProvider>
            <SocketProvider>
                <SettingContextProvider>
                    <TabContextProvider>
                        <FileContextProvider>
                            <RunCodeContextProvider>
                                <ChatContextProvider>
                                    {children} 
                                    {/* This line renders the children components passed to the AppProvider component. */}
                                    {/* The children components will have access to all the context values provided by the context providers. */}   
                                    
                                </ChatContextProvider>
                            </RunCodeContextProvider>
                        </FileContextProvider>
                    </TabContextProvider>
                </SettingContextProvider>
            </SocketProvider>
        </AppContextProvider>
    )
}

AppProvider.propTypes = {
    children: PropTypes.node.isRequired,
}

export default AppProvider
