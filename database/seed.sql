USE skillswap_db;

INSERT INTO categories (category_name) VALUES
('Programming'),('Graphic Design'),('Languages'),('Music'),('Business'),('Photography');

INSERT INTO skills (skill_name,category_id) VALUES
('Java',1),('Python',1),('JavaScript',1),('React',1),
('Photoshop',2),('UI/UX Design',2),('English',3),('Japanese',3),
('Guitar',4),('Piano',4),('Digital Marketing',5),('Photography',6);

-- Demo passwords are bcrypt hashes for the credentials in README.md.
INSERT INTO users (full_name,email,password,phone,bio,location,role) VALUES
('Sarah Fernando','sarah@example.com','$2a$12$Q6f8x6q4cZ4v6YfX3gW0PueYQ2Z4qv0s0eJjVqv6f7z7QJ8Zq6Z5W','0711111111','Frontend developer and UI designer','Colombo','USER'),
('Alex Perera','alex@example.com','$2a$12$Q6f8x6q4cZ4v6YfX3gW0PueYQ2Z4qv0s0eJjVqv6f7z7QJ8Zq6Z5W','0722222222','Graphic designer and photographer','Kandy','USER'),
('Daniel Silva','daniel@example.com','$2a$12$Q6f8x6q4cZ4v6YfX3gW0PueYQ2Z4qv0s0eJjVqv6f7z7QJ8Zq6Z5W','0733333333','Python developer and musician','Galle','USER'),
('Nimal Jayasinghe','nimal@example.com','$2a$12$Q6f8x6q4cZ4v6YfX3gW0PueYQ2Z4qv0s0eJjVqv6f7z7QJ8Zq6Z5W','0744444444','Digital marketing enthusiast','Kurunegala','USER'),
('Admin User','admin@skillswap.com','$2a$12$Q6f8x6q4cZ4v6YfX3gW0PueYQ2Z4qv0s0eJjVqv6f7z7QJ8Zq6Z5W','0755555555','System administrator','Colombo','ADMIN');

INSERT INTO user_skills (user_id,skill_id,proficiency_level,years_experience) VALUES
(1,3,'Advanced',3),(1,4,'Intermediate',2),(1,6,'Advanced',3),
(2,5,'Advanced',4),(2,12,'Intermediate',2),
(3,2,'Advanced',4),(3,9,'Advanced',5),
(4,11,'Advanced',3),(4,7,'Intermediate',2);

INSERT INTO learning_requests (user_id,skill_id,description,status) VALUES
(1,5,'I want to improve my Photoshop skills.','ACTIVE'),
(2,3,'I want to learn JavaScript for web development.','ACTIVE'),
(3,6,'I want to learn modern UI/UX principles.','ACTIVE'),
(4,2,'I want to improve my Python programming.','ACTIVE');

INSERT INTO swap_requests
(requester_id,receiver_id,offered_skill_id,requested_skill_id,message,status)
VALUES
(1,2,3,5,'I can teach JavaScript in exchange for Photoshop.','ACCEPTED'),
(2,3,5,2,'I can teach Photoshop if you can teach Python.','PENDING'),
(3,4,9,11,'I can teach Guitar in exchange for Digital Marketing.','ACCEPTED');

INSERT INTO sessions
(swap_request_id,session_date,start_time,duration_minutes,status,notes)
VALUES
(1,'2026-09-01','16:00:00',60,'COMPLETED','JavaScript and Photoshop exchange session'),
(1,'2026-09-08','16:00:00',60,'SCHEDULED','Second skill exchange session'),
(3,'2026-09-03','17:00:00',90,'SCHEDULED','Guitar and digital marketing session');

INSERT INTO reviews (session_id,reviewer_id,rating,comment) VALUES
(1,1,5,'Excellent session.'),
(1,2,5,'Very clear and useful.');
