-- ========================================================================
-- QuickEats Demo & Development Seed Data
-- Enriches Orders, OrderDeliveries, and Rider tasks for realistic Dashboards
-- Safe to run multiple times (uses IF NOT EXISTS / UPDATE)
-- ========================================================================

-- 1. Ensure Rider User exists with Known ID and Credentials
IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = 'rider@gmail.com')
BEGIN
    INSERT INTO [Users] ([Name], [Email], [PhoneNumber], [PasswordHash], [Role], [IsActive], [CreatedAt], [ProfileImageUrl])
    VALUES ('Alex Rider', 'rider@gmail.com', '9876543210', '$2a$11$6wpLfJnRkkX6rUQbSyLlRujCMRUapa.EQc.ZQh7S06bznqDPhx4IC', 'DeliveryPartner', 1, GETUTCDATE(), '');
END
ELSE
BEGIN
    UPDATE [Users] 
    SET [Role] = 'DeliveryPartner', [IsActive] = 1, [Name] = 'Alex Rider'
    WHERE [Email] = 'rider@gmail.com';
END

DECLARE @RiderId INT;
SELECT @RiderId = [Id] FROM [Users] WHERE [Email] = 'rider@gmail.com';

-- 2. Ensure Secondary Rider exists for Admin Dispatch list
IF NOT EXISTS (SELECT 1 FROM [Users] WHERE [Email] = 'rider2@gmail.com')
BEGIN
    INSERT INTO [Users] ([Name], [Email], [PhoneNumber], [PasswordHash], [Role], [IsActive], [CreatedAt], [ProfileImageUrl])
    VALUES ('Sam Courier', 'rider2@gmail.com', '9876543215', '$2a$11$6wpLfJnRkkX6rUQbSyLlRujCMRUapa.EQc.ZQh7S06bznqDPhx4IC', 'DeliveryPartner', 1, GETUTCDATE(), '');
END

-- 3. Update Existing Orders to cover all realistic Lifecycle States
-- Ready for Pickup (Ready for Admin Dispatch)
UPDATE [Orders] SET [Status] = 'Ready for Pickup', [CreatedAt] = DATEADD(MINUTE, -30, GETUTCDATE()) WHERE [Id] = 104;
UPDATE [Orders] SET [Status] = 'Ready for Pickup', [CreatedAt] = DATEADD(MINUTE, -15, GETUTCDATE()) WHERE [Id] = 105;

-- In Transit / Out for Delivery
UPDATE [Orders] SET [Status] = 'Out for Delivery', [CreatedAt] = DATEADD(HOUR, -1, GETUTCDATE()) WHERE [Id] = 103;

-- Preparing in Kitchen
UPDATE [Orders] SET [Status] = 'Preparing', [CreatedAt] = DATEADD(MINUTE, -45, GETUTCDATE()) WHERE [Id] = 106;

-- Confirmed / Pending
UPDATE [Orders] SET [Status] = 'Confirmed', [CreatedAt] = DATEADD(HOUR, -2, GETUTCDATE()) WHERE [Id] = 2;
UPDATE [Orders] SET [Status] = 'Pending', [CreatedAt] = DATEADD(MINUTE, -10, GETUTCDATE()) WHERE [Id] = 5;

-- Delivered Orders
UPDATE [Orders] SET [Status] = 'Delivered', [CreatedAt] = DATEADD(HOUR, -4, GETUTCDATE()) WHERE [Id] = 100;
UPDATE [Orders] SET [Status] = 'Delivered', [CreatedAt] = DATEADD(HOUR, -5, GETUTCDATE()) WHERE [Id] = 101;
UPDATE [Orders] SET [Status] = 'Delivered', [CreatedAt] = DATEADD(HOUR, -6, GETUTCDATE()) WHERE [Id] = 102;
UPDATE [Orders] SET [Status] = 'Delivered', [CreatedAt] = DATEADD(DAY, -1, GETUTCDATE()) WHERE [Id] = 3;

-- 4. Seed OrderDeliveries for Rider Dashboard and Tracking
-- Clean previous test deliveries for these specific demo orders if needed
DELETE FROM [OrderDeliveries] WHERE [OrderId] IN (100, 101, 102, 103, 104, 105);

-- Delivery 1: Out for Delivery (Active in transit by Alex Rider)
INSERT INTO [OrderDeliveries] ([OrderId], [DeliveryPartnerId], [DeliveryStatus], [AssignedAt], [PickedUpAt], [DeliveredAt])
VALUES (103, @RiderId, 'Out for Delivery', DATEADD(MINUTE, -40, GETUTCDATE()), DATEADD(MINUTE, -15, GETUTCDATE()), NULL);

-- Delivery 2: Assigned (Pending Pickup by Alex Rider)
INSERT INTO [OrderDeliveries] ([OrderId], [DeliveryPartnerId], [DeliveryStatus], [AssignedAt], [PickedUpAt], [DeliveredAt])
VALUES (105, @RiderId, 'Assigned', DATEADD(MINUTE, -10, GETUTCDATE()), NULL, NULL);

-- Delivery 3: Delivered Today (Completed by Alex Rider)
INSERT INTO [OrderDeliveries] ([OrderId], [DeliveryPartnerId], [DeliveryStatus], [AssignedAt], [PickedUpAt], [DeliveredAt])
VALUES (100, @RiderId, 'Delivered', DATEADD(HOUR, -4, GETUTCDATE()), DATEADD(HOUR, -3, GETUTCDATE()), DATEADD(HOUR, -3, GETUTCDATE()));

-- Delivery 4: Delivered Today (Completed by Alex Rider)
INSERT INTO [OrderDeliveries] ([OrderId], [DeliveryPartnerId], [DeliveryStatus], [AssignedAt], [PickedUpAt], [DeliveredAt])
VALUES (101, @RiderId, 'Delivered', DATEADD(HOUR, -5, GETUTCDATE()), DATEADD(HOUR, -4, GETUTCDATE()), DATEADD(HOUR, -4, GETUTCDATE()));

-- Delivery 5: Delivered Today (Completed by Alex Rider)
INSERT INTO [OrderDeliveries] ([OrderId], [DeliveryPartnerId], [DeliveryStatus], [AssignedAt], [PickedUpAt], [DeliveredAt])
VALUES (102, @RiderId, 'Delivered', DATEADD(HOUR, -6, GETUTCDATE()), DATEADD(HOUR, -5, GETUTCDATE()), DATEADD(HOUR, -5, GETUTCDATE()));
