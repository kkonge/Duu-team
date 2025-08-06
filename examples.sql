CREATE TABLE users (
    id VARCHAR(20) NOT NULL PRIMARY KEY,
    password VARCHAR(20) NOT NULL
);

INSERT INTO users VALUES('1','1234@');
INSERT INTO users VALUES('2','5678@');
INSERT INTO users VALUES('3','91011@');


CREATE TABLE pets(
    age int(10) NOT NULL,
    name VARCHAR(20) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    breed VARCHAR(20) NOT NULL,
    id VARCHAR(20) NOT NULL,
    FOREIGN KEY(id) REFERENCES users(id)
);

INSERT INTO pets VALUES (2,'apple','male','Golden Retriever','1');
INSERT INTO pets VALUES (1,'banana','female','Border Collie','2');
INSERT INTO pets VALUES (1,'cute','female','Maltese','3');




