import fs from "fs";
import path from "path";
import cron from "node-cron";

// Save files under this directory
export const TMP = path.join(process.cwd(), '/tmp');

// Create the directory if it does not exist
if (!fs.existsSync(TMP)) {
    fs.mkdirSync(TMP);
}

// Start a cron job to delete files older than 15 minutes every minute
cron.schedule('* * * * *', deleteOldFiles);


export function deleteOldFiles() {
    const files = fs.readdirSync(TMP);
    const now = Date.now();
    files.forEach(file => {
        const filePath = path.join(TMP, file);
        const stat = fs.statSync(filePath);
        const age = (now - stat.mtime.getTime()) / 1000;
        if (age > 15 * 60) { // older than 15 minutes
            fs.unlinkSync(filePath);
        }
    });
}