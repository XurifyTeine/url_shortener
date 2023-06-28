package utils

import (
	"log"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"golang.org/x/exp/slices"
)

type ErrorResponse struct {
	Message   string `json:"message"`
	Error     string `json:"error"`
	ErrorCode int    `json:"errorCode"`
	Id        string `json:"id"`
}

func RegisterRouter(router *gin.RouterGroup) {
	router.GET("/api/urls/:id", handleRouteFindURLById)
	router.POST("/api/urls", handleRouteCreateShortUrl)
	router.DELETE("/api/delete-url", handleRouteDeleteId)
	router.DELETE("/api/delete-expired-ids", handleRouteDeleteExpiredIds)
	//ADMIN
	router.GET("/api/urls", handleRouteGetAllUrls)
	router.GET("/api/expired-urls", handleRouteGetAllExpiredUrls)
	router.GET("/api/new-short-id", handleRouteGetNewShortId)
}

func RegisterCors(router *gin.Engine) {
	allowOrigins := []string{PRODUCTION_SITE_URL}
	if GetEnvironment() == "development" {
		allowOrigins = []string{"http://localhost:3000", PRODUCTION_SITE_URL}
	}

	router.Use(cors.New(cors.Config{
		AllowOrigins:     allowOrigins,
		AllowMethods:     []string{"GET", "POST"},
		AllowHeaders:     []string{"Origin"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		AllowOriginFunc: func(origin string) bool {
			if GetEnvironment() == "development" {
				containsOrigin := slices.Contains(allowOrigins, "http://localhost:3000")
				return containsOrigin
			} else {
				containsOrigin := slices.Contains(allowOrigins, PRODUCTION_SITE_URL)
				return containsOrigin
			}
		},
		MaxAge: 12 * time.Hour,
	}))

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

func handleRouteFindURLById(context *gin.Context) {
	id := context.Param("id")
	urlData, err := GetSingleUrl(id)
	if err != nil {
		errorMessage := ErrorResponse{
			Message:   "This URL is invalid or a destination URL could not be found",
			Error:     err.Error(),
			ErrorCode: http.StatusNotFound,
			Id:        id,
		}
		context.JSON(http.StatusNotFound, map[string]ErrorResponse{"error": errorMessage})
	} else {
		context.JSON(http.StatusOK, map[string]URLData{"result": urlData})
	}
}

func handleRouteCreateShortUrl(context *gin.Context) {
	destination := context.Query("destination")
	selfDestructString := context.Query("self_destruct")
	selfDestruct, _ := strconv.ParseInt(selfDestructString, 10, 64)

	destinationSiteUrled, _ := url.Parse(destination)
	productionSiteUrled, err := url.Parse(PRODUCTION_SITE_URL)
	errorMessageIncorrectUrl := ErrorResponse{
		Message:   "A URL was not provided or the input was incorrect",
		ErrorCode: http.StatusForbidden,
	}
	if err != nil {
		log.Print(err)
	} else if productionSiteUrled.Hostname() == destinationSiteUrled.Hostname() {
		context.JSON(http.StatusForbidden, map[string]ErrorResponse{"error": errorMessageIncorrectUrl})
		return
	}

	match, _ := regexp.MatchString("^(http:\\/\\/www\\.|https:\\/\\/www\\.|http:\\/\\/|https:\\/\\/|\\/|\\/\\/)?[A-z0-9_-]*?[:]?[A-z0-9_-]*?[@]?[A-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,5}(:[0-9]{1,5})?(\\/.*)?$", destination)

	if !match {
		context.JSON(http.StatusForbidden, map[string]ErrorResponse{"error": errorMessageIncorrectUrl})
		return
	}

	//urlData, err := addURLToFirestore(destination, self_destruct)

	urlData, err := CreateUrl(destination, selfDestruct)

	if err != nil {
		errorMessage := ErrorResponse{
			Message:   "Failed to create short URL",
			Error:     err.Error(),
			ErrorCode: http.StatusNotFound,
		}
		context.JSON(http.StatusNotFound, map[string]ErrorResponse{"error": errorMessage})
		log.Println(err)
	} else {
		context.JSON(http.StatusOK, map[string]URLData{"result": urlData})
	}
}

func handleRouteGetAllUrls(context *gin.Context) {
	urls, err := GetUrls()
	if err != nil {
		log.Println("(handleRouteGetAllUrls) error:", err)
	}
	context.JSON(http.StatusOK, map[string][]URLData{"result": urls})
}

func handleRouteGetAllExpiredUrls(context *gin.Context) {
	urls, err := GetAllExpiredUrls()
	if err != nil {
		log.Println("(handleRouteGetAllExpiredUrls) error:", err)
	}
	context.JSON(http.StatusOK, map[string][]URLData{"result": urls})
}

func handleRouteDeleteExpiredIds(context *gin.Context) {
	ids, err := DeleteAllExpiredDocuments()
	if err != nil {
		log.Println("(handleRouteDeleteExpiredIds) error:", err)
	}
	context.JSON(http.StatusOK, map[string][]string{"result": ids})
}

func handleRouteDeleteId(context *gin.Context) {
	id := context.Query("id")
	result, err := DeleteFromDatabase(id)
	if err != nil {
		errorMessage := ErrorResponse{
			Message:   "Failed to delete from database",
			Error:     err.Error(),
			ErrorCode: http.StatusNotFound,
		}
		context.JSON(http.StatusNotFound, map[string]ErrorResponse{"error": errorMessage})
		log.Println("(handleRouteDeleteId) error: ", err)
	}
	context.JSON(http.StatusOK, map[string]interface{}{"result": result})
}
