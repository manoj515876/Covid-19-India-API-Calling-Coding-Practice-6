const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();

const filePath = path.join(__dirname, "covid19India.db");

app.use(express.json());

let db = null;

const instilze = async () => {
  try {
    db = await open({
      filename: filePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:/3000/");
    });
  } catch (e) {
    console.log(`Database Error ${e.message}`);
    process.exit(1);
  }
};

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    stateName: dbObject.state_name,
    districtId: dbObject.district_id,
    population: dbObject.population,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

instilze();

// Get States

app.get("/states/", async (req, res) => {
  const getStatusQuery = `SELECT * FROM state ORDER BY state_id`;
  const stateArray = await db.all(getStatusQuery);
  res.send(
    stateArray.map((eachState) => convertDbObjectToResponseObject(eachState))
  );
});

// Get state

app.get("/states/:stateId/", async (req, res) => {
  const { stateId } = req.params;
  const getStateQuery = `
    SELECT 
      * 
    FROM 
      state
    WHERE 
      state_id = ${stateId};`;
  const state = await db.get(getStateQuery);
  res.send(convertDbObjectToResponseObject(state));
});

// Post districts

app.post("/districts/", async (req, res) => {
  const { districtName, stateId, cases, cured, active, deaths } = req.body;
  const postDistrictsQuery = `
  INSERT INTO
    district (district_name, 
state_id, 
cases, 
cured, 
active,
deaths)
  VALUES
    ('${districtName}', ${stateId}, ${cases}, ${cured}, ${active}, ${deaths});`;
  const player = await db.run(postDistrictsQuery);
  res.send("District Successfully Added");
});

// Get District

app.get("/districts/:districtId/", async (req, res) => {
  const { districtId } = req.params;
  const getDistrictQuery = `
    SELECT 
      * 
    FROM 
      district
    WHERE 
      district_id = ${districtId};`;
  const player = await db.get(getDistrictQuery);
  res.send(player);
});

// Delete

app.delete("/districts/:districtId/", async (req, res) => {
  const { districtId } = req.params;
  const deleteDistrictQuery = `
  DELETE FROM
    district
  WHERE
    district_id = ${districtId};`;
  await db.run(deleteDistrictQuery);
  res.send("District Removed");
});

// PUT

app.put("/districts/:districtId/", async (req, res) => {
  const { districtName, stateId, cases, cured, active, deaths } = req.body;
  const { districtId } = req.params;
  const updatedistrictQuery = `
  UPDATE
    district
  SET
    district_name= '${districtName}',
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active},
    deaths = ${deaths}

  WHERE
    district_id = ${districtId};`;

  await db.run(updatedistrictQuery);
  res.send("District Details Updated");
});

// Get Total Cases API

app.get("/states/:stateId/stats/", async (req, res) => {
  const { stateId } = req.params;
  const getCasesQuery = `SELECT COUNT(district.cases) AS totalCases, COUNT(district.cured) AS totalCured, COUNT(district.active) AS totalActive, COUNT(district.deaths) AS totalDeaths FROM state NATURAL JOIN district WHERE district.state_id = ${stateId};`;
  const casesCount = await db.get(getCasesQuery);
  res.send(casesCount);
});

// Get State Name API

app.get("/districts/:districtId/details/", async (req, res) => {
  const { districtId } = req.params;
  const getStateQuery = `SELECT state.state_name AS stateName FROM state NATURAL JOIN district WHERE district.district_id = ${districtId};`;
  const district = await db.get(getStateQuery);
  res.send(district);
});

module.exports = app;
