const { spawn } = require("child_process");
const path = require("path");

// Default absolute path to the Python model script (adjust as needed)
const DEFAULT_SCRIPT_PATH = "/mnt/data/run_model.py";

/**
 * Runs the Python AI model script.
 * @param {string} [scriptPath] Optional absolute path to run_model.py. Uses default if not provided.
 * @returns {Promise<void>}
 */
function runModel(scriptPath = DEFAULT_SCRIPT_PATH) {
  return new Promise((resolve, reject) => {
    const PYTHON = "python3"; // or full path to venv python
    const script = scriptPath;

    const proc = spawn(PYTHON, [script], { env: process.env });

    proc.stdout.on("data", (data) => console.log(`[modelRunner] ${data}`));
    proc.stderr.on("data", (err) =>
      console.error(`[modelRunner ERROR] ${err}`)
    );

    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`run_model.py exited with code ${code}`));
    });
  });
}

module.exports = runModel;
