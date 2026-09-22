-- ========================================================================
-- QuickEats: Assign real coordinates to existing restaurants
-- ------------------------------------------------------------------------
-- The "Near You" home feature needs geographic coordinates. These existing
-- restaurants already declare their city in the Address column, so we set
-- the real city centre coordinates for them. Restaurants whose address has
-- no identifiable city stay NULL and are simply skipped by the nearby query.
-- Safe to run multiple times (only updates rows whose coordinates are NULL).
-- ========================================================================

-- Mumbai (Dominos - 123 Pizza Street, Mumbai)
UPDATE [Restaurants] SET [Latitude] = 19.0760, [Longitude] = 72.8777
WHERE [Id] = 1 AND [Latitude] IS NULL;

-- Delhi (Burger King - 456 Burger Lane, Delhi)
UPDATE [Restaurants] SET [Latitude] = 28.6139, [Longitude] = 77.2090
WHERE [Id] = 3 AND [Latitude] IS NULL;

-- Hyderabad (Biryani House - 789 Biryani Road, Hyderabad)
UPDATE [Restaurants] SET [Latitude] = 17.3850, [Longitude] = 78.4867
WHERE [Id] = 4 AND [Latitude] IS NULL;

-- Mumbai (Owner One Pizzeria - Mumbai, India)
UPDATE [Restaurants] SET [Latitude] = 19.0760, [Longitude] = 72.8777
WHERE [Id] = 5 AND [Latitude] IS NULL;

-- Jaipur (Spice Garden - 321 Spice Nagar, Jaipur)
UPDATE [Restaurants] SET [Latitude] = 26.9124, [Longitude] = 75.7873
WHERE [Id] = 10 AND [Latitude] IS NULL;

-- Bangalore (Sushi World - 555 Tokyo Street, Bangalore)
UPDATE [Restaurants] SET [Latitude] = 12.9716, [Longitude] = 77.5946
WHERE [Id] = 11 AND [Latitude] IS NULL;

-- Pune (Taco Fiesta - 888 Mexico Lane, Pune)
UPDATE [Restaurants] SET [Latitude] = 18.5204, [Longitude] = 73.8567
WHERE [Id] = 12 AND [Latitude] IS NULL;

-- Chennai (Dragon Wok - 111 Dragon Road, Chennai)
UPDATE [Restaurants] SET [Latitude] = 13.0827, [Longitude] = 80.2707
WHERE [Id] = 13 AND [Latitude] IS NULL;

-- Goa (Pasta Palace - 222 Italy Street, Goa)
UPDATE [Restaurants] SET [Latitude] = 15.2993, [Longitude] = 74.1240
WHERE [Id] = 14 AND [Latitude] IS NULL;

-- Kolkata (Burger Barn - 444 Barn Lane, Kolkata)
UPDATE [Restaurants] SET [Latitude] = 22.5726, [Longitude] = 88.3639
WHERE [Id] = 15 AND [Latitude] IS NULL;

-- Cochin (Curry House - 666 Curry Road, Cochin)
UPDATE [Restaurants] SET [Latitude] = 9.9312, [Longitude] = 76.2673
WHERE [Id] = 16 AND [Latitude] IS NULL;

-- Lucknow (Grill Master - 777 Grill Avenue, Lucknow)
UPDATE [Restaurants] SET [Latitude] = 26.8467, [Longitude] = 80.9462
WHERE [Id] = 17 AND [Latitude] IS NULL;

-- ========================================================================
-- NOTE: Restaurants without a city in their address (Owner's Kitchen/Foodville,
-- Bob's Burgers/100 Main St, Carol's Curry/200 Oak Ave, Owner B Burger Joint)
-- intentionally keep NULL coordinates until a real location is known.
-- ========================================================================