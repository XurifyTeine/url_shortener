package api

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	firebasehelp "main.go/firebase"
	handler "main.go/handler"
)

var (
	app *gin.Engine
)

func registerRouter(router *gin.RouterGroup) {
	router.GET("/api/ping", handler.Ping)
	router.GET("/api/healthz", firebasehelp.HandleRouteHealthz)
	router.GET("/api/urls/:id", firebasehelp.HandleRouteFindURLById)
	router.GET("/api/new-short-id", firebasehelp.HandleRouteGetNewShortId)
	router.POST("/api/create-short-url", firebasehelp.HandleRouteCreateShortUrl)
}

// init gin app
func init() {
	app = gin.New()

	// Handling routing errors
	app.NoRoute(func(c *gin.Context) {
		sb := &strings.Builder{}
		sb.WriteString("routing err: no route, try this:\n")
		for _, v := range app.Routes() {
			sb.WriteString(fmt.Sprintf("%s %s\n", v.Method, v.Path))
		}
		c.String(http.StatusBadRequest, sb.String())
	})

	r := app.Group("/")

	// register route
	registerRouter(r)
}

// entrypoint
func Handler(w http.ResponseWriter, r *http.Request) {
	app.ServeHTTP(w, r)
}
