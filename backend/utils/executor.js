const { spawn, execFile } = require("child_process")
const fs = require("fs")
const path = require("path")
const os = require("os")
const https = require("https")

// Fallback supported runtimes list for 85+ languages (matches Piston API schema)
const DEFAULT_RUNTIMES = [
	{ language: "javascript", version: "18.15.0", aliases: ["js", "node"] },
	{ language: "typescript", version: "5.0.3", aliases: ["ts", "node-ts"] },
	{ language: "python", version: "3.10.0", aliases: ["py", "py3", "python3"] },
	{ language: "c++", version: "10.2.0", aliases: ["cpp", "g++", "cplusplus"] },
	{ language: "c", version: "10.2.0", aliases: ["gcc"] },
	{ language: "java", version: "15.0.2", aliases: [] },
	{ language: "csharp", version: "6.12.0", aliases: ["c#", "cs"] },
	{ language: "go", version: "1.16.2", aliases: ["golang"] },
	{ language: "rust", version: "1.68.2", aliases: ["rs"] },
	{ language: "php", version: "8.2.3", aliases: [] },
	{ language: "ruby", version: "3.0.1", aliases: ["rb"] },
	{ language: "bash", version: "5.2.0", aliases: ["sh"] },
	{ language: "sqlite3", version: "3.36.0", aliases: ["sqlite", "sql"] },
	{ language: "r", version: "4.1.1", aliases: [] },
	{ language: "dart", version: "2.19.6", aliases: [] },
	{ language: "kotlin", version: "1.8.20", aliases: ["kt"] },
	{ language: "swift", version: "5.3.3", aliases: [] },
]

let cachedRuntimes = null

/**
 * Fetch supported runtimes, caching them locally
 */
async function getRuntimes() {
	if (cachedRuntimes && cachedRuntimes.length > 0) {
		return cachedRuntimes
	}

	return new Promise((resolve) => {
		const req = https.get(
			"https://emkc.org/api/v2/piston/runtimes",
			{ timeout: 4000 },
			(res) => {
				let data = ""
				res.on("data", (chunk) => (data += chunk))
				res.on("end", () => {
					try {
						const parsed = JSON.parse(data)
						if (Array.isArray(parsed) && parsed.length > 0) {
							cachedRuntimes = parsed
							return resolve(parsed)
						}
					} catch (e) {}
					resolve(DEFAULT_RUNTIMES)
				})
			}
		)
		req.on("error", () => resolve(DEFAULT_RUNTIMES))
		req.on("timeout", () => {
			req.destroy()
			resolve(DEFAULT_RUNTIMES)
		})
	})
}

/**
 * Execute code via local runtime or remote Piston if configured
 */
async function executeCode({ language, version, files, stdin = "" }) {
	const lang = (language || "").toLowerCase().trim()
	const primaryFile = files && files[0] ? files[0] : { name: "index.txt", content: "" }
	const code = primaryFile.content || ""

	// Check if user has a remote Piston URL or API key configured
	const pistonUrl = process.env.PISTON_API_URL
	const pistonKey = process.env.PISTON_API_KEY
	if (pistonUrl || pistonKey) {
		try {
			const remoteRes = await executeRemotePiston({
				url: pistonUrl || "https://emkc.org/api/v2/piston/execute",
				key: pistonKey,
				payload: { language, version, files, stdin },
			})
			if (remoteRes) return remoteRes
		} catch (err) {
			console.warn("Remote Piston failed, falling back to local engine:", err.message)
		}
	}

	// Local multi-language execution engine
	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "kode-kolab-"))

	try {
		if (lang === "javascript" || lang === "js" || lang === "node") {
			const filePath = path.join(tmpDir, "script.js")
			fs.writeFileSync(filePath, code)
			return await runSpawn("node", [filePath], stdin, 7000)
		}

		if (lang === "python" || lang === "python3" || lang === "py") {
			const filePath = path.join(tmpDir, "script.py")
			fs.writeFileSync(filePath, code)
			return await runSpawn("python", [filePath], stdin, 7000)
		}

		if (lang === "c++" || lang === "cpp" || lang === "g++" || lang === "cplusplus") {
			const srcPath = path.join(tmpDir, "main.cpp")
			const binPath = path.join(tmpDir, process.platform === "win32" ? "main.exe" : "main")
			fs.writeFileSync(srcPath, code)

			const compileRes = await runExecFile("g++", [srcPath, "-o", binPath], 10000)
			if (compileRes.code !== 0) {
				return { run: { stdout: "", stderr: compileRes.stderr, code: compileRes.code } }
			}
			return await runSpawn(binPath, [], stdin, 7000)
		}

		if (lang === "c" || lang === "gcc") {
			const srcPath = path.join(tmpDir, "main.c")
			const binPath = path.join(tmpDir, process.platform === "win32" ? "main.exe" : "main")
			fs.writeFileSync(srcPath, code)

			const compileRes = await runExecFile("gcc", [srcPath, "-o", binPath], 10000)
			if (compileRes.code !== 0) {
				return { run: { stdout: "", stderr: compileRes.stderr, code: compileRes.code } }
			}
			return await runSpawn(binPath, [], stdin, 7000)
		}

		if (lang === "java") {
			// Extract class name or default to Main
			const match = code.match(/public\s+class\s+([A-Za-z0-9_]+)/)
			const className = match ? match[1] : "Main"
			const srcPath = path.join(tmpDir, `${className}.java`)
			fs.writeFileSync(srcPath, code)

			const compileRes = await runExecFile("javac", [srcPath], 10000)
			if (compileRes.code !== 0) {
				return { run: { stdout: "", stderr: compileRes.stderr, code: compileRes.code } }
			}
			return await runSpawn("java", ["-cp", tmpDir, className], stdin, 7000)
		}

		// Fallback for languages not installed locally
		return {
			run: {
				stdout: "",
				stderr: `[Engine Note] '${language}' is not installed locally on this server.\nTo run ${language}, install its compiler/runtime on your machine or configure PISTON_API_KEY in Kode-Kolab-backend/.env.`,
				code: 1,
			},
		}
	} finally {
		try {
			fs.rmSync(tmpDir, { recursive: true, force: true })
		} catch (e) {}
	}
}

function runSpawn(cmd, args, stdin, timeoutMs) {
	return new Promise((resolve) => {
		let stdout = ""
		let stderr = ""
		let killed = false

		const child = spawn(cmd, args, { timeout: timeoutMs, windowsHide: true })

		const timer = setTimeout(() => {
			killed = true
			try {
				child.kill("SIGKILL")
			} catch (e) {}
		}, timeoutMs)

		if (stdin && child.stdin) {
			child.stdin.write(stdin)
			child.stdin.end()
		}

		child.stdout.on("data", (chunk) => (stdout += chunk.toString()))
		child.stderr.on("data", (chunk) => (stderr += chunk.toString()))

		child.on("error", (err) => {
			clearTimeout(timer)
			resolve({
				run: {
					stdout: "",
					stderr: `Execution error (${cmd}): ${err.message}`,
					code: 1,
				},
			})
		})

		child.on("close", (code) => {
			clearTimeout(timer)
			if (killed) {
				stderr += "\n[Error] Execution timed out (exceeded limit)."
			}
			resolve({
				run: {
					stdout,
					stderr,
					code: code !== null ? code : 1,
				},
			})
		})
	})
}

function runExecFile(cmd, args, timeoutMs) {
	return new Promise((resolve) => {
		execFile(cmd, args, { timeout: timeoutMs }, (err, stdout, stderr) => {
			if (err) {
				resolve({ stdout: stdout || "", stderr: stderr || err.message, code: err.code || 1 })
			} else {
				resolve({ stdout: stdout || "", stderr: stderr || "", code: 0 })
			}
		})
	})
}

function executeRemotePiston({ url, key, payload }) {
	return new Promise((resolve, reject) => {
		const parsedUrl = new URL(url)
		const data = JSON.stringify(payload)
		const headers = {
			"Content-Type": "application/json",
			"Content-Length": Buffer.byteLength(data),
		}
		if (key) {
			headers["Authorization"] = key
		}

		const req = https.request(
			parsedUrl,
			{
				method: "POST",
				headers,
				timeout: 10000,
			},
			(res) => {
				let body = ""
				res.on("data", (chunk) => (body += chunk))
				res.on("end", () => {
					if (res.statusCode >= 200 && res.statusCode < 300) {
						try {
							return resolve(JSON.parse(body))
						} catch (e) {
							return reject(e)
						}
					}
					reject(new Error(`Piston API returned status ${res.statusCode}: ${body}`))
				})
			}
		)

		req.on("error", reject)
		req.on("timeout", () => {
			req.destroy()
			reject(new Error("Piston API request timed out"))
		})

		req.write(data)
		req.end()
	})
}

module.exports = {
	getRuntimes,
	executeCode,
}
