package utils

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"strconv"
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
	ID           string  `json:"id"`
	DateCreated  string  `json:"date_created"`
	Destination  string  `json:"destination"`
	MaxPageHits  int64   `json:"max_page_hits"`
	PageHits     int64   `json:"page_hits"`
	Password     *string `json:"password"`
	SelfDestruct *string `json:"self_destruct"`
	SessionToken string  `json:"session_token"`
	URL          string  `json:"url"`
}

func CreateUrl(url string, selfDestruct *int64, sessionToken string, password *string, maxPageHits int64) (URLData, error) {
	resp, err := http.Get("https://nolongr.vercel.app/api/url-id-length")
	if err != nil {
		log.Print("(CreateUrl) /api/url-id-length", err)
	}
	defer resp.Body.Close()

	var urlIdLengthResponse map[string]interface{}

	scanner := bufio.NewScanner(resp.Body)
	for i := 0; scanner.Scan() && i < 5; i++ {
		byt := []byte(scanner.Text())
		if err := json.Unmarshal(byt, &urlIdLengthResponse); err != nil {
			panic(err)
		}
	}

	defaultIdLength := 2
	urlIdLength := int(urlIdLengthResponse["result"].(float64))

	if urlIdLength != defaultIdLength {
		urlIdLength = int(math.Max(float64(defaultIdLength), float64(urlIdLength)))
	}

	newURLID := randomSequence(urlIdLength)

	doesUrlIdExist := checkIfUrlIdExists(newURLID)

	doesUrlIdExistCounter := 0
	for doesUrlIdExist {
		newURLID = randomSequence(urlIdLength)
		if doesUrlIdExistCounter > 10 {
			log.Print("(CreateUrl) POTENTIALLY CRITICAL - URL ID LENGTH NEEDS TO BE INCREMENTED")
			newURLID = randomSequence(urlIdLength + 1)
		} else {
			doesUrlIdExistCounter = doesUrlIdExistCounter + 1
		}
	}

	var selfDestructString *string = nil

	if selfDestruct != nil {
		selfDestructDuration := time.Second * time.Duration(*selfDestruct)
		selfDestruct := time.Now().UTC().Add(selfDestructDuration).Format(time.RFC3339)
		selfDestructString = &selfDestruct
	}

	newUrlData := URLData{
		ID:           newURLID,
		DateCreated:  time.Now().UTC().Format(time.RFC3339),
		Destination:  url,
		MaxPageHits:  maxPageHits,
		Password:     password,
		PageHits:     0,
		SessionToken: sessionToken,
		SelfDestruct: selfDestructString,
		URL:          PRODUCTION_SITE_URL + "/" + newURLID,
	}

	query := "INSERT INTO urls (id, date_created, destination, max_page_hits, page_hits, password, self_destruct, session_token, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
	db, err := getNewPlanetScaleClient()
	_, err = db.Exec(query,
		newUrlData.ID,
		newUrlData.DateCreated,
		newUrlData.Destination,
		newUrlData.MaxPageHits,
		newUrlData.PageHits,
		newUrlData.Password,
		newUrlData.SelfDestruct,
		newUrlData.SessionToken,
		newUrlData.URL,
	)

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
		err := res.Scan(
			&urlData.ID,
			&urlData.DateCreated,
			&urlData.Destination,
			&urlData.MaxPageHits,
			&urlData.PageHits,
			&urlData.Password,
			&urlData.SelfDestruct,
			&urlData.SessionToken,
			&urlData.URL,
		)
		if err != nil {
			log.Print("(GetUrls) res.Scan", err)
		}
		urls = append(urls, urlData)
	}

	return urls, err
}

func GetSingleUrl(id string) (URLData, error) {
	urlData := URLData{}
	query := "SELECT * FROM urls WHERE id = ?"
	db, err := getNewPlanetScaleClient()
	err = db.QueryRow(query, id).Scan(
		&urlData.ID,
		&urlData.DateCreated,
		&urlData.Destination,
		&urlData.MaxPageHits,
		&urlData.PageHits,
		&urlData.Password,
		&urlData.SelfDestruct,
		&urlData.SessionToken,
		&urlData.URL,
	)
	if err != nil {
		log.Println("(GetSingleUrl) db.Exec", err)
	}

	return urlData, err
}

func IncrementSingleUrlPageHit(id string) (URLData, error) {
	urlData, err := GetSingleUrl(id)

	previousPageHitCountString := strconv.Itoa(int(urlData.PageHits))
	db, err := getNewPlanetScaleClient()
	query := fmt.Sprintf("UPDATE %s SET %s = %s + 1 WHERE id = ?", "urls", "page_hits", previousPageHitCountString)
	_, err = db.Exec(query, id)

	if err != nil {
		log.Println("IncrementSingleUrlPageHit() --> Failed to increment the page_hits field:", err)
	} else {
		urlData.PageHits = urlData.PageHits + 1
	}

	return urlData, err
}

func GetSingleUrlUnexpired(id string) (URLData, error) {
	urlData := URLData{}
	query := "SELECT * FROM urls WHERE id = ? AND (self_destruct IS NULL OR self_destruct > ?) AND (max_page_hits = 0 OR max_page_hits > page_hits)"
	db, err := getNewPlanetScaleClient()
	timeNow := time.Now().UTC().Format(time.RFC3339)

	err = db.QueryRow(query, id, timeNow).Scan(
		&urlData.ID,
		&urlData.DateCreated,
		&urlData.Destination,
		&urlData.MaxPageHits,
		&urlData.PageHits,
		&urlData.Password,
		&urlData.SelfDestruct,
		&urlData.SessionToken,
		&urlData.URL,
	)
	if err != nil {
		log.Println("(GetSingleUrlUnexpired) db.Exec", err)
	}

	return urlData, err
}

func GetAllUrlsBasedOnSessionToken(sessionToken string) ([]URLData, error) {
	db, err := getNewPlanetScaleClient()
	query := "SELECT * FROM urls WHERE session_token = ?"
	res, err := db.Query(query, sessionToken)
	defer res.Close()
	if err != nil {
		log.Print("(GetAllUrlsBasedOnSessionToken) db.Query", err)
	}

	urls := []URLData{}
	for res.Next() {
		var urlData URLData
		err := res.Scan(
			&urlData.ID,
			&urlData.DateCreated,
			&urlData.Destination,
			&urlData.MaxPageHits,
			&urlData.PageHits,
			&urlData.Password,
			&urlData.SelfDestruct,
			&urlData.SessionToken,
			&urlData.URL,
		)
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
		err := res.Scan(
			&urlData.ID,
			&urlData.DateCreated,
			&urlData.Destination,
			&urlData.MaxPageHits,
			&urlData.PageHits,
			&urlData.Password,
			&urlData.SelfDestruct,
			&urlData.SessionToken,
			&urlData.URL,
		)
		if err != nil {
			log.Print("(GetAllExpiredUrls) res.Scan", err)
		}
		urls = append(urls, urlData)
	}

	return urls, err
}

func DeleteFromDatabase(id string, sessionToken string) (bool, error) {
	query := "DELETE FROM urls WHERE id = ? AND session_token = ?"
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
	query := "DELETE FROM urls WHERE self_destruct < ? OR max_page_hits > page_hits"
	timeNow := time.Now().UTC().Format(time.RFC3339)
	res, err := db.Query(query, timeNow)
	defer res.Close()
	if err != nil {
		log.Print("(DeleteAllExpiredDocuments) db.Query", err)
	}

	urls := []string{}
	for res.Next() {
		var urlData URLData
		err := res.Scan(
			&urlData.ID,
			&urlData.DateCreated,
			&urlData.Destination,
			&urlData.MaxPageHits,
			&urlData.PageHits,
			&urlData.Password,
			&urlData.SelfDestruct,
			&urlData.SessionToken,
			&urlData.URL,
		)
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

// SELECT * FROM urls; --DELETE FROM urls;

// CREATE TABLE IF NOT EXISTS urls (
//     id VARCHAR(36) NOT NULL,
//     date_created VARCHAR(20) NOT NULL,
//     destination VARCHAR(2048) NOT NULL,
//     max_page_hits INT,
//     page_hits INT,
//     password VARCHAR(255),
//     self_destruct VARCHAR(255),
//     session_token VARCHAR(255),
//     url VARCHAR(2048) NOT NULL,
//     PRIMARY KEY (id)
// );
