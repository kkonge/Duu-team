CREATE TABLE users (
    id VARCHAR(100) NOT NULL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(20) NOT NULL
);

ALTER TABLE users ADD COLUMN Nickname VARCHAR(50); 

ALTER TABLE users ADD birth_date DATE NOT NULL;

ALTER TABLE users ADD family_id INT NOT NULL DEFAULT;

ALTER TABLE users
ADD COLUMN refresh_token VARCHAR(500) DEFAULT NULL;

--> table 이렇게 됨 
CREATE TABLE users (
    id VARCHAR(100) NOT NULL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    Nickname VARCHAR(50) NOT NULL, 
    birth_date DATE NOT NULL,
    family_id INT NOT NULL,
    refresh_token VARCHAR(500) DEFAULT NULL
);

INSERT INTO users (id, username, password) VALUES 
('1', 'user1', '1234@'),
('2', 'user2', '5678@'),
('3', 'user3', '91011@');



CREATE TABLE pets (
    id VARCHAR(100) NOT NULL,                      
    familyId VARCHAR(20) NOT NULL,                
    name VARCHAR(20) NOT NULL,                     
    breed VARCHAR(20) NOT NULL,                    
    birth DATE,                                   
    sex VARCHAR(10),                              
    neutered BOOLEAN,                             
    weight DECIMAL(5,2),                          
    unit VARCHAR(5) DEFAULT 'kg',                 
    notes TEXT,                                   
    photoUrl VARCHAR(255),                        
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  
    createdBy VARCHAR(20) NOT NULL,               
    FOREIGN KEY (id) REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

'예시 insert문 photoUrl 실제 있는 거로 수정할 필요 있음'
INSERT INTO pets (id, familyId, name, breed, birth, sex, neutered, weight, unit, notes, photoUrl, createdAt, updatedAt, createdBy)
VALUES 
('1', 'fam1', 'Buddy', 'Labrador', '2020-05-10', 'Male', TRUE, 25.50, 'kg', 'Friendly dog', 'http://example.com/photo1.jpg', NOW(), NOW(), '1'),

('2', 'fam2', 'Lucy', 'Poodle', '2018-08-21', 'Female', FALSE, 8.75, 'kg', 'Very active', 'http://example.com/photo2.jpg', NOW(), NOW(), '2'),

('3', 'fam3', 'Max', 'Beagle', '2019-11-15', 'Male', TRUE, 12.00, 'kg', 'Loves to play', 'http://example.com/photo3.jpg', NOW(), NOW(), '3');