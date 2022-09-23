# Getting Started with Project

**Run the server first** and client later to see the project running in it's full glory.

### Client Side

In the project directory, run:
`npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

`npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### Server Side

#### 1. Building the docker image

In the server directory within project directory, run:

`docker build -t "rn-server:Dockerfile" .`

This will create a docker image with the name **rn-server** and tag name **Dockerfile**. After running the command, you can check if the image has been created by running `docker images` cmd.

If your image **rn-server** is listed then it has been successfully built.

#### 2. Running the server

To start running the server, run the cmd:
`docker run -p 5000:5000 -d rn-server`

This will create a docker container with rn-server image running the server at **port 5000**
Access the local server at the url [http://localhost:5000/predict](http://localhost:5000/predict) .
