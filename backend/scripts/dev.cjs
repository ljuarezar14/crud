// Compila TypeScript y reinicia Node cuando cambia el código compilado.
// Usa herramientas ya instaladas en el proyecto; no depende de ts-node-dev.
const { spawn, spawnSync } = require("node:child_process")
const path = require("node:path")

const root = path.resolve(__dirname, "..")
const tsc = path.join(root, "node_modules", "typescript", "bin", "tsc")
const entry = path.join(root, "dist", "index.js")

const firstBuild = spawnSync(process.execPath, [tsc], {
  cwd: root,
  stdio: "inherit",
})
if (firstBuild.status !== 0) process.exit(firstBuild.status || 1)

const compiler = spawn(process.execPath, [tsc, "--watch", "--preserveWatchOutput"], {
  cwd: root,
  stdio: "inherit",
})
const server = spawn(process.execPath, ["--watch", entry], {
  cwd: root,
  stdio: "inherit",
})

function stop() {
  compiler.kill()
  server.kill()
}

process.on("SIGINT", stop)
process.on("SIGTERM", stop)
compiler.on("error", (error) => {
  console.error("No se pudo iniciar TypeScript:", error.message)
  stop()
  process.exitCode = 1
})
server.on("error", (error) => {
  console.error("No se pudo iniciar Node:", error.message)
  stop()
  process.exitCode = 1
})
