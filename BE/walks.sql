CREATE TABLE walks (
    count INT AUTO_INCREMENT PRIMARY KEY,  -- 산책 횟수별 고유번호 (PK)
    id VARCHAR(64) NOT NULL,
    distance FLOAT NOT NULL,
    walk_time INT NOT NULL,
    started_at DATETIME NOT NULL,
    ended_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_walks_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE walk_routes (
    count INT AUTO_INCREMENT PRIMARY KEY,
    id INT NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    timestamp DATETIME NOT NULL,
    CONSTRAINT fk_routes_walk FOREIGN KEY (walk_id) 
        REFERENCES walks(count) ON UPDATE CASCADE ON DELETE CASCADE
);
