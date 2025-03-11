-- สร้างตาราง TRUCK
CREATE TABLE TRUCK (
    TruckCode INT IDENTITY(1,1) PRIMARY KEY,
    TruckReg VARCHAR(20) NOT NULL
);

-- สร้างตาราง SHIP_LOCATION
CREATE TABLE SHIP_LOCATION (
    ShipLoCode INT IDENTITY(1,1) PRIMARY KEY,
    ShipLoLat DECIMAL(15,10),
    ShipLoLong DECIMAL(15,10),
    ShipLoAddr VARCHAR(255),
    ShipLoAddr2 VARCHAR(255)
);

-- สร้างตาราง TRIP
CREATE TABLE TRIP (
    TripCode INT IDENTITY(1,1) PRIMARY KEY,
    TripTruckCode INT,  -- เชื่อมกับตาราง TRUCK
    TripMileageIn DECIMAL(10,2),
    TripMileageOut DECIMAL(10,2),
    TripTimeIn DATETIME,
    TripTimeOut DATETIME,
    FOREIGN KEY (TripTruckCode) REFERENCES TRUCK(TruckCode)
);

-- สร้างตาราง SHIPMENT_LIST
CREATE TABLE SHIPMENT_LIST (
    ShipListSeq INT,
    ShipListTripCode INT,  -- เชื่อมกับตาราง TRIP
    ShipListShipLoCode INT,  -- เชื่อมกับตาราง SHIP_LOCATION
    ShipListStatus VARCHAR(20),
    LatUpdateStatus DECIMAL(15,10),
    LongUpdateStatus DECIMAL(15,10),
    LastUpdateStatus DATETIME,
    PRIMARY KEY (ShipListTripCode, ShipListSeq),
    FOREIGN KEY (ShipListTripCode) REFERENCES TRIP(TripCode),
    FOREIGN KEY (ShipListShipLoCode) REFERENCES SHIP_LOCATION(ShipLoCode)
);

-- สร้างตาราง Log สำหรับเก็บข้อมูล Event
CREATE TABLE SHIPLIST_LOCATION_LOG (
    LogID INT IDENTITY(1,1) PRIMARY KEY,
    ShipListTripCode INT,  -- เชื่อมกับตาราง TRIP
    ShipListShipLoCode INT,  -- เชื่อมกับตาราง SHIP_LOCATION
    OldStatus VARCHAR(20),
    NewStatus VARCHAR(20),
    LatUpdateStatus DECIMAL(15,10),
    LongUpdateStatus DECIMAL(15,10),
    LastUpdateStatus DATETIME,
    EventTime DATETIME DEFAULT GETDATE()
);

-- สร้าง Trigger สำหรับการบันทึก Event การเปลี่ยนแปลงสถานะ
CREATE TRIGGER trg_shipment_list_status_update
ON SHIPMENT_LIST
AFTER UPDATE
AS
BEGIN
    -- ตรวจสอบว่าค่า ShipListStatus เปลี่ยนแปลงไปจากเดิมหรือไม่ รวมถึงกรณีที่ค่าเดิมเป็น NULL
    IF EXISTS(SELECT * FROM inserted i JOIN deleted d ON i.ShipListTripCode = d.ShipListTripCode AND i.ShipListSeq = d.ShipListSeq WHERE i.ShipListStatus <> d.ShipListStatus)
    BEGIN
        INSERT INTO SHIPLIST_LOCATION_LOG (
            ShipListTripCode,
            ShipListShipLoCode,
            OldStatus,
            NewStatus,
            LatUpdateStatus,
            LongUpdateStatus,
            LastUpdateStatus,
            EventTime
        )
        SELECT
            i.ShipListTripCode,
            i.ShipListShipLoCode,
            ISNULL(d.ShipListStatus, 'NULL'), -- กรณีค่าเดิมเป็น NULL ให้บันทึกเป็น 'NULL'
            i.ShipListStatus,
            i.LatUpdateStatus,
            i.LongUpdateStatus,
            i.LastUpdateStatus,
            GETDATE()
        FROM inserted i
        JOIN deleted d ON i.ShipListTripCode = d.ShipListTripCode AND i.ShipListSeq = d.ShipListSeq
        WHERE i.ShipListStatus <> d.ShipListStatus;
    END
END;
