## Welcome to TABLEAUX, a simple app to help you organize & store your photos in the cloud!

Sure, you could use Google Photos, but why not use a command line app to do the same thing and feel like a **total hacker?** Using this app's command line interface (CLI), you can create an account, upload photos, and organize them into galleries.

**NOTE: currently, this app is under development. Right now, it is possible to create an account, but not to upload photos. Look for this functionality in the near future!**

The API will eventually be able to save photos directly to a bucket in your Amazon Web Services account (if you don't have an account, sign up for one at https://aws.amazon.com to use this API). The API uses a MongoDB database layer to keep track of photos, galleries, and users.

There will be 3 resources for this API:
  * Users: individual user accounts
  * Photos: references to individual photos, with metadata such as description, location, date, etc (coming soon!)
  * Galleries: groupings of photos and description of the gallery (coming soon!)

Each User object has 3 user-editable properties:
  * username -- required, but if left blank during setup, will default to your email. **Must be a string.**
  * password -- required. **Must be a string.**
  * email -- required. **Must be a string.**

## How to use this API

This API is configured for use in the command line. It is set up to run on your computer's local IP (this IP can be accessed with the identifier `localhost`).

Before you can run this app, you need to set up your own environment variables locally. After you clone the app, in the command line, navigate into the root directory of the app and type `touch .env`
Paste the following information:

`PORT='8000'`
`MONGODB_URI='mongodb://localhost/tableaux'`
`APP_SECRET='secret'`

The port does not have to be 8000. Common port numbers for local development environments are 8000, 8080 and 3000. The app secret can be anything you want. Protect your app secret and never share your .env file.

You will need MongoDB installed locally. You will also need a command line http tool installed. I recommend httpie, and I assume you have it installed for this example. Instructions assume you are using port 8000.

# Register/Login
  * In the command line, making sure you're in the root directory of your local version of the API, install the necessary dependencies for running the app by typing `npm i`
  * In a **separate** window or pane of your command line interface, start MongoDB by typing `mongod`
  * Then, start the node server by typing `npm run start`
  * Let's set up a user. In a **separate** window or pane of your command line interface (the first two are running the node server and MongoDB in the background), type `http POST localhost:8000/api/register username="yourusername" password="yourpassword" email="youremail@example.com"`
  * Let's make a login request. Type `http -a yourusername:yourpassword localhost:8000/api/login`
  * If you get a 200 status code and an authorization token in the response log, you have successfully logged in!
  * If you get a 401 error status, check to make sure your credentials are correct and that the request was formatted correctly (note the colon separating the username and password).

# Galleries
  * Let's add a new gallery. **NOTE: For each of the following instructions for making requests to galleries, in the example code, replace 'my-token' with the copy-pasted token you got when you logged in for each session.** Type `http POST :8000/api/gallery galleryName="Harrison Hot Springs" description="hanging out at the hot springs" "Authorization:Bearer my-token"`
  * You should see your new gallery logged as a JSON object.
  * If you get a 401 error status, make sure you copy-pasted the token exactly, or try logging in again, which will give you a new token, and use the new token.
  * Let's view the gallery by making a GET request. Making sure you're still logged in and have an active token, type `http :8000/api/gallery/my-gallery-id "Authorization: Bearer my-token"` **NOTE: The my-gallery-id parameter in the url should be replaced with the id string for the gallery that was logged when it was first created.**
  * Need to look up the ids for your galleries? Type `http :8000/api/galleries "Authorization:Bearer my-token"` ...this will return an array of gallery id strings, which you can copy-paste into GET requests for individual galleries.
  * Need to update a gallery name or description? Type `http PUT :8000/api/gallery/my-gallery-id description="this description has been changed" "Authorization:Bearer my-token"` ...you can update name only, description only, or both in the same request.
  * Need to delete a gallery? Type `http DELETE :8000/api/gallery/my-gallery-id "Authorization:Bearer my-token"`

# Uploading Photos
  * COMING SOON: Photo uploading instructions!

Thanks for using my API. Check back soon for updates and improvements!
