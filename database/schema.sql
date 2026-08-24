
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  bio TEXT,
  location VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'USER'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE skills (
  skill_id INT AUTO_INCREMENT PRIMARY KEY,
  skill_name VARCHAR(100) NOT NULL UNIQUE,
  category_id INT NOT NULL,
  CONSTRAINT fk_skills_category
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_skills (
  user_skill_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  skill_id INT NOT NULL,
  proficiency_level VARCHAR(30) NOT NULL,
  years_experience INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_user_skills_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_user_skills_skill
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT uq_user_skill UNIQUE (user_id, skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE learning_requests (
  learning_req_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  skill_id INT NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  CONSTRAINT fk_learning_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_learning_skill
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE swap_requests (
  swap_request_id INT AUTO_INCREMENT PRIMARY KEY,
  requester_id INT NOT NULL,
  receiver_id INT NOT NULL,
  offered_skill_id INT NOT NULL,
  requested_skill_id INT NOT NULL,
  message TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  request_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_swap_requester
    FOREIGN KEY (requester_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_swap_receiver
    FOREIGN KEY (receiver_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_swap_offered_skill
    FOREIGN KEY (offered_skill_id) REFERENCES skills(skill_id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_swap_requested_skill
    FOREIGN KEY (requested_skill_id) REFERENCES skills(skill_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE sessions (
  session_id INT AUTO_INCREMENT PRIMARY KEY,
  swap_request_id INT NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
  notes TEXT,
  CONSTRAINT fk_session_swap
    FOREIGN KEY (swap_request_id) REFERENCES swap_requests(swap_request_id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE reviews (
  review_id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  rating INT NOT NULL,
  comment TEXT,
  review_date DATE NOT NULL DEFAULT (CURRENT_DATE),
  CONSTRAINT fk_review_session
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_review_reviewer
    FOREIGN KEY (reviewer_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT uq_session_reviewer UNIQUE (session_id, reviewer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
