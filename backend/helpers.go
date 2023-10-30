package main

import (
    "errors"
)

func findIndex (values []string, key string) (int, error) {
    for i, v := range values {
        if key == v {
            return i, nil
        }
    }
    return -1, errors.New("Key not present in values.")
}

