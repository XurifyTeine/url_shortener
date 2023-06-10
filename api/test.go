package handlerr

import (
	"fmt"
	"net/http"
)

func Handlerr(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "<h1>Hellos from Go!</h1>")
}
