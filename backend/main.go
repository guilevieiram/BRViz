package main

import (
    "encoding/json"
    "fmt"
    "net/http"
)

func createEndpoint(df DataFrame) func (http.ResponseWriter, *http.Request) {
    return func (w http.ResponseWriter, r *http.Request){

        if r.Method != http.MethodGet {
            http.Error(w, "Only GET method is supported", http.StatusMethodNotAllowed)
            return
        }

        w.Header().Set("Content-Type", "application/json")
        w.Header().Set("Access-Control-Allow-Origin", "*")
        query := r.URL.Query()

        // getting arguments
        columnNames := query["column"]
        format := query.Get("format")
        aggregateColumn := query.Get("aggregate")
        filterColumn := query.Get("filterColumn")
        filterValue := query.Get("filterValue")

        fmt.Println(
            "Get request for table ", 
            df.name, 
            " and columns: ", 
            columnNames,
            " aggregating over",
            aggregateColumn,
            " filtering over column",
            filterColumn,
            " and value",
            filterValue,
        )

        // filtering columns
        var err error
        filterDf := df

        if filterValue != "" && filterColumn != "" {
            filterDf, err = filterDf.filter(filterColumn, filterValue)
            if err != nil {
                http.Error(w, "Problem in filtering", http.StatusBadRequest)
                return
            }
        }

        if len(columnNames) > 0 {
            filterDf, err = filterDf.filterColumns(columnNames)
            if err != nil {
                http.Error(w, "Problem in filtering Columns", http.StatusBadRequest)
                return
            }
        }
        if aggregateColumn != "" {
            filterDf, err = filterDf.aggregate(aggregateColumn)
            if err != nil {
                http.Error(w, "Problem in aggregation", http.StatusBadRequest)
                return
            }
        }

        // returning format
        if format == "csv"{
            json.NewEncoder(w).Encode(filterDf.toCsv())
        } else if format == "json" {
            json.NewEncoder(w).Encode(filterDf.toMap())
        } else{
            http.Error(w, "No format provided", http.StatusBadRequest)
            return
        }

        fmt.Println(
            "Get request completed, sending ", 
            filterDf.numberColumns, 
            " columns and ", 
            filterDf.numberRows,
            " lines",
        )
    }
}


func initializeEndpoints (dataFrames []DataFrame) {
    for _, dataFrame := range dataFrames{
        http.HandleFunc("/" + dataFrame.name, createEndpoint(dataFrame))
    }
}

func main(){
    port := ":4444"

    fmt.Println("Starting a server.")

    countries := readCsv("data/PAIS.csv", "countries", ';')
    exports := readCsv("data/EXP_COMPLETE_01_NCM.csv", "exports", ';')
    ncm := readCsv("data/NCM.csv", "ncm", ';')

    initializeEndpoints([]DataFrame{countries, exports, ncm})

    fmt.Println("Listening on port ", port)

    err := http.ListenAndServe(port, nil)

    if err != nil {
        fmt.Println("Error on server.", err)
    }
}   
