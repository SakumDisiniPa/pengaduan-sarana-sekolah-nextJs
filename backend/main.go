package main

import (
	"fmt"
	"log"
	"os"

	"github.com/pocketbase/pocketbase"
)

func main() {
	// Ensure data directory exists
	if _, err := os.Stat("./pb_data"); os.IsNotExist(err) {
		if err := os.Mkdir("./pb_data", 0755); err != nil {
			log.Fatal(err)
		}
	}

	// Force "serve" command automatically
	os.Args = append(os.Args, "serve")

	app := pocketbase.New()

	fmt.Println("Starting PocketBase (embedded)...")
	fmt.Println("Admin UI: http://127.0.0.1:8090/_/")
	fmt.Println("API: http://127.0.0.1:8090/api/")

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}