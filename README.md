## Welcome to TABLEAUX, a simple app to help you organize store your photos in the cloud!

Sure, you could use Google Photos, but why not use a command line app to do the same thing and feel like a total hacker? Using this app's command line interface (CLI), you can create an account, upload photos, and organize them into galleries.

**NOTE: currently, this app is under development. It is possible to create an account, but not to upload photos. Look for this functionality in the near future!**

The API will eventually be able to save photos directly to a bucket in your Amazon Web Services account (if you don't have an account, sign up for one at https://aws.amazon.com to use this API). The API uses a MongoDB database layer to keep track of photos, galleries, and users.

There will resources for this API:
  * Users: individual user accounts
  * Photos: references to individual photos, with metadata such as description, location, date, etc (coming soon!)
  * Galleries: groupings of photos and description of the gallery (coming soon!)

Each User object has 3 user-editable properties:
  * username -- required. **Must be a string.**
  * password -- required. **Must be a string.**
  * email -- required. **Must be a string.**

## How to use this API

This API is configured for use in the command line. It is set up to run on your computer's local IP (this IP can be accessed with the identifier `localhost`).

Before you can run this app, you need to set up your own environment variables locally. After you clone the app, in the command line, navigate into the root directory of the app and type `touch .env`
Paste the following information:

`PORT='8000'
MONGODB_URI='mongodb://localhost/tableaux'
APP_SECRET='secret'`

The port does not have to be 8000. Common port numbers for local development environments are 8000, 8080 and 3000. The app secret can be anything you want. Protect your app secret and never share your .env file.

You will need MongoDB installed locally. You will also need a command line http tool installed. I recommend httpie, and I assume you have it installed for this example. Instructions assume you are using port 8000.

  * In the command line, making sure you're in the root directory of your local version of the API, install the necessary dependencies for running the app by typing `npm i`
  * In a **separate** window or pane of your command line interface, start MongoDB by typing `mongod`
  * Then, start the node server by typing `npm run start`
  * Let's set up a user. In a **separate** window or pane of your command line interface (the first two are running the node server and MongoDB in the background), type `http POST localhost:8000/api/register username="yourusername" password="yourpassword" email="youremail@example.com"`
  * Let's make a login request. Type `http -a yourusername:yourpassword localhost:8000/api/login` If you get a 200 status code and an authorization token in the response log, you have successfully logged in!
  * If you get a 401 error status, check to make sure your credentials are correct and that the request was formatted correctly (note the colon separating the username and password).
  * COMING SOON: Photo uploading instructions!

Thanks for using my API. Check back soon for updates and improvements!
