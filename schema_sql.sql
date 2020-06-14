/* Adding Index as PK for Tables */
ALTER TABLE covid ADD PRIMARY KEY (index);
ALTER TABLE crime ADD PRIMARY KEY (index);
ALTER TABLE summary ADD PRIMARY KEY (index);

/* Checking each table to be sure every thing looks good */
SELECT * FROM covid;
SELECT * FROM crime;
SELECT * FROM summary;
