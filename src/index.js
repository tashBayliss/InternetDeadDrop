
// import modules (others are imported in relevent file (e.g. db, crypto))
const express = require('express');                             // module for building fast web applications
const fileUpload = require('express-fileupload');               // enables file upload
const cors = require('cors');                                   // allows embedding of external images, stylesheets etc
const bodyParser = require('body-parser');                      // need to parse uploaded files
const morgan = require('morgan');                               // logging tool
const fs = require('fs');                                       // file system
const _ = require('lodash');                                    // provides useful utility functions
const urlparser = require('url');                               // url parsing module
const getFileType = require('file-type').fromBuffer;            // file types

// local modules
const database = require('./database.js');
const crypto = require('./crypto.js');

// create express application
const app = express();

// define config variable
const config = {
    "siteDir": "public",
    "port": "8080",
    "files_location": "public/files"
}

// where HTML etc is ... in "public" folder
app.use(express.static(config.siteDir));

// set up cors and morgan
app.use(cors());
app.use(morgan('dev'));

// configuring to read incoming data 
// data sent to the server is stored in a couple parts of the request:
// req.body,and req.files, which store the message and the file uploaded.
app.use(fileUpload({
    createParentPath: true,
}));

app.use(bodyParser.json());                           // accept json encoded data from client (on submit)
app.use(bodyParser.urlencoded({                       // accept url encoded data from client (on submit)
    extended: true
}));               

// post request
// read incoming post data, including the file
// $curl -X POST localhost:8080 (in another terminal) - simulates an empty "submit" (post)
app.post('/', (req, res) => {
    // encryption variables
    const key = crypto.base64String(32);                                             // generate 32 byte key and 16 byte IV
    const iv = crypto.base64String(16);
    var urlenc = key.concat(iv);                                                    // create key for url

    const responsePage = fs.readFileSync('./'+ config.siteDir +'/response.html');   // use the response.html page to display
    var message = null;
    var filename;
    var origName = crypto.encrypt(req.files.upload_file.name, urlenc).toString('base64');

    const fileData = req.files.upload_file.data;
    const encryptedFileData = crypto.encrypt(fileData, urlenc);                     // encrypt the file data

    const chksm = crypto.checksum(urlenc);                                          // create checksum

    if(req.body) {
        message = req.body.message.slice(0, 255);                                   // validation of message length
        message = crypto.encrypt(message, urlenc).toString('base64');               // encrypt message into base64 format
    }
    else {
        res.send(500);
        return;
    }

    database.query(`SELECT FileName FROM Files`)
    .then(result => {

        // filter results from query
        const FileNames = result.filter(key => key != "meta")
                          .map(key => key.FileName);

        // make a filename while one with that doesnt already exist
        do {
            filename = crypto.base64String(12);
        } while (FileNames.includes(filename));
        

        // make query to database
        database.query("INSERT INTO Files (FileName, OrigName, Message, CheckSum) VALUES (?, ?, ?, ?)", [filename, origName, message, chksm])
        .then(res => {
            if(res) {
                console.log(res);
            }
        })
        .catch(err => console.log(err));

				// Make sure folder exists
				fs.mkdir('./' + config.files_location, {recursive: true}, (err) => {
						if (err) {
								console.err(err);
						}
				});

        const url = `http://localhost:8080/page/${filename}?key=${urlenc}`; 

        fs.writeFileSync('./'+ config.files_location +'/'+filename, encryptedFileData);    // save file to folder
        res.send(eval('`'+ responsePage +'`'));                                                     // evaluate as a template literal 
    })
    .catch(err => console.log(err));
});

// on get request of files/anything, allow download once then delete the file
app.get('/file/*', (req, res) => {
    const urlenc = req.query.key;

    const fileID = urlparser.parse(req.url).pathname.slice(6);

    database.query(`SELECT OrigName, CheckSum FROM Files WHERE FileName = \"${fileID}\"`)
        .then(result => {
            if (result[0].CheckSum != crypto.checksum(urlenc)) {
                res.sendStatus(403); // forbidden
                return;
            }

            // check if file exists
            if (fs.existsSync("./public/files/" + fileID)) {
				const encryptedFileData = fs.readFileSync("./public/files/" + fileID);

				let decryptedFileData = null;

				if(!encryptedFileData) {
					throw new Error("File Read Incorrectly");
				}
				else {
					decryptedFileData = crypto.decrypt(encryptedFileData, urlenc);

					database.query(`DELETE  FROM Files WHERE FileName = \"${fileID}\"`)
					.then(res => {
						if(res) {
							console.log(res);
						}
					})
					.catch(err => console.log(err));

					fs.unlinkSync("./public/files/" + fileID);
				}

                const OrigName = crypto.decrypt(Buffer.from(result[0].OrigName, 'base64'), urlenc).toString();
                const fileType = getFileType(decryptedFileData);

                // format to download
                res.writeHead(200, {
                    'Content-Disposition': `attachment;filename=${OrigName}`,
                    'Content-Type': fileType
                });
            
                res.end(decryptedFileData);
            }

            else {
                res.set('Content-Type', 'text/html')
                .status(404)
                .send(fs.readFileSync("./public/404.html").toString())
                .end();
            }
        })
        .catch(err => console.log(err));
});

// on get request of page/anything ...
app.get('/page/*', (req, res) => {

    // split the url to get only the name of the file
    // use this file name and place into url
    const fileID = urlparser.parse(req.url).pathname.slice(6);
	const urlenc = req.query.key;

    database.query(`SELECT * FROM Files WHERE FileName=\"${fileID}\"`)
    .then(result => {
		if (result[0]) {
			// if checksums don't match then complain
			if (result[0].CheckSum != crypto.checksum(urlenc)) {
                    res.sendStatus(403); // forbidden
                    return;
			}

			var message = "your file has not been sent with a message";

			if (result[0].Message) {
				message = result[0].Message;
				message = crypto.decrypt(Buffer.from(message, 'base64'), urlenc);
			}

			const url = `http://localhost:8080/file/${fileID}?key=${urlenc}`; 
            const origName = crypto.decrypt(Buffer.from(result[0].OrigName, 'base64'), urlenc).toString();

            // put into page.html
            const pagePage = fs.readFileSync('./'+ config.siteDir +'/page.html');   // use the page.html page to display
            res.send(eval('`'+ pagePage +'`'));                                     // evaluate as a template literal 
        }
        else {
            res.set('Content-Type', 'text/html')
            .status(404)
            .send(fs.readFileSync("./public/404.html").toString())
            .end();
        }
    })
    .catch(err => console.log(err));
});

// make server listen to port - in browser visit "localhost:8080"
// last thing in the file - "server is ready and available"
app.listen(config.port, () => {
    console.log("Listening on port " + config.port);
});