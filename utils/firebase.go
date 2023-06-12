package utils

import (
	"context"
	"log"
	"time"

	firestore "cloud.google.com/go/firestore"
	"google.golang.org/api/option"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func getNewFirestoreClient(ctx context.Context) (*firestore.Client, error) {
	jsonCredentials := []byte(`
	{
		"type": "service_account",
		"project_id": "your-project-id",
		"private_key_id": "your-private-key-id",
		"private_key": "your-private-key",
		"client_email": "your-client-email",
		"client_id": "your-client-id",
		"auth_uri": "https://accounts.google.com/o/oauth2/auth",
		"token_uri": "https://oauth2.googleapis.com/token",
		"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
		"client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-client-email"
	}
	`)
	opts := option.WithCredentialsJSON(jsonCredentials)
	return firestore.NewClient(ctx, firebaseProjectId, opts)
}

func addURLToFirestore(url string) (map[string]interface{}, error) {
	ctx := context.Background()
	client, err := getNewFirestoreClient(ctx)
	if err != nil {
		log.Println(err)
	}

	newURLID := randomSequence(6)

	doesUrlIdExist := checkIfUrlIdExists(newURLID)

	for doesUrlIdExist {
		newURLID = randomSequence(6)
	}

	newUrlData := map[string]interface{}{
		"destination":  url,
		"id":           newURLID,
		"date_created": time.Now().Format(time.RFC3339),
		"url":          productionSiteUrl + newURLID,
	}

	_, err = client.Collection("urls").Doc(newURLID).Set(ctx, newUrlData)
	if err != nil {
		log.Printf("Error adding new document: %s", err)
	} else {
		log.Printf("Adding new document: %s", newURLID)
	}

	return newUrlData, err
}

func checkIfUrlIdExists(urlId string) bool {
	_, err := retrieveDestinationUrl(urlId)
	if err != nil {
		if status.Code(err) == codes.NotFound {
			return false
		} else {
			log.Println("Checking If URL ID Exists Error:", err)
			return true
		}
	} else {
		return true
	}
}

func retrieveDestinationUrl(id string) (interface{}, error) {
	ctx := context.Background()
	client, err := getNewFirestoreClient(ctx)
	documentSnapshot, err := client.Collection("urls").Doc(id).Get(ctx)
	if err != nil && status.Code(err) != codes.NotFound {
		log.Println("Retrieving Original URL Error:", err)
	}
	urlData := documentSnapshot.Data()
	return urlData, err
}
