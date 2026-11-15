const path = require("node:path")
const { spawnSync } = require("node:child_process")

const cli = path.join(__dirname, "..", "node_modules", "prisma", "build", "index.js")
const result = spawnSync(process.execPath, [cli, ...process.argv.slice(2)], {
  cwd: path.join(__dirname, ".."),
  env: { ...process.env, JITI_FS_CACHE: "false" },
  stdio: "inherit",
})
process.exitCode = result.status ?? 1
