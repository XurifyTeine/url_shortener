package api

import (
	"fmt"
	"net/http"
)

func Healthz(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Success")
}
