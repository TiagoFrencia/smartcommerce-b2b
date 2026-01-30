ALTER TABLE sales_analysis ADD COLUMN client_id BIGINT;

ALTER TABLE sales_analysis ADD CONSTRAINT fk_sales_analysis_client FOREIGN KEY (client_id) REFERENCES clients(id);
