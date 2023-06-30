package utils

import (
	"log"
	"time"

	"database/sql"

	_ "github.com/go-sql-driver/mysql"
)

func getNewPlanetScaleClient() (*sql.DB, error) {
	// Open a connection to the database
	db, err := sql.Open("mysql", GoDotEnvVariable("DSN"))
	if err != nil {
		log.Print("(getNewPlanetScaleClient) failed to open db connection", err)
	}

	return db, err
}

type URLData struct {
	Destination  string `json:"destination"`
	ID           string `json:"id"`
	DateCreated  string `json:"date_created"`
	URL          string `json:"url"`
	SelfDestruct string `json:"self_destruct"`
	SessionToken string `json:"session_token"`
}

func CreateUrl(url string, selfDestruct int64, sessionToken string) (URLData, error) {
	newURLID := randomSequence(6)

	doesUrlIdExist := checkIfUrlIdExists(newURLID)

	for doesUrlIdExist {
		newURLID = randomSequence(6)
	}

	newUrlData := URLData{
		Destination:  url,
		ID:           newURLID,
		DateCreated:  time.Now().UTC().Format(time.RFC3339),
		URL:          PRODUCTION_SITE_URL + newURLID,
		SessionToken: sessionToken,
	}

	if selfDestruct != 0 {
		selfDestructDuration := time.Second * time.Duration(selfDestruct)
		newUrlData.SelfDestruct = time.Now().UTC().Add(selfDestructDuration).Format(time.RFC3339)
	} else {
		newUrlData.SelfDestruct = ""
	}

	query := "INSERT INTO urls (id, destination, date_created, url, self_destruct, session_token) VALUES (?, ?, ?, ?, ?, ?)"
	db, err := getNewPlanetScaleClient()
	_, err = db.Exec(query, newUrlData.ID, newUrlData.Destination, newUrlData.DateCreated, newUrlData.URL, newUrlData.SelfDestruct, newUrlData.SessionToken)

	if err != nil {
		log.Print("(CreateUrl) db.Exec", err)
	}

	return newUrlData, err
}

func GetUrls() ([]URLData, error) {
	db, err := getNewPlanetScaleClient()
	query := "SELECT * FROM urls"
	res, err := db.Query(query)
	defer res.Close()
	if err != nil {
		log.Print("(GetUrls) db.Query", err)
	}

	urls := []URLData{}
	for res.Next() {
		var urlData URLData
		err := res.Scan(&urlData.ID, &urlData.Destination, &urlData.DateCreated, &urlData.URL, &urlData.SelfDestruct, &urlData.SessionToken)
		if err != nil {
			log.Print("(GetUrls) res.Scan", err)
		}
		urls = append(urls, urlData)
	}

	return urls, err
}

func GetSingleUrl(id string) (URLData, error) {
	urlData := URLData{}
	query := `SELECT * FROM urls WHERE id = ?`
	db, err := getNewPlanetScaleClient()
	err = db.QueryRow(query, id).Scan(&urlData.ID, &urlData.Destination, &urlData.DateCreated, &urlData.URL, &urlData.SelfDestruct, &urlData.SessionToken)
	if err != nil {
		log.Println("(GetSingleUrl) db.Exec", err)
	}

	return urlData, err
}

func GetSingleUrlUnexpired(id string) (URLData, error) {
	urlData := URLData{}
	query := `SELECT * FROM urls WHERE id = ? AND self_destruct = '' OR self_destruct > ?`
	db, err := getNewPlanetScaleClient()
	timeNow := time.Now().UTC().Format(time.RFC3339)
	err = db.QueryRow(query, id, timeNow).Scan(&urlData.ID, &urlData.Destination, &urlData.DateCreated, &urlData.URL, &urlData.SelfDestruct, &urlData.SessionToken)
	if err != nil {
		log.Println("(GetSingleUrl) db.Exec", err)
	}

	return urlData, err
}

func GetAllUrlsBasedOnSessionToken(sessionToken string) ([]URLData, error) {
	db, err := getNewPlanetScaleClient()
	query := "SELECT * FROM urls WHERE session_token = ? AND self_destruct = '' OR self_destruct > ?"
	timeNow := time.Now().UTC().Format(time.RFC3339)
	res, err := db.Query(query, sessionToken, timeNow)
	defer res.Close()
	if err != nil {
		log.Print("(GetAllUrlsBasedOnSessionToken) db.Query", err)
	}

	urls := []URLData{}
	for res.Next() {
		var urlData URLData
		err := res.Scan(&urlData.ID, &urlData.Destination, &urlData.DateCreated, &urlData.URL, &urlData.SelfDestruct, &urlData.SessionToken)
		if err != nil {
			log.Print("(GetAllUrlsBasedOnSessionToken) res.Scan", err)
		}
		urls = append(urls, urlData)
	}

	return urls, err
}

func GetAllExpiredUrls() ([]URLData, error) {
	db, err := getNewPlanetScaleClient()
	query := "SELECT * FROM urls WHERE self_destruct <> '' AND self_destruct < ?"
	timeNow := time.Now().UTC().Format(time.RFC3339)
	res, err := db.Query(query, timeNow)
	defer res.Close()
	if err != nil {
		log.Print("(GetAllExpiredUrls) db.Query", err)
	}

	urls := []URLData{}
	for res.Next() {
		var urlData URLData
		err := res.Scan(&urlData.ID, &urlData.Destination, &urlData.DateCreated, &urlData.URL, &urlData.SelfDestruct, &urlData.SessionToken)
		if err != nil {
			log.Print("(GetAllExpiredUrls) res.Scan", err)
		}
		urls = append(urls, urlData)
	}

	return urls, err
}

func DeleteFromDatabase(id string, sessionToken string) (bool, error) {
	query := `DELETE FROM urls WHERE id = ? AND session_token = ?`
	db, err := getNewPlanetScaleClient()
	err = db.QueryRow(query, id, sessionToken).Err()
	if err != nil {
		log.Println("(DeleteFromDatabase) db.Exec error:", id, err)
		return false, err
	}

	return true, err
}

func DeleteAllExpiredDocuments() ([]string, error) {
	db, err := getNewPlanetScaleClient()
	query := "DELETE FROM urls WHERE self_destruct < ?"
	timeNow := time.Now().UTC().Format(time.RFC3339)
	res, err := db.Query(query, timeNow)
	defer res.Close()
	if err != nil {
		log.Print("(DeleteAllExpiredDocuments) db.Query", err)
	}

	urls := []string{}
	for res.Next() {
		var urlData URLData
		err := res.Scan(&urlData.ID, &urlData.Destination, &urlData.DateCreated, &urlData.URL, &urlData.SelfDestruct, &urlData.SessionToken)
		if err != nil {
			log.Print("(DeleteAllExpiredDocuments) res.Scan", err)
		}
		urls = append(urls, urlData.ID)
	}

	return urls, err
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
// 	session_token VARCHAR(50)
// 	PRIMARY KEY ( id )
//  );
