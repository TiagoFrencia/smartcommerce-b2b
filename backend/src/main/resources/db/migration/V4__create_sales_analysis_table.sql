CREATE TABLE sales_analysis (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    score INTEGER NOT NULL,
    executive_summary TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    created_at TIMESTAMP,
    CONSTRAINT fk_sales_analysis_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE sales_analysis_alerts (
    analysis_id BIGINT NOT NULL,
    alert TEXT,
    CONSTRAINT fk_alerts_analysis FOREIGN KEY (analysis_id) REFERENCES sales_analysis(id)
);
