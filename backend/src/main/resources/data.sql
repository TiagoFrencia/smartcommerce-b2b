-- ==========================================
-- SCRIPT DE DATOS DE PRUEBA - B2B SCENARIO
-- ==========================================

-- 1. CLIENTE (Global Logistics S.A.)
-- ID 100 para evitar conflictos
INSERT INTO users (id, email, password, first_name, last_name, enabled, created_at)
VALUES (100, 'admin@globallogistics.com', '$2a$10$xn3LI/AjqicFYZFruO4hqfo4op2.F.DN8.1.2.3.4.5.6.7.8.9.0', 'Global', 'Logistics S.A.', true, '2025-12-01 10:00:00')
ON CONFLICT (id) DO NOTHING;

-- 2. CATEGORÍAS
INSERT INTO categories (id, name, description, active)
VALUES (100, 'Enterprise Infrastructure', 'Servidores y equipamiento de red de alto rendimiento', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO categories (id, name, description, active)
VALUES (101, 'Software & Licensing', 'Licencias corporativas y SaaS', true)
ON CONFLICT (id) DO NOTHING;

-- 3. PRODUCTOS
-- Precios altos para escenario B2B
INSERT INTO products (id, sku, name, description, price, stock_quantity, category_id, created_at)
VALUES 
(100, 'SRV-RACK-PRO-X10', 'Servidor Rack Pro X10', 'Servidor Dual-Socket, 256GB RAM, 10TB SSD Cluster', 5500.00, 50, 100, '2025-12-01 00:00:00'),
(101, 'LPT-DEV-STATION', 'Laptop Developer Station', 'M2 Max, 64GB RAM, 2TB SSD, Pantalla 16inc', 2800.00, 100, 100, '2025-12-01 00:00:00'),
(102, 'SW-ENT-SUITE', 'Enterprise Suite License (Yearly)', 'Licencia anual SaaS completa para 50 usuarios', 4500.00, 9999, 101, '2025-12-01 00:00:00'),
(103, 'NET-SW-100G', 'Core Switch 100GbE', 'Switch de fibra óptica para datacenter, 48 puertos', 8200.00, 20, 100, '2025-12-01 00:00:00')
ON CONFLICT (id) DO NOTHING;


-- 4. ÓRDENES (Enero 2026)
-- Escenario de crecimiento: Prueba -> Piloto -> Despliegue masivo

-- Orden 1: Compra pequeña (Prueba de concepto) - 05 Ene 2026
-- 1 Laptop
INSERT INTO orders (id, user_id, total, status, created_at)
VALUES (1001, 100, 2800.00, 'COMPLETED', '2026-01-05 09:30:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (id, order_id, product_id, quantity, price)
VALUES (10001, 1001, 101, 1, 2800.00) -- 1x Laptop
ON CONFLICT (id) DO NOTHING;


-- Orden 2: Compra Mediana (Equipamiento inicial) - 15 Ene 2026
-- 2 Servidores + 1 Licencia
-- Total: (2 * 5500) + 4500 = 11000 + 4500 = 15500
INSERT INTO orders (id, user_id, total, status, created_at)
VALUES (1002, 100, 15500.00, 'COMPLETED', '2026-01-15 14:15:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (id, order_id, product_id, quantity, price)
VALUES 
(10002, 1002, 100, 2, 5500.00), -- 2x Server
(10003, 1002, 102, 1, 4500.00)  -- 1x Licencia
ON CONFLICT (id) DO NOTHING;


-- Orden 3: Compra Grande (Despliegue completo) - 26 Ene 2026
-- 10 Servidores + 20 Laptops + 5 Switches + 2 Licencias
-- Total: (10*5500) + (20*2800) + (5*8200) + (2*4500)
--      = 55,000  +  56,000   +  41,000  +  9,000
--      = 161,000
INSERT INTO orders (id, user_id, total, status, created_at)
VALUES (1003, 100, 161000.00, 'COMPLETED', '2026-01-26 11:00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (id, order_id, product_id, quantity, price)
VALUES 
(10004, 1003, 100, 10, 5500.00), -- 10x Server
(10005, 1003, 101, 20, 2800.00), -- 20x Laptop
(10006, 1003, 103, 5, 8200.00),  -- 5x Switch
(10007, 1003, 102, 2, 4500.00)   -- 2x Licencia
ON CONFLICT (id) DO NOTHING;

-- Ajustar la secuencia para evitar errores en futuros inserts
-- (Opcional, pero buena práctica si el sistema sigue corriendo)
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));
SELECT setval('order_items_id_seq', (SELECT MAX(id) FROM order_items));
