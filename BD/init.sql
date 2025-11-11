CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    birth_date DATE,
    passport_series_num VARCHAR(20) UNIQUE,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    department VARCHAR(100),
    position VARCHAR(100),
    salary DECIMAL(10, 2),
    hire_date DATE NOT NULL,
    is_fired BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);