const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const port = 3000;

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'world',
    database: 'world'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL connected...');
});

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set Pug as the template engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Root route to handle the form submission and queries
app.get('/', (req, res) => {
    const { n, reportType, continent, region, cityN, cityReportType, cityContinent, cityRegion, cityCountry, cityDistrict } = req.query;
    let query = '';
    let params = [];

    // Handle country queries
    if (reportType) {
        query = `SELECT Code, Name, Continent, Region, Population, Capital FROM country `;
        if (reportType === 'continent' && continent) {
            query += `WHERE Continent = ? `;
            params.push(continent);
        } else if (reportType === 'region' && region) {
            query += `WHERE Region = ? `;
            params.push(region);
        }
        query += `ORDER BY Population DESC `;
        if (n) {
            query += `LIMIT ?`;
            params.push(parseInt(n, 10));
        }
        db.query(query, params, (err, results) => {
            if (err) {
                return res.render('index', { error: 'An error occurred while fetching the data' });
            }
            res.render('index', { results });
        });
    }

    // Handle city queries
    else if (cityReportType) {
        query = `SELECT city.Name, country.Name AS Country, city.District, city.Population, country.Continent, country.Region 
                 FROM city 
                 JOIN country ON city.CountryCode = country.Code `;
        if (cityReportType === 'continent' && cityContinent) {
            query += `WHERE country.Continent = ? `;
            params.push(cityContinent);
        } else if (cityReportType === 'region' && cityRegion) {
            query += `WHERE country.Region = ? `;
            params.push(cityRegion);
        } else if (cityReportType === 'country' && cityCountry) {
            query += `WHERE country.Name = ? `;
            params.push(cityCountry);
        } else if (cityReportType === 'district' && cityDistrict) {
            query += `WHERE city.District = ? `;
            params.push(cityDistrict);
        }
        query += `ORDER BY city.Population DESC `;
        if (cityN) {
            query += `LIMIT ?`;
            params.push(parseInt(cityN, 10));
        }
        db.query(query, params, (err, results) => {
            if (err) {
                return res.render('index', { error: 'An error occurred while fetching the data' });
            }
            res.render('index', { results });
        });
    } else {
        res.render('index');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
