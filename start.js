const { exec } = require("child_process");

const child = exec("pnpm start", { cwd: "C:\\ciompi" });

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
