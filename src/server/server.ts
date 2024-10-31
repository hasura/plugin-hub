import express, {Request, Response} from 'express';
import {validatePlugin, filePlugin} from "../plugins/index.js";
import {TMP} from "../plugins/common/index.js";
import {profilePlugin} from "../plugins/profile/index.js";

const app = express();
const PORT = process.env.PORT || 8787;

// Increase payload size limits
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

app.get('/health', (req: Request, res: Response) => {
    res.json({status: 'ok'});
});

app.post('/validate', validatePlugin);
app.post('/file-out', filePlugin);
app.post('/profile', profilePlugin);

// Serve files under `files` path
app.use('/files', express.static(TMP));

app.listen(PORT, () => {
    console.log(`Hasura Plugin Hub Server running at http://localhost:${PORT}`);
});
