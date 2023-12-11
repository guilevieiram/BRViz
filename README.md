# BRViz

Visualizing Brazil export historical data in an interactive and insightfull way.

This project was built for the **INF552 - Data Visualization** course of Ecole Polytechnique. 

The authors of this project are and *Abdoul Rahim* and *Guilherme Vieira* (me).

The data used can be found at kaggle.com/datasets/yousefmoterassed/brazil-importexport-data-from-1996-to-2023

You can visit a live demo for the project at http://18.170.60.53 . Please note that it is still unstable and at an http link.


## Running
The first step in starting the project is to download the data from the Kaggle link above and save it into `backend/data/`.
If you have a *very* good machine, you can use the whole dataset. In our case, we had to subsample it using the `backend/scripts/sample.py` script. After the subsampling, make sure you have the good file names linked in the `backend/main.go` file. Those are the files and endpoints that are going to be served in the API.

The project can be fully setted up using the provided `Makefile`. So make sure you have installed:

- `make`: to run the Makefile;
- `golang`: a compiler is needed to compile the projects backend;
- `npm`: neccessary to build javascript dependencies for the frontend.

Then, in *two* separate terminal windows, you can run the backend and frontend of the project:

- Backend: 
    ```bash
    make backend_dev
    ```
- Frontend: 
    ```bash
    make setup;
    make frontend_dev;
    ```

This will create a local backend server at port `4444` and a local frontend at port `8000`.


To access your application go to <a href="http://localhost:8000/">localhost:8000/</a>.


## Stack

This project was divided in two main parts: a *backend* and a *frontend*. 

We chose to architecht the project this way to better process all of the historical data in a more efficient way on the server, instead on relying on JS to do it.


### Backend
The backend is written in **Golang** (or Go) using the main Net library to manage the REST API.
To handle the data processing, we have written a small library to manipulate tabular data that can be found on `dataframe.go`. This module provides functionalities to: batch reading of csv data, filtering on columns, aggregating data on columns, and sending data over the API in both JSON and CSV formats.

### Frontend
The tool chosen for the frontend of this application was **React** for its responsiveness and versatility. We chose to stay in Javascript because of the limited scope of the project.


Some other libraries were used to build the application:
- *TailwindCSS*: used for styling the components.
- *ReactRouter*: used to create the routing system.
- *Vite*: bundler for the project.
- *Nivo*: Data visualization library.

