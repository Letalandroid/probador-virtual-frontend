-- Insert categories and products with correct gender values (lowercase)
INSERT INTO public.categories (name, description, is_active) VALUES
('Vestidos', 'Vestidos elegantes para toda ocasión', true),
('Blusas', 'Blusas y camisas para mujeres', true),
('Pantalones', 'Pantalones y jeans', true),
('Camisetas', 'Camisetas y polos', true),
('Chaquetas', 'Chaquetas y abrigos', true),
('Sudaderas', 'Sudaderas y hoodies', true),
('Bolsos', 'Bolsos y carteras', true),
('Relojes', 'Relojes y accesorios de tiempo', true),
('Gafas', 'Gafas y lentes', true),
('Joyas', 'Joyas y bisutería', true)
ON CONFLICT (name) DO NOTHING;

-- Insert test products with corrected lowercase gender values
INSERT INTO public.products (name, brand, price, images, category_id, gender, sizes, stock_quantity, is_active, description, color) VALUES
-- Women's products
('Vestido Elegante de Verano', 'Fashion Forward', 89.99, ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop'], 
 (SELECT id FROM categories WHERE name = 'Vestidos'), 'women', ARRAY['XS', 'S', 'M', 'L'], 50, true, 'Vestido elegante perfecto para ocasiones especiales', 'Rose'),

('Vestido Casual Floral', 'Garden Collection', 65.99, ARRAY['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop'],
 (SELECT id FROM categories WHERE name = 'Vestidos'), 'women', ARRAY['XS', 'S', 'M', 'L', 'XL'], 30, true, 'Vestido casual con estampado floral', 'Floral'),

('Blusa Floral Primavera', 'Garden Collection', 45.99, ARRAY['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop'],
 (SELECT id FROM categories WHERE name = 'Blusas'), 'women', ARRAY['XS', 'S', 'M', 'L'], 40, true, 'Blusa con estampado floral primaveral', 'Floral'),

('Blusa Ejecutiva', 'Professional Line', 55.99, ARRAY['https://images.unsplash.com/photo-1551048632-6ac23ef1a7e9?w=400&h=500&fit=crop'],
 (SELECT id FROM categories WHERE name = 'Blusas'), 'women', ARRAY['XS', 'S', 'M', 'L', 'XL'], 25, true, 'Blusa elegante para uso profesional', 'Blanco'),

('Jeans Skinny Fit Mujer', 'Urban Style', 69.99, ARRAY['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop'],
 (SELECT id FROM categories WHERE name = 'Pantalones'), 'women', ARRAY['26', '28', '30', '32', '34'], 60, true, 'Jeans de corte ajustado para mujeres', 'Azul'),

('Bolso de Mano Elegante', 'Luxury Accessories', 129.99, ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop'],
 (SELECT id FROM categories WHERE name = 'Bolsos'), 'women', ARRAY['Único'], 25, true, 'Bolso elegante de mano', 'Negro'),

('Collar de Perlas', 'Elegant Jewelry', 75.99, ARRAY['https://images.unsplash.com/photo-1515562141207-a7a88fb7ce338?w=400&h=500&fit=crop'],
 (SELECT id FROM categories WHERE name = 'Joyas'), 'women', ARRAY['Único'], 15, true, 'Collar elegante de perlas', 'Perla'),

-- Men's products
('Camiseta Básica Premium', 'StyleAI Collection', 29.99, ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop'],
 (SELECT id FROM categories WHERE name = 'Camisetas'), 'men', ARRAY['S', 'M', 'L', 'XL', 'XXL'], 80, true, 'Camiseta básica de alta calidad', 'Negro'),

('Camiseta Deportiva', 'Active Wear', 35.99, ARRAY['https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=500&fit=crop'],
 (SELECT id FROM categories WHERE name = 'Camisetas'), 'men', ARRAY['S', 'M', 'L', 'XL', 'XXL'], 45, true, 'Camiseta deportiva transpirable', 'Azul'),

('Chaqueta de Cuero', 'Luxury Line', 199.99, ARRAY['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop'],
 (SELECT id FROM categories WHERE name = 'Chaquetas'), 'men', ARRAY['S', 'M', 'L', 'XL'], 15, true, 'Chaqueta de cuero genuino', 'Negro'),

('Hoodie Oversized', 'Comfort Zone', 79.99, ARRAY['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop'],
 (SELECT id FROM categories WHERE name = 'Sudaderas'), 'men', ARRAY['S', 'M', 'L', 'XL', 'XXL'], 35, true, 'Sudadera con capucha de corte amplio', 'Gris'),

-- Kids products
('Camiseta Infantil Colorida', 'Kids Collection', 19.99, ARRAY['https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&h=500&fit=crop'],
 (SELECT id FROM categories WHERE name = 'Camisetas'), 'kids', ARRAY['2T', '3T', '4T', '5T', '6T'], 40, true, 'Camiseta colorida para niños', 'Multicolor'),

('Vestido Infantil Princesa', 'Little Dreams', 39.99, ARRAY['https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=500&fit=crop'],
 (SELECT id FROM categories WHERE name = 'Vestidos'), 'kids', ARRAY['2T', '3T', '4T', '5T', '6T'], 20, true, 'Vestido de princesa para niñas', 'Rosa'),

-- Unisex accessories
('Reloj Deportivo', 'Tech Watch', 89.99, ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop'],
 (SELECT id FROM categories WHERE name = 'Relojes'), 'unisex', ARRAY['S', 'M', 'L'], 30, true, 'Reloj deportivo inteligente', 'Negro'),

('Gafas de Sol Aviador', 'Sun Protection', 45.99, ARRAY['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=500&fit=crop'],
 (SELECT id FROM categories WHERE name = 'Gafas'), 'unisex', ARRAY['Único'], 50, true, 'Gafas de sol estilo aviador', 'Negro');