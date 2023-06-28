package utils

import (
	"log"
	"time"

	"database/sql"

	_ "github.com/go-sql-driver/mysql"
)

func getNewPlanetScaleClient() (*sql.DB, error) {
	// err := godotenv.Load()
	// if err != nil {
	// 	log.Fatal("failed to load env", err)
	// }

	// Open a connection to the database
	db, err := sql.Open("mysql", "dv8dj18swusl5i8qhnh0:pscale_pw_wySxgrT3XxFVvkhw2iwoiYeq3ksbjpWoTrWHtfIfyvz@tcp(aws.connect.psdb.cloud)/nolongr?tls=true")
	if err != nil {
		log.Fatal("failed to open db connection", err)
	}

	return db, err
}

type URLData struct {
	Destination  string `json:"destination"`
	ID           string `json:"id"`
	DateCreated  string `json:"date_created"`
	URL          string `json:"url"`
	SelfDestruct string `json:"self_destruct"`
}

func CreateUrl(url string, self_destruct int64) (URLData, error) {
	newURLID := randomSequence(6)

	doesUrlIdExist := checkIfUrlIdExists(newURLID)

	for doesUrlIdExist {
		newURLID = randomSequence(6)
	}

	newUrlData := URLData{
		Destination: url,
		ID:          newURLID,
		DateCreated: time.Now().UTC().Format(time.RFC3339),
		URL:         PRODUCTION_SITE_URL + newURLID,
	}

	if self_destruct != 0 {
		selfDestructDuration := time.Second * time.Duration(self_destruct)
		newUrlData.SelfDestruct = time.Now().UTC().Add(selfDestructDuration).Format(time.RFC3339)
	} else {
		newUrlData.SelfDestruct = ""
	}

	query := "INSERT INTO urls (id, destination, date_created, url, self_destruct) VALUES (?, ?, ?, ?, ?)"
	db, err := getNewPlanetScaleClient()
	_, err = db.Exec(query, newUrlData.ID, newUrlData.Destination, newUrlData.DateCreated, newUrlData.URL, newUrlData.SelfDestruct)

	if err != nil {
		log.Fatal("(CreateUrl) db.Exec", err)
	}

	return newUrlData, err
}

func GetUrls() ([]URLData, error) {
	db, err := getNewPlanetScaleClient()
	query := "SELECT * FROM urls"
	res, err := db.Query(query)
	defer res.Close()
	if err != nil {
		log.Fatal("(GetUrls) db.Query", err)
	}

	urls := []URLData{}
	for res.Next() {
		var urlData URLData
		err := res.Scan(&urlData.ID, &urlData.Destination, &urlData.DateCreated, &urlData.URL, &urlData.SelfDestruct)
		if err != nil {
			log.Fatal("(GetUrls) res.Scan", err)
		}
		urls = append(urls, urlData)
	}

	return urls, err
}

func GetSingleUrl(id string) (URLData, error) {
	urlData := URLData{}
	query := `SELECT * FROM urls WHERE id = ?`
	db, err := getNewPlanetScaleClient()
	err = db.QueryRow(query, id).Scan(&urlData.ID, &urlData.Destination, &urlData.DateCreated, &urlData.URL, &urlData.SelfDestruct)
	if err != nil {
		log.Println("(GetSingleUrl) db.Exec", err)
	}

	return urlData, err
}

func GetAllExpiredUrls() ([]URLData, error) {
	db, err := getNewPlanetScaleClient()
	query := "SELECT * FROM urls WHERE self_destruct > ?"
	timeNow := time.Now().UTC().Format(time.RFC3339)
	res, err := db.Query(query, timeNow)
	defer res.Close()
	if err != nil {
		log.Fatal("(GetUrls) db.Query", err)
	}

	urls := []URLData{}
	for res.Next() {
		var urlData URLData
		err := res.Scan(&urlData.ID, &urlData.Destination, &urlData.DateCreated, &urlData.URL, &urlData.SelfDestruct)
		if err != nil {
			log.Fatal("(GetAllExpiredUrls) res.Scan", err)
		}
		urls = append(urls, urlData)
	}

	return urls, err
}

func DeleteFromDatabase(id string) (bool, error) {
	query := `DELETE FROM urls WHERE id = ?`
	db, err := getNewPlanetScaleClient()
	err = db.QueryRow(query, id).Err()
	if err != nil {
		log.Println("(DeleteFromDatabase) db.Exec error:", id, err)
		return false, err
	}

	return true, err
}

func checkIfUrlIdExists(urlId string) bool {
	_, err := GetSingleUrl(urlId)
	if err != nil {
		if err == sql.ErrNoRows {
			return false
		} else {
			log.Println("(checkIfUrlIdExists) error:", err)
			return true
		}
	} else {
		return true
	}
}

// CREATE TABLE urls(
// 	id VARCHAR(20) NOT NULL,
// 	destination VARCHAR(2048) NOT NULL,
// 	date_created DATE NOT NULL,
// 	url VARCHAR(2048) NOT NULL,
// 	self_destruct DATE,
// 	PRIMARY KEY ( id )
//  );
