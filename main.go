package main

import (
	"log"
	"net/http"
)

var port = "127.0.0.1:8081"

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/", serveIndex)
	mux.HandleFunc("/login", createJWT)
	mux.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	log.Fatal(http.ListenAndServe(port, mux))
}

func serveIndex(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "static/index.html")
}

func createJWT(w http.ResponseWriter, r *http.Request) {

}
