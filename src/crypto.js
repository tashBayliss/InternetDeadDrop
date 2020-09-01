const crypto = require('crypto');

const algorithm = 'aes-256-ctr';

// make module
module.exports = {
		encrypt,
		decrypt,
		checksum,
    base64String
};

// make "random"
function base64String (len) {
    return crypto
        .randomBytes(Math.ceil((len*3)/4))          // list of "len" bytes
        .toString('base64')                         // Base64 encode
        .slice(0, len)                              // take the first "len" chars
        .replace(/\+/g, '0')                        // replace + with 0
        .replace(/\//g, '0')                        // replace / with 0       
}

// returns a 64 character long hash in hexadecimal characters
function checksum(data) {
    return crypto.createHash('sha3-256')
    .update(data)       // hash the data
    .digest("hex");      // read data as literal hex values of the bytes
}


function encrypt(data, keyIvPair) {
    const key = Buffer.from(keyIvPair).slice(0,32);
    const iv = Buffer.from(keyIvPair).slice(32, 48);
		const cipher = crypto.createCipheriv(algorithm, key, iv);
		return cipher.update(data);
}

function decrypt(data, keyIvPair) {
    const key = Buffer.from(keyIvPair).slice(0,32);
    const iv = Buffer.from(keyIvPair).slice(32, 48);
		const cipher = crypto.createDecipheriv(algorithm, key, iv);
		return cipher.update(data);
}
