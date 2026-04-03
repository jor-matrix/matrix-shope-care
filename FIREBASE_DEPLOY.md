# Firebase Hosting Deployment Guide for Matrix Shope Care

## Step 1: Prerequisites

1. **Install Firebase CLI**: Ensure that you have Node.js installed, then run the following command to install the Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ``n
2. **Firebase Account**: Sign up or log in to your Firebase account at [Firebase Console](https://console.firebase.google.com/).

## Step 2: Set Up Firebase in Your Project

1. **Navigate to your project directory**:
   ```bash
   cd path/to/your/project
   ```

2. **Initialize Firebase**: Run the command below and follow the prompts to configure Firebase for your project:
   ```bash
   firebase init
   ```
   - Choose **Hosting** from the options.
   - Select your existing Firebase project or create a new one.
   - Choose the public directory (e.g., `public` or `build`).
   - Configure as a single-page app if applicable.
   - Choose whether to overwrite `index.html`.

## Step 3: Build Your Application

1. **Build your application**: If your project requires a build step (like with React or Angular), run:
   ```bash
   npm run build
   ```

2. **Ensure your build output is in the directory specified during initialization.**

## Step 4: Deploy to Firebase Hosting

1. **Deploy your application**: Use the following command to deploy your app to Firebase Hosting:
   ```bash
   firebase deploy
   ```

2. **View your deployed site**: After deployment, you will receive a hosting URL where your application is live.
   
## Additional Notes
- Make sure to configure permissions and other settings on your Firebase console as needed.
- For updates, simply make changes to your code and re-run the `firebase deploy` command.  

## Conclusion
You have successfully deployed your application to Firebase Hosting!