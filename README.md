# Cartwish API

A backend API for an e-commerce application. This is a tutorial from Code Bless You.

<br />

## ⚙️ Installation & Setup

1.  Clone the Repository.

    ```bash
    git clone https://github.com/chesteralejandro/tutorial-cartwish-api.git
    cd tutorial-cartwish-api
    ```

2.  Intall Dependencies

    ```bash
    npm install
    ```

3.  Create a `.env` File in the Root Directory and Initialize Environment Variables

    ```env
    PORT=3000
    NODE_ENV="development"

    DATABASE_CONNECTION_STRING="<Your Database Connection>"

    TOKEN_KEY_ACCESS="<Your JWT Access Token Key>"
    TOKEN_KEY_REFRESH="<Your JWT Refresh Token Key>"

    GOOGLE_CLIENT_ID="<Your Google Client ID>"
    GOOGLE_CLIENT_SECRET="<Your Google Client Key>"

    FACEBOOK_APP_ID="<Your Facebook Client ID>"
    FACEBOOK_APP_SECRET="<Your Facebook Client Key>"
    ```

    ℹ️ Or See the `.env.example` for Reference.

4.  Start the Application

    ```bash
    npm run dev
    ```

<br />

## 💡Insights

- In Express version 5, errors are automatically handled even without wrapping everything in a try/catch block. You need to create an error handling middleware.
