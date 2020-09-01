# Secure File/Message Transfer

## Title
Internet Dead Drop – One-time-view, encrypted message/file service

## Topic
Cryptography/ Secure File Sharing

## Task
Create a web-based application using a node.js server that allows a user to create a one-time link to an encrypted message/file, which disappears once viewed. 

The user inputs their message/file and submits it to the web page, which then communicates with a NodeJS server, encrypting the message and storing it in a database server-side for a certain amount of time, before its deleted.

The server returns a link which allows the user to retrieve the message back. When the user requests the link, a page with the message appears, but only once. If the link is used again, the site will only say that nothing could be found. 

## Assumptions

* I will need to create a NodeJS server
    - I chose NodeJS as its an easy-to-use language for writing web servers in, and will allow me to quickly put together a working and secure system◦
    - As a result, I will need to learn how to use NodeJS, as well as a library for MySQL (or mariaDB) in NodeJS, cyrptography, and how to dynamically create and send webpages to a user
* I can use HTML/CSS for all the front end, with JS to connect functionality from the webpage to the server

## Cyber Security
This concept digitises the age-old concept of “dead drops” to securely send information or goods from one person to the next. Links to the site will largely mimic this, but also using modern encryption methods, providing the security of a one-time message drop but also secure communication between two parties.

While this can be useful to a large number of parties, it could particularly benefit any company who may need to communicate with people in difficult positions, where security monitoring is a huge concern. In these cases, having a one-time, anonymous, end-to-end encrypted service to communicate through would be a valuable asset in preventing the leaking of information via data breaches or surveillance.


## What do I hope to demonstrate?
Upon completion, this project would aim to demonstrate the viability of one-time use messaging platforms in providing a safe and secure way to send information from one person to the next. It could pave the way for systems involving two-way end-to-end encrypted communication where no information is stored at all, almost a combination of the systems seen in both WhatsApp and Snapchat.

## Potential Future Additions
* Pen test to flag any vulnerabilties and improve it
* Detection of malicious files being uploaded and reject
* make code more scalable
