package api

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	utils "main.go/api-utils"
)

var app *gin.Engine

func init() {
	app = gin.Default()

	utils.RegisterCors(app)

	gin.SetMode(gin.ReleaseMode)

	// Handle routing errors
	app.NoRoute(func(c *gin.Context) {
		sb := &strings.Builder{}
		sb.WriteString("routing err: no route, try this:\n")
		for _, v := range app.Routes() {
			if v.Path != "/api/new-short-id" {
				sb.WriteString(fmt.Sprintf("%s %s\n", v.Method, v.Path))
			}
		}
		c.String(http.StatusBadRequest, sb.String())
	})

	r := app.Group("/")

	utils.RegisterRouter(r)
}

func Handler(w http.ResponseWriter, r *http.Request) {
	app.ServeHTTP(w, r)
}
