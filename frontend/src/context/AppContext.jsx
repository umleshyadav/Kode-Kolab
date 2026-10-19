// import STATE from "@/utils/states"
import STATE from "../utils/states"
// the above line is importing a module named STATE from a file located at "@/utils/states"
import UserStatus from "../utils/status"
// the above line is importing a module named UserStatus from a file located at "@/utils/status"
import PropTypes from "prop-types"
import { createContext, useState } from "react"
const AppContext = createContext()

function AppContextProvider({ children }) {
    const [users, setUsers] = useState([])
    const [status, setStatus] = useState(UserStatus.INITIAL)
    const [currentUser, setCurrentUser] = useState({
        username: "",
        roomId: "",
    })
    // For drawing state
    const [state, setState] = useState(STATE.CODING)
    const [drawingData, setDrawingData] = useState(null)

    return (
        // this line is returning a JSX element, specifically a React component.
        // The component is a context provider that allows the state and functions defined above to be accessible to its children.
        // all the values defined in the AppContextProvider component are passed down to its children through the AppContext.Provider component.
        // The value prop of the Provider component is an object that contains the state and functions defined above.
        <AppContext.Provider
            value={{
                users,
                setUsers,
                currentUser,
                setCurrentUser,
                status,
                setStatus,
                state,
                setState,
                drawingData,
                setDrawingData,
            }}
        >
            {children} 
        </AppContext.Provider>
        // this returns the AppContext.Provider component, which is a part of the React Context API.
        // The Provider component is used to pass down the context value to its children.
    )
}

AppContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
}
// this line is defining the prop types for the AppContextProvider component.
// It specifies that the children prop is required and must be a React node.
export { AppContextProvider }
export default AppContext
