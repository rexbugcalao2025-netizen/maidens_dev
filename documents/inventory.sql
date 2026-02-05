CREATE TABLE inventory.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),

  category_id UUID,
  sub_category_id UUID,

  is_active BOOLEAN DEFAULT TRUE,
  is_deleted BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE inventory.stock_levels (
  product_id UUID PRIMARY KEY
    REFERENCES inventory.products(id)
    ON DELETE RESTRICT,

  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),

  updated_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE TYPE inventory.stock_movement_type AS ENUM (
  'IN',
  'OUT',
  'ADJUSTMENT'
);

CREATE TABLE inventory.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  product_id UUID NOT NULL
    REFERENCES inventory.products(id)
    ON DELETE RESTRICT,

  movement_type inventory.stock_movement_type NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),

  reference TEXT, -- order id, reason, note
  created_by UUID, -- user/admin later

  created_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE INDEX idx_stock_movements_product
ON inventory.stock_movements(product_id);

CREATE INDEX idx_products_active
ON inventory.products(is_deleted, is_active);


CREATE OR REPLACE FUNCTION inventory.adjust_stock(
	p_product_id UUID,
	p_movement_type inventory.stock_movement_type,
	p_quantity INTEGER CHECK (p_quantity <> 0),
	p_reference TEXT DEFAULT NULL
)
RETURNS VOID 
LANGUAGE plpgsql
AS $$
BEGIN
	-- prevent invalid quantity
	IF p_quantity <= 0 THEN
		RAISE EXCEPTION 'Quantity must be greated than zero';
	END IF;

	-- ensure stock row exists
	INSERT INTO inventory.stock_levels (product_id, quantity)
	VALUES (p_product_id, 0)
	ON CONFLICT (product_id) DO NOTHING;

	-- OUT movement: ensure enough stock
	IF p_movement_type = 'OUT' THEN
		UPDATE inventory.stock_levels
		SET quantity = quantity - p_quantity,
			updated_at = NOW()
		WHERE product_id = p_product_id
		  AND quantity >= p_quantity;

		IF NOT FOUND THEN
			RAISE EXCEPTION 'Insuficient stock for product %', p_product_id;
		END IF;

	ELSE	

		-- IN or ADJUSTMENT
		UPDATE inventory.stock_levels
		SET quantity = quantity + p_quantity,
			updated_at = NOW()
		WHERE product_id = p_product_id;
		  
	END IF;


	-- record movement
	INSERT INTO inventory.stock_movements (
		product_id,
		movement_type,
		quantity,
		reference
	)
	VALUES (
		p_product_id,
		p_movement_type,
		p_quantity,
		p_reference
	);

END;

$$;


ALTER TABLE inventory.products
ADD COLUMN sku TEXT UNIQUE, 
ADD COLUMN unit TEXT;


ALTER TABLE inventory.stock_movements
ADD COLUMN batch_id UUID REFERENCES inventory.inventory_batches(id), 
ADD COLUMN reference_type TEXT, -- service, manual, purchase
ADD COLUMN reference_id TEXT -- mongodb id
;


CREATE TABLE inventory.supplier (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name TEXT NOT NULL,
	contact_info TEXT
);


CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated
BEFORE UPDATE ON inventory.products
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_stock_levels_updated
BEFORE UPDATE ON inventory.stock_levels
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_stock_movements_created_at
ON inventory.stock_movements(created_at);



CREATE VIEW inventory.v_product_stock AS
SELECT
	p.id AS product_id,
	p.name,
	p.sku,
	p.unit,
	p.price,
	s.quantity,
	p.is_active,
	p.is_deleted
FROM inventory.products p
JOIN inventory.stock_levels s
  ON s.product_id = p.id
WHERE p.is_deleted = FALSE;


CREATE VIEW inventory.v_stock_movements AS
SELECT
	m.id,
	m.product_id,
	p.name AS product_name,
	m.movement_type,
	m.quantity,
	m.reference_type,
	m.reference_id,
	m.created_at
FROM inventory.stock_movements m
JOIN inventory.products p
  ON p.id = m.product_id;
  
  
CREATE ROLE app_user
LOGIN
PASSWORD '123app';


GRANT USAGE ON SCHEMA inventory TO app_user;

GRANT SELECT ON inventory.v_product_stock TO app_user;

GRANT SELECT ON inventory.v_stock_movements TO app_user;

GRANT EXECUTE ON FUNCTION inventory.adjust_stock TO app_user;


CREATE VIEW inventory.v_low_stock AS
SELECT
	product_id,
	name,
	quantity
FROM inventory.v_product_stock
WHERE quantity <= 5
  AND is_active = TRUE;
  
  
COMMENT ON VIEW inventory.v_product_stock
IS 'Read-only product stock view. Do not query stock_levels directly.';

COMMENT ON FUNCTION inventory.adjust_stock
IS 'Single source of truth for inventory mutations';



REVOKE INSERT, UPDATE, DELETE
ON inventory.stock_levels,
   inventory.stock_movements
FROM app_user;

