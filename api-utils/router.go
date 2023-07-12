package utils

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/segmentio/ksuid"
	"golang.org/x/exp/slices"
)

type ErrorResponse struct {
	Message   string `json:"message"`
	Error     string `json:"error"`
	ErrorCode int    `json:"errorCode"`
	Id        string `json:"id"`
}

func setCookieHandler(context *gin.Context) {
	session := sessions.Default(context)
	key := "session_token"
	sessionToken := session.Get(key)
	if sessionToken == nil {
		sessionToken = ksuid.New().String()
	}
	session.Set(key, sessionToken)
	session.Save()
	result := map[string]interface{}{"key": key, "value": sessionToken}
	context.JSON(http.StatusOK, map[string]interface{}{"result": result})
}

func getCookieHandler(context *gin.Context) {
	cookie, err := context.Cookie("session_token")
	if err != nil {
		switch {
		case errors.Is(err, http.ErrNoCookie):
			context.JSON(http.StatusBadRequest, "Cookie not found")
		default:
			context.JSON(http.StatusInternalServerError, "Server error")
		}
		return
	}
	context.JSON(http.StatusOK, cookie)
}

func RegisterRouter(router *gin.RouterGroup) {
	store := cookie.NewStore([]byte("secret"))
	store.Options(sessions.Options{MaxAge: 60 * 60 * 1440, Path: "/", HttpOnly: true, Secure: true, SameSite: http.SameSiteLaxMode}) // expire in 2 months
	router.Use(sessions.Sessions("session_token", store))

	//USER
	router.GET("/api/urls/:id", handleRouteFindURLById)
	router.GET("/api/user-session-urls", handleRouteGetAllUrlsBasedOnSessionToken)
	router.POST("/api/urls", handleRouteCreateShortUrl)
	router.DELETE("/api/delete-url", handleRouteDeleteId)
	//OTHERS
	router.GET("/api/set-cookie", setCookieHandler)
	router.GET("/api/get-cookie", getCookieHandler)
	//ADMIN
	router.GET("/api/urls", handleRouteGetAllUrls)
	router.GET("/api/expired-urls", handleRouteGetAllExpiredUrls)
	router.GET("/api/new-short-id", handleRouteGetNewShortId)
	//CRON
	router.DELETE("/api/delete-expired-ids", handleRouteDeleteExpiredIds)
}

func RegisterCors(router *gin.Engine) {
	allowOrigins := []string{PRODUCTION_SITE_URL}
	if GetEnvironment() == "development" {
		allowOrigins = []string{DEV_SITE_URL, PRODUCTION_SITE_URL}
	}

	router.Use(cors.New(cors.Config{
		AllowOrigins:     allowOrigins,
		AllowMethods:     []string{"GET", "POST"},
		AllowHeaders:     []string{"Origin"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		AllowOriginFunc: func(origin string) bool {
			if GetEnvironment() == "development" {
				containsOrigin := slices.Contains(allowOrigins, DEV_SITE_URL)
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

type CreateShortUrlRequestBody struct {
	Destination  string `json:"destination"`
	URL          string `json:"url"`
	SelfDestruct string `json:"self_destruct"`
	Password     string `json:"password"`
}

func handleRouteFindURLById(context *gin.Context) {
	id := context.Param("id")
	urlData, err := GetSingleUrlUnexpired(id)
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

	creds := &CreateShortUrlRequestBody{}
	err := json.NewDecoder(context.Request.Body).Decode(creds)
	if err != nil {
		log.Print("(handleRouteCreateShortUrl) decode error:", err)
	}

	passwordHash := ""

	if creds.Password != "" {
		passwordHashResult, _ := HashPassword(creds.Password)
		passwordHash = passwordHashResult
	}

	destinationSiteUrled, _ := url.Parse(destination)
	productionSiteUrled, err := url.Parse(PRODUCTION_SITE_URL)
	errorMessageIncorrectUrl := ErrorResponse{
		Message:   "A URL was not provided or the input was incorrect",
		ErrorCode: http.StatusForbidden,
	}

	sessionToken, err := context.Cookie("session_token")

	if err != nil {
		log.Print("(handleRouteCreateShortUrl):", err)
	} else if productionSiteUrled.Hostname() == destinationSiteUrled.Hostname() {
		context.JSON(http.StatusForbidden, map[string]ErrorResponse{"error": errorMessageIncorrectUrl})
		return
	}

	match, _ := regexp.MatchString("^(http:\\/\\/www\\.|https:\\/\\/www\\.|http:\\/\\/|https:\\/\\/|\\/|\\/\\/)?[A-z0-9_-]*?[:]?[A-z0-9_-]*?[@]?[A-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,5}(:[0-9]{1,5})?(\\/.*)?$", destination)

	if !match {
		context.JSON(http.StatusForbidden, map[string]ErrorResponse{"error": errorMessageIncorrectUrl})
		return
	}

	urlData, err := CreateUrl(destination, selfDestruct, sessionToken, passwordHash)

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
	apiKey := context.Query("api_key")

	if apiKey != GetApiKey() {
		errorMessageIncorrectToken := ErrorResponse{
			Message:   "Incorrect API key was provided",
			ErrorCode: http.StatusUnauthorized,
		}
		context.JSON(http.StatusUnauthorized, map[string]ErrorResponse{"error": errorMessageIncorrectToken})
		return
	}
	urls, err := GetUrls()
	if err != nil {
		log.Println("(handleRouteGetAllUrls) error:", err)
	}
	context.JSON(http.StatusOK, map[string][]URLData{"result": urls})
}

func handleRouteGetAllUrlsBasedOnSessionToken(context *gin.Context) {
	sessionToken := context.Query("session_token")
	urlData, err := GetAllUrlsBasedOnSessionToken(sessionToken)
	if err != nil {
		errorMessage := ErrorResponse{
			Message:   "Cannot find urls based on session token",
			Error:     err.Error(),
			ErrorCode: http.StatusNotFound,
		}
		context.JSON(http.StatusNotFound, map[string]ErrorResponse{"error": errorMessage})
	} else {
		context.JSON(http.StatusOK, map[string][]URLData{"result": urlData})
	}
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
	sessionToken := context.Query("session_token")
	result, err := DeleteFromDatabase(id, sessionToken)
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
