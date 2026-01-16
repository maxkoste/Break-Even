// package services does services for human kind
package services

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

type CelestialData struct {
	Bodies map[string]string
	MoonPhase string
}

func FetchCelestialData() (*CelestialData, error) {
    appID := os.Getenv("ASTRONOMY_APP_ID")
    appSecret := os.Getenv("ASTRONOMY_APP_SECRET")

    if appID == "" || appSecret == "" {
        return nil, fmt.Errorf("ASTRONOMY_APP_ID or ASTRONOMY_APP_SECRET not set")
    }

	authStr := base64.StdEncoding.EncodeToString([]byte(fmt.Sprintf("%s:%s", appID, appSecret)))
    url := "https://api.astronomyapi.com/api/v2/bodies/positions"

    today := time.Now().Format("2006-01-02")
    currentTime := time.Now().Format("15:04:05")

    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        return nil, err
    }

    q := req.URL.Query()
    q.Add("latitude", "55.6050")
    q.Add("longitude", "13.0038")
    q.Add("elevation", "12")
    q.Add("from_date", today)
    q.Add("to_date", today)
    q.Add("time", currentTime)
    req.URL.RawQuery = q.Encode()

    req.Header.Set("Authorization", "Basic "+authStr)

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    body, _ := io.ReadAll(resp.Body)

    var jsonResp map[string]any
    if err := json.Unmarshal(body, &jsonResp); err != nil {
        return nil, err
    }

    results := make(map[string]string)
    moonPhase := ""

    if data, ok := jsonResp["data"].(map[string]any); ok {
        if table, ok := data["table"].(map[string]any); ok {
            if rows, ok := table["rows"].([]any); ok {
                for _, row := range rows {
                    r := row.(map[string]any)
                    entry := r["entry"].(map[string]any)
                    name := entry["name"].(string)
                    cell := r["cells"].([]any)[0].(map[string]any)
                    pos := cell["position"].(map[string]any)
                    constel := pos["constellation"].(map[string]any)["name"].(string)
                    results[name] = constel

                    if entry["id"] == "moon" {
                        if extraInfo, ok := cell["extraInfo"].(map[string]any); ok {
                            if phase, ok := extraInfo["phase"].(map[string]any)["string"].(string); ok {
                                moonPhase = phase
                            }
                        }
                    }
                }
            }
        }
    }

    return &CelestialData{
        Bodies:    results,
        MoonPhase: moonPhase,
    }, nil
}
