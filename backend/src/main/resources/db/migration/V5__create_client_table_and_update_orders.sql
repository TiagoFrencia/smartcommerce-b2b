CREATE TABLE clients (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(255),
    contact_email VARCHAR(255),
    tier VARCHAR(255),
    user_id BIGINT
);

ALTER TABLE clients
    ADD CONSTRAINT fk_clients_users
    FOREIGN KEY (user_id)
    REFERENCES users (id);

ALTER TABLE orders
    ADD COLUMN client_id BIGINT;

ALTER TABLE orders
    ADD CONSTRAINT fk_orders_clients
    FOREIGN KEY (client_id)
    REFERENCES clients (id);
