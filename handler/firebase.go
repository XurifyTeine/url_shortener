package firebase

import (
	"context"
	crand "crypto/rand"
	"encoding/binary"
	"log"
	"math/rand"
	"net/http"
	"os"
	"regexp"
	"time"

	firestore "cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"google.golang.org/api/option"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func goDotEnvVariable(key string) string {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Error loading .env file")
	}
	return os.Getenv(key)
}

type cryptoSource struct{}

func (source cryptoSource) Seed(seed int64) {}

func (source cryptoSource) Uint64() (value uint64) {
	err := binary.Read(crand.Reader, binary.BigEndian, &value)
	if err != nil {
		log.Fatal(err)
	}
	return value
}

func (source cryptoSource) Int63() int64 {
	return int64(source.Uint64() & ^uint64(1<<63))
}

func RandomInt64(maxInteger int64) int64 {
	var source cryptoSource
	randomNumber := rand.New(source)
	return randomNumber.Int63n(maxInteger)
}

var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12345678910-_~")

const firestoreAccountFile = "serviceAccountKey.json"
const productionSiteUrl = "https://nolongr.vercel.app/"
const firestoreProjectID = "nolongr-xurifyteine"

func randomSequence(length int) string {
	b := make([]rune, length)
	for i := range b {
		b[i] = letters[RandomInt64(int64(len(letters)))]
	}
	return string(b)
}

// type URLData struct {
// 	destination  string `json:"destination"`
// 	id           string `json:"id"`
// 	date_created string `json:"date_created"`
// 	url          string `json:"url"`
// }

func getNewFirestoreClient(ctx context.Context) (*firestore.Client, error) {
	return firestore.NewClient(ctx, firestoreProjectID, option.WithServiceAccountFile(firestoreAccountFile))
}

func addURLToFirestore(url string) (map[string]interface{}, error) {
	ctx := context.Background()
	client, err := getNewFirestoreClient(ctx)
	if err != nil {
		log.Print(err)
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

func retrieveDestinationUrl(url string) (interface{}, error) {
	ctx := context.Background()
	client, err := getNewFirestoreClient(ctx)
	documentSnapshot, err := client.Collection("urls").Doc(url).Get(ctx)
	if err != nil && status.Code(err) != codes.NotFound {
		log.Println("Retrieving Original URL Error:", err)
	}
	urlData := documentSnapshot.Data()
	return urlData, err
}

type ErrorResponse struct {
	Message   string `json:"message"`
	Error     string `json:"error"`
	ErrorCode int    `json:"errorCode"`
	Id        string `json:"id"`
}

func handleRouteFindURLByID(context *gin.Context) {
	id := context.Param("id")
	urlData, err := retrieveDestinationUrl(id)
	if err != nil {
		errorMessage := ErrorResponse{
			Message:   "This URL is invalid or a destination URL could not be found",
			Error:     err.Error(),
			ErrorCode: http.StatusNotFound,
			Id:        id,
		}
		context.JSON(http.StatusNotFound, map[string]ErrorResponse{"error": errorMessage})
	} else {
		context.JSON(http.StatusOK, map[string]interface{}{"result": urlData})
	}
}

func handleRouteGetNewShortId(context *gin.Context) {
	id := context.Query("id")

	newID := id
	doesUrlIdExist := checkIfUrlIdExists(newID)

	for doesUrlIdExist {
		newID = randomSequence(6)
		doesUrlIdExist = newID == id
	}

	urlData := map[string]interface{}{
		"id":     id,
		"new_id": newID,
		"exists": checkIfUrlIdExists(id),
	}
	context.JSON(http.StatusOK, urlData)
}

type Foo struct {
	Number int    `json:"number"`
	Title  string `json:"title"`
}

func handleRouteCreateShortUrl(context *gin.Context) {
	destination := context.Query("url")

	match, _ := regexp.MatchString("^(http:\\/\\/www\\.|https:\\/\\/www\\.|http:\\/\\/|https:\\/\\/|\\/|\\/\\/)?[A-z0-9_-]*?[:]?[A-z0-9_-]*?[@]?[A-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,5}(:[0-9]{1,5})?(\\/.*)?$", destination)

	if !match {
		errorMessage := ErrorResponse{
			Message:   "A URL was not provided or the input was incorrect",
			ErrorCode: http.StatusForbidden,
		}
		context.JSON(http.StatusForbidden, map[string]ErrorResponse{"error": errorMessage})
		return
	}

	urlData, err := addURLToFirestore(destination)
	if err != nil {
		errorMessage := ErrorResponse{
			Message:   "Failed to create short URL",
			Error:     err.Error(),
			ErrorCode: http.StatusNotFound,
		}
		context.JSON(http.StatusNotFound, map[string]ErrorResponse{"error": errorMessage})
		log.Println(err)
	} else {
		context.JSON(http.StatusOK, map[string]interface{}{"result": urlData})
	}
}

func HandleRouteHealthz(context *gin.Context) {
	context.JSON(http.StatusOK, "Success")
}

func getEnvironment() string {
	return os.Getenv("APP_ENV")
}

// func Handler(w http.ResponseWriter, r *http.Request) {
// 	fmt.Fprintf(w, "<h1>Hello from Go!</h1>")
// }

// func Handlerr(w http.ResponseWriter, r *http.Request) {
// 	port := os.Getenv("PORT")
// 	if port == "" {
// 		port = "8080"
// 	}

// 	gin.SetMode(gin.ReleaseMode)
// 	router := gin.Default()

// 	allowOrigins := []string{productionSiteUrl}
// 	if getEnvironment() == "development" {
// 		allowOrigins = []string{"http://localhost:3000", productionSiteUrl}
// 	}

// 	router.Use(cors.New(cors.Config{
// 		AllowOrigins:     allowOrigins,
// 		AllowMethods:     []string{"GET", "POST"},
// 		AllowHeaders:     []string{"Origin"},
// 		ExposeHeaders:    []string{"Content-Length"},
// 		AllowCredentials: true,
// 		AllowOriginFunc: func(origin string) bool {
// 			if getEnvironment() == "development" {
// 				containsOrigin := slices.Contains(allowOrigins, "http://localhost:3000")
// 				return containsOrigin
// 			} else {
// 				containsOrigin := slices.Contains(allowOrigins, productionSiteUrl)
// 				return containsOrigin
// 			}
// 		},
// 		MaxAge: 12 * time.Hour,
// 	}))

// 	router.GET("/api/healthz", handleRouteHealthz)
// 	router.GET("/api/urls/:id", handleRouteFindURLByID)
// 	router.GET("/api/new-short-id", handleRouteGetNewShortId)
// 	router.POST("/api/create-short-url", handleRouteCreateShortUrl)
// 	log.Printf("Listening on %s", ":"+port)
// 	if err := router.Run(":" + port); err != nil {
// 		log.Panicf("Router error: %s", err)
// 	}
// }
