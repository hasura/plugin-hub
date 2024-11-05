import fs from "fs";
import path from "path";
import cron from "node-cron";

// Save files under this directory
export const TMP = path.join(process.cwd(), process.env.TMP || 'tmp');
export const TMP_TTL = parseInt(process.env.TMP_TTL || '900');
export const TMP_PROFILE_HISTORY = path.join(TMP, process.env.PROFILE_HISTORY || 'profile-history');
export const PROFILE_HISTORY_TTL = parseInt(process.env.PROFILE_HISTORY_TTL || '1209600')

// Create the directory if it does not exist
if (!fs.existsSync(TMP)) {
    fs.mkdirSync(TMP);
}
if (!fs.existsSync(TMP_PROFILE_HISTORY)) {
    fs.mkdirSync(TMP_PROFILE_HISTORY);
}

// Start a cron job to delete files older than 15 minutes every minute
cron.schedule('* * * * *', deleteOldFiles);


export function deleteOldFiles() {
    let files = fs.readdirSync(TMP);
    const now = Date.now();
    files.forEach(file => {
        const filePath = path.join(TMP, file);
        const stat = fs.statSync(filePath);
        const age = (now - stat.mtime.getTime()) / 1000;
        if (stat.isFile() && age > TMP_TTL) { // older than 15 minutes
            fs.unlinkSync(filePath);
        }
    });
    files = fs.readdirSync(TMP_PROFILE_HISTORY);
    files.forEach(file => {
        const filePath = path.join(TMP, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            deleteHistoryFiles(filePath)
        } else if (stat.isFile()) {
            const age = (now - stat.mtime.getTime()) / 1000;
            if (age > PROFILE_HISTORY_TTL) { // older than 15 minutes
                fs.unlinkSync(filePath);
            }
        }
    });
}

export function deleteHistoryFiles(directory: string) {
    const now = Date.now();
    const files = fs.readdirSync(directory);
    files.forEach(file => {
        const filePath = path.join(TMP, file);
        const stat = fs.statSync(filePath);
        const age = (now - stat.mtime.getTime()) / 1000;
        if (age > PROFILE_HISTORY_TTL) { // older than 15 minutes
            fs.unlinkSync(filePath);
        }
    });
}