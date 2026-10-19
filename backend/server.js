// Importing the express module to create the server and handle routing
const express = require("express")
const app = express() // Creating an instance of express app

// Load environment variables from a .env file into process.env
require("dotenv").config()

// Importing the http module to create an HTTP server
const http = require("http")

// Importing CORS middleware to allow cross-origin requests
const cors = require("cors")

// Importing the ACTIONS object which holds the constants for different socket events
const ACTIONS = require("./utils/actions")

// Middleware to parse incoming JSON requests and make the data available in req.body
app.use(express.json())

// Using CORS middleware to allow requests from different origins
app.use(cors())

// Importing the Server class from socket.io to handle websocket connections
const { Server } = require("socket.io")

// Creating an HTTP server instance using the express app
const server = http.createServer(app)

// Creating a new socket.io server with CORS enabled to accept requests from any origin
const io = new Server(server, {
	cors: {
		origin: "*", // Allowing all origins
	},
})

// This array holds the mapping of connected users with their metadata (like username, roomId, socketId, etc.)
let userSocketMap = []

// Utility function to get all users connected in a specific room
function getUsersInRoom(roomId) {
	return userSocketMap.filter((user) => user.roomId == roomId)
}

// Utility function to get the roomId of a user based on their socketId
function getRoomId(socketId) {
	const user = userSocketMap.find((user) => user.socketId === socketId)
	return user?.roomId // Optional chaining in case user is undefined
}

// Listening for client socket connections
io.on("connection", (socket) => {
	// Handling event: When a user requests to join a room
	socket.on(ACTIONS.JOIN_REQUEST, ({ roomId, username }) => {
		if (!roomId || !username) return

		// Check if the username already exists in the room for another socket
		const isUsernameExist = getUsersInRoom(roomId).filter(
			(u) => u.username === username && u.socketId !== socket.id
		)

		// If username already exists, notify the client and return
		if (isUsernameExist.length > 0) {
			io.to(socket.id).emit(ACTIONS.USERNAME_EXISTS)
			return
		}

		// Remove any previous entry for this socketId to avoid duplicates
		userSocketMap = userSocketMap.filter((u) => u.socketId !== socket.id)

		// Creating a new user object and saving it to userSocketMap
		const user = {
			username,
			roomId,
			status: ACTIONS.USER_ONLINE, // Set user status as online
			cursorPosition: 0, // Default cursor position
			typing: false, // Typing state
			socketId: socket.id, // Unique socket ID
			currentFile: null, // Currently opened file
		}
		userSocketMap.push(user)

		// Add the socket to the room
		socket.join(roomId)

		// Notify other users in the room that a new user has joined
		socket.broadcast.to(roomId).emit(ACTIONS.USER_JOINED, { user })

		// Send a JOIN_ACCEPTED response to the newly joined user with all users in the room
		const users = getUsersInRoom(roomId)
		io.to(socket.id).emit(ACTIONS.JOIN_ACCEPTED, { user, users })
	})

	// Handling event: When a user disconnects or leaves
	socket.on("disconnecting", () => {
		const user = userSocketMap.find((user) => user.socketId === socket.id)
		const roomId = user?.roomId
		if (roomId === undefined || user === undefined) return

		// Notify others in the room that this user has disconnected
		socket.broadcast.to(roomId).emit(ACTIONS.USER_DISCONNECTED, { user })

		// Remove user from the map
		userSocketMap = userSocketMap.filter((u) => u.socketId !== socket.id)

		// Remove socket from all rooms
		socket.leave()
	})

	// File Sharing Actions -----------------------------------------------------------------------------

	// Event to sync files between users
	socket.on(ACTIONS.SYNC_FILES, ({ files, currentFile, socketId }) => {
		// Emit file data to the specific socket requesting the sync
		io.to(socketId).emit(ACTIONS.SYNC_FILES, {
			files,
			currentFile,
		})
	})

	// Event to broadcast file creation to others in the room
	socket.on(ACTIONS.FILE_CREATED, ({ file }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(ACTIONS.FILE_CREATED, { file })
	})

	// Event to broadcast file update to others in the room
	socket.on(ACTIONS.FILE_UPDATED, ({ file }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(ACTIONS.FILE_UPDATED, { file })
	})

	// Event to broadcast file renaming to others in the room
	socket.on(ACTIONS.FILE_RENAMED, ({ file }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(ACTIONS.FILE_RENAMED, { file })
	})

	// Event to broadcast file deletion to others in the room
	socket.on(ACTIONS.FILE_DELETED, ({ id }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(ACTIONS.FILE_DELETED, { id })
	})

	// User Status Updates -----------------------------------------------------------------------------

	// Event to broadcast when a user goes offline
	socket.on(ACTIONS.USER_OFFLINE, ({ socketId }) => {
		userSocketMap = userSocketMap.map((user) => {
			if (user.socketId === socketId) {
				return { ...user, status: ACTIONS.USER_OFFLINE }
			}
			return user
		})
		const roomId = getRoomId(socketId)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(ACTIONS.USER_OFFLINE, { socketId })
	})

	// Event to broadcast when a user comes online again
	socket.on(ACTIONS.USER_ONLINE, ({ socketId }) => {
		userSocketMap = userSocketMap.map((user) => {
			if (user.socketId === socketId) {
				return { ...user, status: ACTIONS.USER_ONLINE }
			}
			return user
		})
		const roomId = getRoomId(socketId)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(ACTIONS.USER_ONLINE, { socketId })
	})

	// Chat Messaging -----------------------------------------------------------------------------------

	// Event to broadcast a chat message to all other users
	socket.on(ACTIONS.SEND_MESSAGE, ({ message }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(ACTIONS.RECEIVE_MESSAGE, { message })
	})

	// Cursor Typing and Collaboration ------------------------------------------------------------------

	// Event triggered when a user starts typing
	socket.on(ACTIONS.TYPING_START, ({ cursorPosition }) => {
		userSocketMap = userSocketMap.map((user) => {
			if (user.socketId === socket.id) {
				return { ...user, typing: true, cursorPosition }
			}
			return user
		})
		const user = userSocketMap.find((user) => user.socketId === socket.id)
		if (!user || !user.roomId) return
		socket.broadcast.to(user.roomId).emit(ACTIONS.TYPING_START, { user })
	})

	// Event triggered when a user pauses typing
	socket.on(ACTIONS.TYPING_PAUSE, () => {
		userSocketMap = userSocketMap.map((user) => {
			if (user.socketId === socket.id) {
				return { ...user, typing: false }
			}
			return user
		})
		const user = userSocketMap.find((user) => user.socketId === socket.id)
		if (!user || !user.roomId) return
		socket.broadcast.to(user.roomId).emit(ACTIONS.TYPING_PAUSE, { user })
	})

	// Collaborative Drawing -----------------------------------------------------------------------------

	// Event when a client requests the drawing data from others
	socket.on(ACTIONS.REQUEST_DRAWING, () => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast
			.to(roomId)
			.emit(ACTIONS.REQUEST_DRAWING, { socketId: socket.id })
	})

	// Event to sync drawing data to a particular client
	socket.on(ACTIONS.SYNC_DRAWING, ({ drawingData, socketId }) => {
		socket.broadcast
			.to(socketId)
			.emit(ACTIONS.SYNC_DRAWING, { drawingData })
	})

	// Event to broadcast real-time drawing snapshot to others in the room
	socket.on(ACTIONS.DRAWING_UPDATE, ({ snapshot }) => {
		const roomId = getRoomId(socket.id)
		if (!roomId) return
		socket.broadcast.to(roomId).emit(ACTIONS.DRAWING_UPDATE, {
			snapshot,
		})
	})
})

// Importing code execution helper
const { getRuntimes, executeCode } = require("./utils/executor")

// Setting up the server port, default to 3000 if not specified in .env
const PORT = process.env.PORT || 3000

// Root route to confirm API is live
app.get("/", (req, res) => {
	res.send("API is running successfully")
})

// Runtimes endpoint for supported languages
app.get("/api/runtimes", async (req, res) => {
	try {
		const runtimes = await getRuntimes()
		res.json(runtimes)
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch runtimes" })
	}
})

// Code execution endpoint
app.post("/api/execute", async (req, res) => {
	try {
		const result = await executeCode(req.body)
		res.json(result)
	} catch (error) {
		res.status(500).json({
			run: {
				stdout: "",
				stderr: error.message || "Execution error",
				code: 1,
			},
		})
	}
})

// Starting the server on the defined port
server.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`)
})