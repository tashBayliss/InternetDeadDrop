DROP DATABASE IF EXISTS sft;
CREATE DATABASE sft;
USE sft;

CREATE TABLE Files (
    ID int NOT NULL AUTO_INCREMENT,
    FileName varchar(12) NOT NULL UNIQUE,
    OrigName varchar(340) NOT NULL,
    Message varchar(340) NULL,
    CheckSum varchar(65) NOT NULL,
    PRIMARY KEY (ID)
);

/* 255 bytes in base64 encoding is 340 charactors */

SELECT * FROM Files;
